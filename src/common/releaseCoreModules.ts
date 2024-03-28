import { startMeasurement } from '@universal-packages/time-measurer'

import Core from '../Core'
import { LOG_CONFIGURATION } from './LOG_CONFIGURATION'
import { releaseLogger } from './releaseLogger'

export async function releaseCoreModules(throwError?: boolean): Promise<boolean> {
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

    await releaseLogger()

    if (throwError) throw error
    return true
  }

  return false
}
