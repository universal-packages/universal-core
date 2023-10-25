import { startMeasurement } from '@universal-packages/time-measurer'

import Core from '../Core'
import { CoreConfig } from '../Core.types'

export async function loadAndSetCoreConfig(coreConfigOverride: CoreConfig, throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    core.coreConfig = await Core.getCoreConfig(coreConfigOverride)

    core.logger.publish('DEBUG', 'Core config loaded', null, 'CORE', { metadata: core.coreConfig, measurement: measurer.finish().toString() })
  } catch (error) {
    core.logger.publish('ERROR', 'There was an error loading the core config', null, 'CORE', {
      error: error,
      measurement: measurer.finish().toString()
    })

    await core.logger.await()

    if (throwError) throw error
    return true
  }

  return false
}
