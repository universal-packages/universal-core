import { Logger, LoggerOptions } from '@universal-packages/logger'
import { TerminalPresenterTransport } from '@universal-packages/logger-terminal-presenter'

export async function adjustCoreLogger(): Promise<void> {
  const loggerOptions: LoggerOptions = { includeTransportAdapters: { 'terminal-presenter': TerminalPresenterTransport } }

  if (process.env.NODE_ENV !== 'test') loggerOptions.transports = ['terminal-presenter', 'local-file']

  core.logger = new Logger({ ...loggerOptions, ...core.coreConfig.logger })

  await core.logger.prepare()
}
