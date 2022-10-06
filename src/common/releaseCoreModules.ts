import { startMeasurement } from '@universal-packages/time-measurer'
import Core from '../Core'

export async function releaseCoreModules(): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    await Core.releaseInternalModules(core.coreModules)
    core.logger.publish('DEBUG', 'Core modules unloaded', null, 'CORE', { measurement: measurer.finish().toString() })
  } catch (error) {
    core.logger.publish('ERROR', 'There was an error while releasing modules', null, 'CORE', { error })
    await core.logger.await()
    return true
  }

  return false
}
