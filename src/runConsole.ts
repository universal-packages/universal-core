import TimeMeasurer, { startMeasurement } from '@universal-packages/time-measurer'
import Core from './Core'
import { CoreConfig } from './Core.types'

export async function runConsole(coreConfigOveride?: CoreConfig): Promise<void> {
  let measurer: TimeMeasurer

  global.core = {
    App: null,
    appConfig: null,
    appInstance: null,
    coreConfig: null,
    coreModules: null,
    logger: null,
    projectConfig: null,
    running: false,
    stopping: false,
    Task: null,
    taskConfig: null,
    taskInstance: null
  }

  try {
    measurer = startMeasurement()

    core.coreConfig = await Core.getCoreConfig(coreConfigOveride)
    core.logger = Core.getCoreLogger(core.coreConfig)

    core.logger.publish('DEBUG', 'Core config loaded', null, 'CORE', { metadata: core.coreConfig, measurement: measurer.finish().toString() })
  } catch (error) {
    core.logger = Core.getCoreLogger()

    core.logger.publish('ERROR', 'There was an error loading the core config', null, 'CORE', {
      error: error,
      measurement: measurer.finish().toString()
    })

    await core.logger.await()
    process.exit(1)
  }

  try {
    measurer = startMeasurement()
    core.projectConfig = await Core.getProjectConfig(core.coreConfig)

    core.logger.publish('DEBUG', 'Project config loaded', null, 'CORE', { metadata: core.projectConfig, measurement: measurer.finish().toString() })
  } catch (error) {
    core.logger.publish('ERROR', 'There was an error loading the project config', null, 'CORE', {
      error: error,
      measurement: measurer.finish().toString()
    })

    await core.logger.await()
    process.exit(1)
  }

  try {
    measurer = startMeasurement()
    const [loadedCoreModules, warnings] = await Core.getCoreModules(core.coreConfig, core.projectConfig, core.logger)

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
    process.exit(1)
  }

  core.logger.publish('DEBUG', 'running console...', null, 'CORE')

  try {
    const repl = await import('repl')

    await core.logger.await()

    // We just start a repl server it even has its own termination CTRL+C
    const replServer = repl.start({ prompt: 'core > ' })
    replServer.setupHistory('./.console_history', (error: Error): void => {
      if (error) throw error
    })

    // We emit this so the Core knows the user basically sent those signals
    replServer.on('exit', async (): Promise<void> => {
      core.stopping = true

      try {
        await Core.releaseInternalModules(core.coreModules)
        core.logger.publish('DEBUG', 'Core modules unloaded', null, 'CORE')
      } catch (error) {
        core.logger.publish('ERROR', core.App.appName || core.App.name, 'There was an error while unloading modules', 'CORE', { error })
        await core.logger.await()
        process.exit(1)
      }
    })
  } catch (error) {
    core.logger.publish('ERROR', 'Console', 'There was an error while running the console', 'CORE', { error })

    await core.logger.await()
    process.exit(1)
  }
}
