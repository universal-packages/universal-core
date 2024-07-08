import { startMeasurement } from '@universal-packages/time-measurer'

import { releaseLoggerAndPresenter } from './releaseLoggerAndPresenter'
import { LOG_CONFIGURATION } from './terminal-presenter/LOG_CONFIGURATION'

export async function abortCoreInitializerInstance(throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  if (core.initializerInstance.abort) {
    try {
      await core.initializerInstance.abort()
      core.logger.log({ level: 'DEBUG', title: 'Initializer aborted', category: 'CORE', measurement: measurer.finish() }, LOG_CONFIGURATION)
    } catch (error) {
      core.logger.log({ level: 'ERROR', title: 'There was an error while aborting initializer', category: 'CORE', error }, LOG_CONFIGURATION)

      await releaseLoggerAndPresenter()

      if (throwError) throw error
      return true
    }
  }

  return false
}
