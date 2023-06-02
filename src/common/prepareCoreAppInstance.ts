import { startMeasurement } from '@universal-packages/time-measurer'

import CoreApp from '../CoreApp'

export async function prepareCoreAppInstance(): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    if (core.appInstance.prepare) await core.appInstance.prepare()
    core.logger.publish('DEBUG', 'App prepared', null, 'CORE', { measurement: measurer.finish().toString() })
  } catch (error) {
    core.logger.publish('ERROR', 'There was an error preparing the app', null, 'CORE', {
      error: error,
      measurement: measurer.finish().toString()
    })

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
