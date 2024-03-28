import { Logger } from '@universal-packages/logger'

export async function adjustCoreLogger(): Promise<void> {
  core.logger = new Logger({
    level: process.env.NODE_ENV === 'test' ? 'ERROR' : 'TRACE',
    silence: !!process.env.CORE_TESTING,
    transports: ['terminal-presenter', 'local-file'],
    ...core.coreConfig.logger
  })

  await core.logger.prepare()
}
