import { sleep } from '@universal-packages/time-measurer'

import CoreApp from '../src/CoreApp'

export default class WebServerApp extends CoreApp {
  public static readonly appName = 'web-server'
  public static readonly description = 'Node web server'

  private timeout: NodeJS.Timeout
  private memoryInterval: NodeJS.Timeout

  private bigChunks = []

  public async prepare(): Promise<void> {
    await sleep(100)
  }

  public async run(): Promise<void> {
    this.timeout = setTimeout((): void => {}, 999999999)
    // throw new Error('what')

    // this.memoryInterval = setInterval((): void => {
    //   this.bigChunks.push(this.randomString(4096))
    // }, 10)
  }

  public async stop(): Promise<void> {
    await sleep(100)
    clearTimeout(this.timeout)
    clearInterval(this.memoryInterval)
  }

  public async release(): Promise<void> {
    await sleep(100)
  }

  private randomString(length: number): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'
    const stringLength = length || 8
    let randomString = ''
    for (let i = 0; i < stringLength; i++) {
      const rnum = Math.floor(Math.random() * chars.length)
      randomString += chars.substring(rnum, rnum + 1)
    }
    return randomString
  }
}
