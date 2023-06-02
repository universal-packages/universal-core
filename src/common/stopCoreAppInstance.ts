import { startMeasurement } from '@universal-packages/time-measurer'

import CoreApp from '../CoreApp'

export async function stopCoreAppInstance(): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    await core.appInstance.stop()
    core.logger.publish('DEBUG', 'App stopped', null, 'CORE', { measurement: measurer.finish().toString() })
  } catch (error) {
    core.logger.publish('ERROR', core.App.appName || core.App.name, 'There was an error while stopping app', 'CORE', { error })

    try {
      await CoreApp.releaseInternalModules(core.coreModules)
    } catch (err) {
      // We prioritize higher error
    }

    await core.logger.await()
    return true
  }

  return false
}
