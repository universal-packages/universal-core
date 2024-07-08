import { startMeasurement } from '@universal-packages/time-measurer'

import CoreApp from '../CoreApp'
import { releaseLoggerAndPresenter } from './releaseLoggerAndPresenter'
import { LOG_CONFIGURATION } from './terminal-presenter/LOG_CONFIGURATION'

export async function loadCoreApp(name: string, throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    core.App = await CoreApp.find(name, core.coreConfig)
  } catch (error) {
    core.logger.log(
      {
        level: 'ERROR',
        title: 'There was an error loading the app',
        category: 'CORE',
        error,
        measurement: measurer.finish()
      },
      LOG_CONFIGURATION
    )

    await releaseLoggerAndPresenter()

    if (throwError) throw error
    return true
  }

  return false
}
