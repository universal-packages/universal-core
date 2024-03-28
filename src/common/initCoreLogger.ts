import { Logger } from '@universal-packages/logger'

export async function initCoreLogger(): Promise<void> {
  if (!core.logger) {
    core.logger = new Logger({ level: process.env.NODE_ENV === 'test' ? 'ERROR' : 'TRACE', silence: !!process.env.CORE_TESTING, transports: ['terminal-presenter', 'local-file'] })

    await core.logger.prepare()
  }
}
