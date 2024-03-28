import { startMeasurement } from '@universal-packages/time-measurer'

import Core from '../Core'
import { LOG_CONFIGURATION } from './terminal-presenter/LOG_CONFIGURATION'
import { releaseLogger } from './releaseLogger'

export async function loadAndSetProjectConfig(throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    core.projectConfig = Core.getProjectConfig(core.coreConfig)

    core.logger.log(
      {
        level: 'DEBUG',
        title: 'Project config loaded',
        category: 'CORE',
        metadata: core.projectConfig,
        measurement: measurer.finish()
      },
      LOG_CONFIGURATION
    )
  } catch (error) {
    core.logger.log(
      {
        level: 'ERROR',
        title: 'There was an error loading the project config',
        category: 'CORE',
        error,
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
