export async function releaseLogger(): Promise<void> {
  await core.logger.waitForLoggingActivity()
  await core.logger.release()
}
