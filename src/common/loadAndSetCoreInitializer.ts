import { startMeasurement } from '@universal-packages/time-measurer'

import CoreInitializer from '../CoreInitializer'
import { releaseLoggerAndPresenter } from './releaseLoggerAndPresenter'
import { LOG_CONFIGURATION } from './terminal-presenter/LOG_CONFIGURATION'

export async function loadAndSetCoreInitializer(name: string, args: Record<string, any>, locationOverride?: string, throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    core.Initializer = await CoreInitializer.find(name, locationOverride)
    core.initializerInstance = new core.Initializer(args, core.logger)
  } catch (error) {
    core.logger.log(
      {
        level: 'ERROR',
        title: 'There was an error loading the initializer',
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
