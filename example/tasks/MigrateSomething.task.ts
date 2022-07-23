import { sleep } from '@universal-packages/time-measurer'
import BaseTask from '../../src/BaseTask'

export default class MigrateSomethingTask extends BaseTask {
  public static readonly description = 'Migrates some important data'

  public async prepare(): Promise<void> {
    await sleep(1000)
  }

  public async exec(): Promise<void> {
    await sleep(5000)
  }

  public async release(): Promise<void> {
    await sleep(1000)
  }
}
