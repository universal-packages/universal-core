import { startMeasurement } from '@universal-packages/time-measurer'

import { EnvironmentEvent } from '../Core.types'
import { LOG_CONFIGURATION } from './LOG_CONFIGURATION'
import { releaseLogger } from './releaseLogger'

export async function emitEnvironmentEvent(event: EnvironmentEvent, throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    for (let i = 0; i < core.environments.length; i++) {
      const currentEnvironment = core.environments[i]
      if (currentEnvironment[event]) await currentEnvironment[event]()
    }
  } catch (error) {
    core.logger.log(
      {
        level: 'ERROR',
        title: 'There was an error calling environment event',
        category: 'CORE',
        error,
        metadata: { event },
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
