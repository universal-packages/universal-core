import { startMeasurement } from '@universal-packages/time-measurer'

import { EnvironmentEvent } from '../Core.types'

export async function emitEnvironmentEvent(event: EnvironmentEvent): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    for (let i = 0; i < core.environments.length; i++) {
      const currentEnvironment = core.environments[i]
      if (currentEnvironment[event]) await currentEnvironment[event]()
    }
  } catch (error) {
    core.logger.publish('ERROR', 'There was an error calling environment event', null, 'CORE', {
      error: error,
      metadata: { event },
      measurement: measurer.finish().toString()
    })

    await core.logger.await()
    return true
  }

  return false
}
