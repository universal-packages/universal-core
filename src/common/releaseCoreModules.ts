import { startMeasurement } from '@universal-packages/time-measurer'

import Core from '../Core'
import { releaseLoggerAndPresenter } from './releaseLoggerAndPresenter'
import { LOG_CONFIGURATION } from './terminal-presenter/LOG_CONFIGURATION'

export async function releaseCoreModules(allowLoadModules: boolean, throwError?: boolean): Promise<boolean> {
  if (!allowLoadModules) {
    core.coreModules = {}
    return false
  }

  const measurer = startMeasurement()

  try {
    await Core.releaseInternalModules(core.coreModules)
    core.logger.log(
      {
        level: 'DEBUG',
        title: 'Core modules unloaded',
        category: 'CORE',
        measurement: measurer.finish()
      },
      LOG_CONFIGURATION
    )
  } catch (error) {
    core.logger.log(
      {
        level: 'ERROR',
        title: 'There was an error while releasing modules',
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
