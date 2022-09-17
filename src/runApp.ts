import { sleep, startMeasurement, TimeMeasurer } from '@universal-packages/time-measurer'
import { paramCase, pascalCase } from 'change-case'
import Core from './Core'
import { CoreConfig } from './Core.types'
import CoreApp from './CoreApp'
import AppWatcher from './AppWatcher'

export async function runApp(name: string, args: Record<string, any>, demon?: boolean, coreConfigOveride?: CoreConfig): Promise<void> {
  let measurer: TimeMeasurer

  global.core = {
    App: null,
    appConfig: null,
    appInstance: null,
    coreConfig: null,
    coreModules: null,
    loaded: false,
    logger: null,
    projectConfig: null,
    running: false,
    stopping: false,
    Task: null,
    taskInstance: null
  }

  try {
    measurer = startMeasurement()

    core.coreConfig = await CoreApp.getCoreConfig(coreConfigOveride)
    core.logger = CoreApp.getCoreLogger(core.coreConfig)

    core.logger.publish('DEBUG', 'Core config loaded', null, 'CORE', { metadata: core.coreConfig, measurement: measurer.finish().toString() })
  } catch (error) {
    core.logger = CoreApp.getCoreLogger()

    core.logger.publish('ERROR', 'There was an error loading the core config', null, 'CORE', {
      error: error,
      measurement: measurer.finish().toString()
    })

    await core.logger.await()
    return process.exit(1)
  }

  if (!demon && core.coreConfig.appWatcher?.enabled) {
    core.logger.publish('INFO', 'App Watcher enabled', 'App will be ran in a sub process', 'CORE')

    if (process.env['NODE_ENV'] !== 'development') {
      core.logger.publish('WARNING', 'Watch and reload is mean only for development', 'Consider deactivating it for not development environments', 'CORE')
    }

    const appWatcher = new AppWatcher(name, args, core.coreConfig.appWatcher?.ignore)

    appWatcher.run()

    appWatcher.on('restart', (files: string[]): void => {
      core.logger.publish('QUERY', 'Reloading..', files.join('\n'), 'CORE')
    })

    const stopWatcher = (): void => {
      if (process.stdout.clearLine) process.stdout.clearLine(0)
      if (process.stdout.cursorTo) process.stdout.cursorTo(0)

      if (core.stopping) {
        appWatcher.kill()
        process.exit(0)
      }

      core.stopping = true

      appWatcher.stop()
    }

    process.addListener('SIGINT', stopWatcher)
    process.addListener('SIGTERM', stopWatcher)
  } else {
    try {
      measurer = startMeasurement()
      core.projectConfig = await CoreApp.getProjectConfig(core.coreConfig)

      core.logger.publish('DEBUG', 'Project config loaded', null, 'CORE', { metadata: core.projectConfig, measurement: measurer.finish().toString() })
    } catch (error) {
      core.logger.publish('ERROR', 'There was an error loading the project config', null, 'CORE', {
        error: error,
        measurement: measurer.finish().toString()
      })

      await core.logger.await()
      return process.exit(1)
    }

    const stopApp = async (restarting: boolean = false): Promise<void> => {
      // We are already restating-stopping
      // we only exit the process at ctrl+c (SIGABRT)
      if (restarting && core.stopping) return

      if (process.stdout.clearLine) process.stdout.clearLine(0)
      if (process.stdout.cursorTo) process.stdout.cursorTo(0)

      if (core.stopping) return process.exit(0)

      if (!restarting) {
        core.logger.publish('INFO', 'Stopping app gracefully', 'press CTRL+C again to kill', 'CORE')
      }

      core.stopping = true

      // To trully stop the app gracefully we need to whait for it be running and the start releasing everything
      // Im just thinkind about the children and DB connections and stuff like that will end dirty if we just exit the process
      // but who knows, I am going safe for now, if this is too much we can change later
      while (!core.running) await sleep(100)

      try {
        await core.appInstance.stop()
      } catch (error) {
        core.logger.publish('ERROR', core.App.appName || core.App.name, 'There was an error while stoppig app', 'CORE', { error })

        try {
          await CoreApp.releaseInternalModules(core.coreModules)
        } catch (err) {
          // We prioritize higher error
        }

        await core.logger.await()
        return process.exit(1)
      }
      if (core.appInstance.release) {
        try {
          await core.appInstance.release()
        } catch (error) {
          core.logger.publish('ERROR', core.App.appName || core.App.name, 'There was an error while relaasing app', 'CORE', { error })

          try {
            await CoreApp.releaseInternalModules(core.coreModules)
          } catch (err) {
            // We prioritize higher error
          }

          await core.logger.await()
          return process.exit(1)
        }
      }

      try {
        await Core.releaseInternalModules(core.coreModules)
        core.logger.publish('DEBUG', 'Core modules unloaded', null, 'CORE')
      } catch (error) {
        core.logger.publish('ERROR', core.App.appName || core.App.name, 'There was an error while unloading modules', 'CORE', { error })
        await core.logger.await()
        return process.exit(1)
      }
    }

    if (demon) {
      process.addListener('SIGALRM', stopApp.bind(null, true))
      process.addListener('SIGABRT', stopApp.bind(null, false))
      process.addListener('SIGINT', () => {})
      process.addListener('SIGTERM', () => {})
    } else {
      process.addListener('SIGINT', stopApp.bind(null, false))
      process.addListener('SIGTERM', stopApp.bind(null, false))
    }

    try {
      measurer = startMeasurement()
      const [loadedCoreModules, warnings] = await CoreApp.getCoreModules(core.coreConfig, core.projectConfig, core.logger)

      core.coreModules = loadedCoreModules

      for (let i = 0; i < warnings.length; i++) {
        const currentWarning = warnings[i]
        core.logger.publish('WARNING', currentWarning.title, currentWarning.message, 'CORE')
      }

      core.logger.publish('DEBUG', 'Core modules loaded', null, 'CORE', { measurement: measurer.finish().toString() })
    } catch (error) {
      core.logger.publish('ERROR', 'There was an error loading core modules', null, 'CORE', {
        error: error,
        measurement: measurer.finish().toString()
      })

      await core.logger.await()
      return process.exit(1)
    }

    try {
      const pascalCaseName = pascalCase(name)
      const paramCaseName = paramCase(name)

      core.App = await CoreApp.find(name, core.coreConfig)

      core.appConfig = core.projectConfig[pascalCaseName] || core.projectConfig[paramCaseName] || core.projectConfig[core.App.appName]
      core.appInstance = new core.App({ ...core.App.defaultConfig, ...core.appConfig }, args, core.logger, core.coreModules)
      if (core.appInstance.prepare) await core.appInstance.prepare()
    } catch (error) {
      core.logger.publish('ERROR', 'There was an error loading the app', null, 'CORE', {
        error: error,
        measurement: measurer.finish().toString()
      })

      try {
        await CoreApp.releaseInternalModules(core.coreModules)
      } catch (err) {
        // We prioritize higher error
      }

      await core.logger.await()
      return process.exit(1)
    }

    core.loaded = true

    core.logger.publish('INFO', `${core.App.appName || core.App.name} running...`, core.App.description, 'CORE')

    try {
      await core.appInstance.run()
    } catch (error) {
      core.logger.publish('ERROR', core.App.appName || core.App.name, 'There was an error while running app', 'CORE', { error })

      try {
        await CoreApp.releaseInternalModules(core.coreModules)
      } catch (err) {
        // We prioritize higher error
      }

      await core.logger.await()

      return process.exit(1)
    }

    // Now we are running
    core.running = true
  }
}
