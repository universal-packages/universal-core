import { startMeasurement } from '@universal-packages/time-measurer'

import CoreApp from '../CoreApp'
import { LOG_CONFIGURATION } from './terminal-presenter/LOG_CONFIGURATION'
import { releaseLoggerAndPresenter } from './releaseLoggerAndPresenter'

export async function prepareCoreAppInstance(throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    if (core.appInstance.prepare) await core.appInstance.prepare()
    core.logger.log(
      {
        level: 'DEBUG',
        title: 'App prepared',
        category: 'CORE',
        measurement: measurer.finish()
      },
      LOG_CONFIGURATION
    )
  } catch (error) {
    core.logger.log(
      {
        level: 'ERROR',
        title: 'There was an error preparing the app',
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

    await releaseLoggerAndPresenter()

    if (throwError) throw error
    return true
  }

  return false
}
