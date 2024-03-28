export async function releaseLoggerAndPresenter(): Promise<void> {
  await core.logger.waitForLoggingActivity()
  await core.logger.release()

  core.TerminalPresenter.stop()
}
