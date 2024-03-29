import { sleep } from '@universal-packages/time-measurer'

import CoreApp from '../src/CoreApp'

export default class ErroredApp extends CoreApp {
  public static readonly appName = 'errored-app'
  public static readonly description = 'This is an example app'

  private timeout: NodeJS.Timeout

  public async prepare(): Promise<void> {
    await sleep(100)
  }

  public async run(): Promise<void> {
    throw new Error('This is an intentional error to test app watcher and reload')
  }

  public async stop(): Promise<void> {
    await sleep(100)
    clearTimeout(this.timeout)
  }

  public async release(): Promise<void> {
    await sleep(100)
  }
}
