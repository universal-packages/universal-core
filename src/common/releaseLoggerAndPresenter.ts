import { restore } from '@universal-packages/terminal-presenter'

export async function releaseLoggerAndPresenter(): Promise<void> {
  await core.logger.waitForLoggingActivity()
  await core.logger.release()

  await restore()
}
