import { startMeasurement } from '@universal-packages/time-measurer'

import { releaseLoggerAndPresenter } from './releaseLoggerAndPresenter'
import { LOG_CONFIGURATION } from './terminal-presenter/LOG_CONFIGURATION'

export async function runCoreInitializerInstance(throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    core.logger.log(
      {
        level: 'INFO',
        title: `Initializing ${core.Initializer.initializerName || core.Initializer.name}...`,
        message: core.Initializer.description,
        category: 'CORE'
      },
      LOG_CONFIGURATION
    )

    await core.initializerInstance.run()

    core.logger.log(
      {
        level: 'DEBUG',
        title: `${core.Initializer.initializerName || core.Initializer.name} initialized`,
        message: core.Initializer.description,
        category: 'CORE',
        measurement: measurer.finish()
      },
      LOG_CONFIGURATION
    )
  } catch (error) {
    core.logger.log(
      {
        level: 'ERROR',
        title: `There was an error while initializing ${core.Initializer.initializerName || core.Initializer.name}`,
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
