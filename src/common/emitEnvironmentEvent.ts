import { startMeasurement } from '@universal-packages/time-measurer'

import { EnvironmentEvent } from '../Core.types'
import { LOG_CONFIGURATION } from './terminal-presenter/LOG_CONFIGURATION'
import { releaseLoggerAndPresenter } from './releaseLoggerAndPresenter'

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

    await releaseLoggerAndPresenter()

    if (throwError) throw error
    return true
  }

  return false
}
