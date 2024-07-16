import { Logger, LoggerOptions } from '@universal-packages/logger'
import { TerminalPresenterTransport } from '@universal-packages/logger-terminal-presenter'

import { CoreConfig } from '../Core.types'

export async function initCoreLogger(coreConfig?: CoreConfig): Promise<void> {
  if (!core.logger) {
    const loggerOptions: LoggerOptions = { includeTransportAdapters: { 'terminal-presenter': TerminalPresenterTransport } }

    if (process.env.NODE_ENV !== 'test') {
      loggerOptions.transports = coreConfig?.logger?.transports ? coreConfig.logger.transports : ['terminal-presenter', 'local-file']
    }

    core.logger = new Logger(loggerOptions)

    await core.logger.prepare()
  }
}
