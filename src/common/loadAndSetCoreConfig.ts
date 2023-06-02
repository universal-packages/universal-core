import { startMeasurement } from '@universal-packages/time-measurer'

import Core from '../Core'
import { CoreConfig } from '../Core.types'

export async function loadAndSetCoreConfig(coreConfigOverride: CoreConfig): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    core.coreConfig = await Core.getCoreConfig(coreConfigOverride)
    core.logger = Core.getCoreLogger(core.coreConfig)

    core.logger.publish('DEBUG', 'Core config loaded', null, 'CORE', { metadata: core.coreConfig, measurement: measurer.finish().toString() })
  } catch (error) {
    core.logger = Core.getCoreLogger()

    core.logger.publish('ERROR', 'There was an error loading the core config', null, 'CORE', {
      error: error,
      measurement: measurer.finish().toString()
    })

    await core.logger.await()
    return true
  }

  return false
}
