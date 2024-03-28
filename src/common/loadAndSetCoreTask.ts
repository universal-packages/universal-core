import { startMeasurement } from '@universal-packages/time-measurer'

import CoreTask from '../CoreTask'
import { LOG_CONFIGURATION } from './terminal-presenter/LOG_CONFIGURATION'
import { releaseLoggerAndPresenter } from './releaseLoggerAndPresenter'

export async function loadAndSetCoreTask(name: string, directive: string, directiveOptions: string[], args: Record<string, any>, throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    core.Task = await CoreTask.find(name, core.coreConfig)
    core.taskInstance = new core.Task(directive, directiveOptions, args, core.logger)
  } catch (error) {
    core.logger.log(
      {
        level: 'ERROR',
        title: 'There was an error loading the task',
        category: 'CORE',
        error,
        measurement: measurer.finish()
      },
      LOG_CONFIGURATION
    )

    try {
      await CoreTask.releaseInternalModules(core.coreModules)
    } catch (err) {
      // We prioritize higher error
    }

    await releaseLoggerAndPresenter()

    if (throwError) throw error
    return true
  }

  return false
}
