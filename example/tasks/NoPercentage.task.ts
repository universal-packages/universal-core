import { sleep } from '@universal-packages/time-measurer'

import BaseTask from '../../src/CoreTask'

export default class NoPercentageTask extends BaseTask {
  public static readonly taskName = 'no-percentage'
  public static readonly description = 'This task does not have a percentage'

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

        if (progress >= 100) {
          this.updateProgress(progress)

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
