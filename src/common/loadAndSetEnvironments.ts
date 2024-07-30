import { startMeasurement } from '@universal-packages/time-measurer'

import Core from '../Core'
import { ProcessType } from '../Core.types'
import { releaseLoggerAndPresenter } from './releaseLoggerAndPresenter'
import { LOG_CONFIGURATION } from './terminal-presenter/LOG_CONFIGURATION'

export async function loadAndSetEnvironments(processType: ProcessType, processableName: string, allowLoadEnvironments: boolean, throwError?: boolean): Promise<boolean> {
  if (!allowLoadEnvironments) {
    core.environments = []
    return false
  }

  const measurer = startMeasurement()

  try {
    const environments = await Core.getCoreEnvironments(core.coreConfig, core.logger, processType, processableName)

    core.environments = environments

    core.logger.log(
      {
        level: 'DEBUG',
        title: 'Core environments loaded',
        category: 'CORE',
        measurement: measurer.finish()
      },
      LOG_CONFIGURATION
    )
  } catch (error) {
    core.logger.log(
      {
        level: 'ERROR',
        title: 'There was an error loading core environments',
        category: 'CORE',
        error,
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
