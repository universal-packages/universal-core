import { startMeasurement } from '@universal-packages/time-measurer'

import Core from '../Core'
import { CoreConfig } from '../Core.types'
import { LOG_CONFIGURATION } from './LOG_CONFIGURATION'
import { adjustCoreLogger } from './adjustCoreLogger'
import { releaseLogger } from './releaseLogger'

export async function loadAndSetCoreConfig(coreConfigOverride: CoreConfig, throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    core.coreConfig = await Core.getCoreConfig(coreConfigOverride)

    await adjustCoreLogger()

    core.logger.log(
      {
        level: 'DEBUG',
        title: 'Core config loaded',
        category: 'CORE',
        metadata: core.coreConfig,
        measurement: measurer.finish()
      },
      LOG_CONFIGURATION
    )
  } catch (error) {
    core.logger.log(
      {
        level: 'ERROR',
        title: 'There was an error loading the core config',
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
