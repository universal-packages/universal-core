import { startMeasurement } from '@universal-packages/time-measurer'

import CoreApp from '../CoreApp'

export async function releaseCoreAppInstance(throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  if (core.appInstance.release) {
    try {
      await core.appInstance.release()
      core.logger.publish('DEBUG', 'App released', null, 'CORE', { measurement: measurer.finish().toString() })
    } catch (error) {
      core.logger.publish('ERROR', core.App.appName || core.App.name, 'There was an error while releasing app', 'CORE', { error })

      try {
        await CoreApp.releaseInternalModules(core.coreModules)
      } catch (err) {
        // We prioritize higher error
      }

      await core.logger.await()

      if (throwError) throw error
      return true
    }
  }

  return false
}
