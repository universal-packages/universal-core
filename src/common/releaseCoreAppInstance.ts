import { startMeasurement } from '@universal-packages/time-measurer'

import CoreApp from '../CoreApp'
import { LOG_CONFIGURATION } from './terminal-presenter/LOG_CONFIGURATION'
import { releaseLogger } from './releaseLogger'

export async function releaseCoreAppInstance(throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  if (core.appInstance.release) {
    try {
      await core.appInstance.release()
      core.logger.log(
        {
          level: 'DEBUG',
          title: 'App released',
          category: 'CORE',
          measurement: measurer.finish()
        },
        LOG_CONFIGURATION
      )
    } catch (error) {
      core.logger.log(
        {
          level: 'ERROR',
          title: 'There was an error while releasing app',
          category: 'CORE',
          error,
          measurement: measurer.finish()
        },
        LOG_CONFIGURATION
      )

      try {
        await CoreApp.releaseInternalModules(core.coreModules)
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
