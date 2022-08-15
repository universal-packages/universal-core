import { sleep, startMeasurement, TimeMeasurer } from '@universal-packages/time-measurer'
import Core from './Core'
import { CoreConfig } from './Core.types'
import CoreTask from './CoreTask'

export async function execTask(name: string, directive: string, directiveOptions: string[], args: Record<string, any>, coreConfigOveride?: CoreConfig): Promise<void> {
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

    core.coreConfig = await CoreTask.getCoreConfig(coreConfigOveride)
    core.logger = CoreTask.getCoreLogger(core.coreConfig)

    core.logger.publish('DEBUG', 'Core config loaded', null, 'CORE', { metadata: core.coreConfig, measurement: measurer.finish().toString() })
  } catch (error) {
    core.logger = CoreTask.getCoreLogger()

    core.logger.publish('ERROR', 'There was an error loading the core config', null, 'CORE', {
      error: error,
      measurement: measurer.finish().toString()
    })

    await core.logger.await()
    return process.exit(1)
  }

  try {
    measurer = startMeasurement()
    core.projectConfig = await CoreTask.getProjectConfig(core.coreConfig)

    core.logger.publish('DEBUG', 'Project config loaded', null, 'CORE', { metadata: core.projectConfig, measurement: measurer.finish().toString() })
  } catch (error) {
    core.logger.publish('ERROR', 'There was an error loading the project config', null, 'CORE', {
      error: error,
      measurement: measurer.finish().toString()
    })

    await core.logger.await()
    return process.exit(1)
  }

  const abortTask = async (): Promise<void> => {
    if (process.stdout.clearLine) process.stdout.clearLine(0)
    if (process.stdout.cursorTo) process.stdout.cursorTo(0)

    if (core.stopping) return process.exit(0)
    core.stopping = true

    core.logger.publish('INFO', 'Aborting task gracefully', 'press CTRL+C again to kill', 'CORE')

    while (!core.loaded) await sleep(100)

    try {
      await core.taskInstance.abort()
    } catch (error) {
      core.logger.publish('ERROR', core.Task.appName || core.Task.name, 'There was an error while aborting task', 'CORE', { error })

      try {
        await CoreTask.releaseInternalModules(core.coreModules)
      } catch (err) {
        // We prioritize higher error
      }

      await core.logger.await()
      return process.exit(1)
    }
  }

  process.addListener('SIGINT', abortTask)
  process.addListener('SIGTERM', abortTask)

  try {
    measurer = startMeasurement()
    const [loadedCoreModules, warnings] = await CoreTask.getCoreModules(core.coreConfig, core.projectConfig, core.logger)

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
    core.Task = await CoreTask.find(name, core.coreConfig)

    core.taskInstance = new core.Task(directive, directiveOptions, args, core.logger, core.coreModules)
    if (core.taskInstance.prepare) await core.taskInstance.prepare()
  } catch (error) {
    core.logger.publish('ERROR', 'There was an error loading the app', null, 'CORE', {
      error: error,
      measurement: measurer.finish().toString()
    })

    try {
      await CoreTask.releaseInternalModules(core.coreModules)
    } catch (err) {
      // We prioritize higher error
    }

    await core.logger.await()
    return process.exit(1)
  }

  core.loaded = true

  core.logger.publish('INFO', `${core.Task.appName || core.Task.name} executing...`, core.Task.description, 'CORE')

  try {
    await core.taskInstance.exec()

    // We release here since the aborting will ultimatelly end the execution
    try {
      await Core.releaseInternalModules(core.coreModules)
      core.logger.publish('DEBUG', 'Core modules unloaded', null, 'CORE')
    } catch (error) {
      core.logger.publish('ERROR', core.Task.appName || core.Task.name, 'There was an error while unloading modules', 'CORE', { error })

      await core.logger.await()
      return process.exit(1)
    }
  } catch (error) {
    core.logger.publish('ERROR', core.Task.appName || core.Task.name, 'There was an error while executing task', 'CORE', { error })

    try {
      await CoreTask.releaseInternalModules(core.coreModules)
    } catch (err) {
      // We prioritize higher error
    }

    await core.logger.await()
    return process.exit(1)
  }
}
