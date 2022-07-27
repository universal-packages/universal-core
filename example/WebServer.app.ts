import { sleep } from '@universal-packages/time-measurer'
import CoreApp from '../src/CoreApp'

export default class WebServerApp extends CoreApp {
  public static readonly appName = 'web-server'
  public static readonly description = 'Node web server'

  private timeout: NodeJS.Timeout

  public async prepare(): Promise<void> {
    await sleep(1000)
  }

  public async start(): Promise<void> {
    this.timeout = setTimeout((): void => {}, 999999999)
    // throw new Error('what')
  }

  public async stop(): Promise<void> {
    await sleep(1000)
    clearTimeout(this.timeout)
  }

  public async release(): Promise<void> {
    await sleep(3000)
  }
}
