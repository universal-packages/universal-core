import { sleep } from '@universal-packages/time-measurer'

import CoreApp from '../src/CoreApp'

export default class MemoryUsageApp extends CoreApp {
  public static readonly appName = 'memory-usage-app'
  public static readonly description = 'This is an app that uses a lot of memory'

  private timeout: NodeJS.Timeout
  private memoryInterval: NodeJS.Timeout

  private bigChunks = []

  public async prepare(): Promise<void> {
    await sleep(500)
  }

  public async run(): Promise<void> {
    this.clearChunks()

    this.memoryInterval = setInterval((): void => {
      this.bigChunks.push(this.randomString(4096))
    }, 10)
  }

  public async stop(): Promise<void> {
    await sleep(500)
    clearTimeout(this.timeout)
    clearInterval(this.memoryInterval)
  }

  public async release(): Promise<void> {
    await sleep(500)
  }

  private clearChunks(): void {
    this.logger.log({ level: 'INFO', title: 'Clearing chunks', message: `Cleared ${this.bigChunks.length} chunks` })
    this.bigChunks = []

    this.timeout = setTimeout(() => {
      this.clearChunks()
    }, Math.random() * 60000)
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
