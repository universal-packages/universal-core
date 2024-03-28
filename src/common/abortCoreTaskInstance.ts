import { startMeasurement } from '@universal-packages/time-measurer'

import Core from '../Core'
import { LOG_CONFIGURATION } from './terminal-presenter/LOG_CONFIGURATION'
import { releaseLogger } from './releaseLogger'

export async function abortCoreTaskInstance(throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  if (core.taskInstance.abort) {
    try {
      await core.taskInstance.abort()
      core.logger.log(
        {
          level: 'DEBUG',
          title: 'Task aborted',
          category: 'CORE',
          measurement: measurer.finish()
        },
        LOG_CONFIGURATION
      )
    } catch (error) {
      core.logger.log(
        {
          level: 'ERROR',
          message: 'There was an error while aborting task',
          category: 'CORE',
          error
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
  }

  return false
}
