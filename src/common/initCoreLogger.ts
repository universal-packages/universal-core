import { Logger, TerminalTransport } from '@universal-packages/logger'

export function initCoreLogger(): void {
  if (!core.logger) core.logger = new Logger({ level: process.env.NODE_ENV === 'test' ? 'ERROR' : undefined, silence: !!process.env.CORE_TESTING })

  const terminalTransport = core.logger.getTransport('terminal') as TerminalTransport

  terminalTransport.options.categoryColors['CORE'] = 'BLACK'
}
