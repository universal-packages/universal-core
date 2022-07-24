import { sleep } from '@universal-packages/time-measurer'
import BaseTask from '../../src/BaseTask'

export default class MigrateSomethingTask extends BaseTask {
  public static readonly description = 'Migrates some important data'

  private timeout: NodeJS.Timeout
  private resolve: Function

  public async prepare(): Promise<void> {
    await sleep(1000)
  }

  public async exec(): Promise<void> {
    return await new Promise((resolve): void => {
      this.resolve = resolve
      this.timeout = setTimeout(resolve, 10000)
    })
  }

  public async abort(): Promise<void> {
    clearTimeout(this.timeout)
    this.resolve()
    await sleep(1000)
  }

  public async release(): Promise<void> {
    await sleep(1000)
  }
}
