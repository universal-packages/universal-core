import { sleep } from '@universal-packages/time-measurer'

import CoreApp from '../src/CoreApp'

export default class ExampleApp extends CoreApp {
  public static readonly appName = 'example-app'
  public static readonly description = 'This is an example app'

  private timeout: NodeJS.Timeout

  public async prepare(): Promise<void> {
    await sleep(500)
  }

  public async run(): Promise<void> {
    this.timeout = setTimeout((): void => {}, 999999999)
  }

  public async stop(): Promise<void> {
    await sleep(500)
    clearTimeout(this.timeout)
  }

  public async release(): Promise<void> {
    await sleep(500)
  }
}
