import { Logger } from '@universal-packages/logger'
import { TerminalPresenterTransport } from '@universal-packages/logger-terminal-presenter'

export async function adjustCoreLogger(): Promise<void> {
  core.logger = new Logger({
    includeTransportAdapters: { 'terminal-presenter': TerminalPresenterTransport },
    level: process.env.NODE_ENV === 'test' ? 'ERROR' : 'TRACE',
    silence: !!process.env.CORE_TESTING,
    transports: ['terminal-presenter', 'local-file'],
    ...core.coreConfig.logger
  })

  await core.logger.prepare()
}
