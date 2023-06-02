import { startMeasurement } from '@universal-packages/time-measurer'

import Core from '../Core'

export async function loadAndSetCoreModules(): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    const [loadedCoreModules, warnings] = await Core.getCoreModules(core.coreConfig, core.projectConfig, core.logger)

    core.coreModules = loadedCoreModules

    for (let i = 0; i < warnings.length; i++) {
      const currentWarning = warnings[i]
      core.logger.publish('WARNING', currentWarning.title, currentWarning.message, 'CORE')
    }

    core.logger.publish('DEBUG', 'Core modules loaded', null, 'CORE', { measurement: measurer.finish().toString() })
  } catch (error) {
    core.logger.publish('ERROR', 'There was an error loading core modules', null, 'CORE', {
      error: error,
      measurement: measurer.finish().toString()
    })

    await core.logger.await()
    return true
  }

  return false
}
