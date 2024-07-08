import { sleep } from '@universal-packages/time-measurer'

import BaseTask from '../../src/CoreTask'

export default class SimpleTask extends BaseTask {
  public static readonly taskName = 'simple'
  public static readonly description = 'This task is simple'

  private resolve: Function
  private progressInterval: NodeJS.Timeout

  public async prepare(): Promise<void> {
    await sleep(1000)
  }

  public async exec(): Promise<void> {
    return await new Promise((resolve): void => {
      this.resolve = resolve
      let progress = 0

      this.progressInterval = setInterval(() => {
        progress += 1
        this.updateProgress(progress)

        if (progress >= 100) {
          clearInterval(this.progressInterval)
          resolve()
        }
      }, 10)
    })
  }

  public async abort(): Promise<void> {
    clearTimeout(this.progressInterval)
    this.resolve()
  }

  public async release(): Promise<void> {
    await sleep(1000)
  }
}
