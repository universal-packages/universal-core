import { sleep } from '@universal-packages/time-measurer'
import BaseApp from '../../src/BaseApp'

export default class WebServerCoreApp extends BaseApp {
  public static readonly appShortName = 'app-maniaca'

  private timeout: NodeJS.Timeout

  public async load(): Promise<void> {
    await sleep(1000)
  }

  public async start(): Promise<void> {
    this.timeout = setTimeout((): void => {}, 999999999)
  }

  public async stop(): Promise<void> {
    await sleep(1000)
    clearTimeout(this.timeout)
  }

  public async release(): Promise<void> {
    await sleep(1000)
  }
}
