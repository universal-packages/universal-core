import { startMeasurement } from '@universal-packages/time-measurer'

import Core from '../Core'
import { LOG_CONFIGURATION } from './terminal-presenter/LOG_CONFIGURATION'
import { releaseLogger } from './releaseLogger'

export async function execCoreTaskInstance(throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    core.logger.log(
      {
        level: 'INFO',
        title: `${core.Task.taskName || core.Task.name} executing...`,
        message: core.Task.description,
        category: 'CORE'
      },
      LOG_CONFIGURATION
    )

    await core.taskInstance.exec()

    core.logger.log(
      {
        level: 'DEBUG',
        title: `${core.Task.taskName || core.Task.name} executed`,
        message: core.Task.description,
        category: 'CORE',
        measurement: measurer.finish()
      },
      LOG_CONFIGURATION
    )
  } catch (error) {
    core.logger.log(
      {
        level: 'ERROR',
        title: `There was an error while executing task ${core.Task.taskName || core.Task.name}`,
        category: 'CORE',
        error,
        measurement: measurer.finish()
      },
      LOG_CONFIGURATION
    )

    try {
      await Core.releaseInternalModules(core.coreModules)
    } catch (err) {
      // We prioritize higher error
    }

    await releaseLogger()

    if (throwError) throw error
    return true
  }

  return false
}
