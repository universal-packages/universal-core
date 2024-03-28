import { startMeasurement } from '@universal-packages/time-measurer'

import CoreApp from '../CoreApp'
import { LOG_CONFIGURATION } from './LOG_CONFIGURATION'
import { releaseLogger } from './releaseLogger'

export async function stopCoreAppInstance(throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    await core.appInstance.stop()
    core.logger.log(
      {
        level: 'DEBUG',
        title: 'App stopped',
        category: 'CORE',
        measurement: measurer.finish()
      },
      LOG_CONFIGURATION
    )
  } catch (error) {
    core.logger.log(
      {
        level: 'ERROR',
        title: 'There was an error while stopping app',
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

  return false
}
