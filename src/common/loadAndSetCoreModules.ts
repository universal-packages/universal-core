import { startMeasurement } from '@universal-packages/time-measurer'

import Core from '../Core'
import { ProcessType } from '../Core.types'
import { releaseLoggerAndPresenter } from './releaseLoggerAndPresenter'
import { LOG_CONFIGURATION } from './terminal-presenter/LOG_CONFIGURATION'

export async function loadAndSetCoreModules(processType: ProcessType, processableName: string, allowLoadModules: boolean, throwError?: boolean): Promise<boolean> {
  if (!allowLoadModules) {
    core.coreModules = {}
    return false
  }

  const measurer = startMeasurement()

  try {
    const [loadedCoreModules, warnings] = await Core.getCoreModules(core.coreConfig, core.projectConfig, core.logger, processType, processableName)

    core.coreModules = loadedCoreModules

    for (let i = 0; i < warnings.length; i++) {
      const currentWarning = warnings[i]
      core.logger.log(
        {
          level: 'WARNING',
          title: currentWarning.title,
          message: currentWarning.message,
          category: 'CORE'
        },
        LOG_CONFIGURATION
      )
    }

    core.logger.log(
      {
        level: 'DEBUG',
        title: 'Core modules loaded',
        category: 'CORE',
        measurement: measurer.finish()
      },
      LOG_CONFIGURATION
    )
  } catch (error) {
    core.logger.log(
      {
        level: 'ERROR',
        title: 'There was an error loading core modules',
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
