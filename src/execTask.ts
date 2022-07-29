import TimeMeasurer, { startMeasurement } from '@universal-packages/time-measurer'
import { paramCase, pascalCase } from 'change-case'
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
    logger: null,
    projectConfig: null,
    stopping: null,
    Task: null,
    taskConfig: null,
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
    process.exit(1)
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
    process.exit(1)
  }

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
    process.exit(1)
  }

  try {
    const pascalCaseName = pascalCase(name)
    const paramCaseName = paramCase(name)

    core.Task = await CoreTask.find(name, core.coreConfig)

    core.taskConfig = core.projectConfig[pascalCaseName] || core.projectConfig[paramCaseName]
    core.taskInstance = new core.Task(core.appConfig, directive, directiveOptions, args, core.logger, core.coreModules)
    if (core.taskInstance.prepare) await core.taskInstance.prepare()
  } catch (error) {
    core.logger.publish('ERROR', 'There was an error loading the app', null, 'CORE', {
      error: error,
      measurement: measurer.finish().toString()
    })

    await core.logger.await()
    process.exit(1)
  }

  const abortTask = async (): Promise<void> => {
    process.stdout.clearLine(0)
    process.stdout.cursorTo(0)

    if (core.stopping) process.exit(0)

    core.logger.publish('INFO', 'Aborting task gracefully', 'press CTRL+C again to kill', 'CORE')

    core.stopping = true

    try {
      await core.taskInstance.abort()
    } catch (error) {
      core.logger.publish('ERROR', core.Task.appName || core.Task.name, 'There was an error while aborting task', 'CORE', { error })
      await core.logger.await()
      process.exit(1)
    }

    try {
      await Core.releaseInternalModules(core.coreModules)
      core.logger.publish('DEBUG', 'Core modules unloaded', null, 'CORE')
    } catch (error) {
      core.logger.publish('ERROR', core.Task.appName || core.Task.name, 'There was an error while unloading modules', 'CORE', { error })
      await core.logger.await()
      process.exit(1)
    }
  }

  process.addListener('SIGINT', abortTask)
  process.addListener('SIGTERM', abortTask)

  core.logger.publish('INFO', `${core.Task.appName || core.Task.name} executing...`, core.Task.description, 'CORE')

  try {
    await core.taskInstance.exec()
  } catch (error) {
    core.logger.publish('ERROR', core.Task.appName || core.Task.name, 'There was an error while executing task', 'CORE', { error })

    await core.logger.await()
    process.exit(1)
  }
}
