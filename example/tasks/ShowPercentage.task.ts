import { sleep } from '@universal-packages/time-measurer'

import BaseTask from '../../src/CoreTask'

export default class ShowPercentageTask extends BaseTask {
  public static readonly taskName = 'show-percentage'
  public static readonly description = 'This task shows a percentage'

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
        progress += 0.01
        this.updatePresenterProgress(progress)

        if (progress >= 100) {
          clearInterval(this.progressInterval)
          resolve()
        }
      }, 1)
    })
  }

  public async abort(): Promise<void> {
    clearTimeout(this.progressInterval)
    this.resolve()
    await sleep(1000)
  }

  public async release(): Promise<void> {
    await sleep(1000)
  }
}
