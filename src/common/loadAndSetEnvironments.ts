import { startMeasurement } from '@universal-packages/time-measurer'

import Core from '../Core'
import { ProcessType } from '../Core.types'

export async function loadAndSetEnvironments(processType: ProcessType, processableName?: string): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    const environments = await Core.getCoreEnvironments(core.coreConfig, core.logger, processType, processableName)

    core.environments = environments

    core.logger.publish('DEBUG', 'Core environments loaded', null, 'CORE', { measurement: measurer.finish().toString() })
  } catch (error) {
    core.logger.publish('ERROR', 'There was an error loading core environments', null, 'CORE', {
      error: error,
      measurement: measurer.finish().toString()
    })

    await core.logger.await()
    return true
  }

  return false
}
