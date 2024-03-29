import { startMeasurement } from '@universal-packages/time-measurer'

import Core from '../Core'
import { CoreConfig } from '../Core.types'
import { adjustCoreLogger } from './adjustCoreLogger'
import { initTerminalPresenter } from './initTerminalPresenter'
import { releaseLoggerAndPresenter } from './releaseLoggerAndPresenter'
import { LOG_CONFIGURATION } from './terminal-presenter/LOG_CONFIGURATION'

export async function loadAndSetCoreConfig(coreConfigOverride: CoreConfig, throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    core.coreConfig = await Core.getCoreConfig(coreConfigOverride)

    await adjustCoreLogger()
    initTerminalPresenter()

    core.logger.log(
      {
        level: 'DEBUG',
        title: 'Core config loaded',
        category: 'CORE',
        metadata: core.coreConfig,
        measurement: measurer.finish()
      },
      LOG_CONFIGURATION
    )
  } catch (error) {
    core.logger.log(
      {
        level: 'ERROR',
        title: 'There was an error loading the core config',
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
