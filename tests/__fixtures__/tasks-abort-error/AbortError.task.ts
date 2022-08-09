import { sleep } from '@universal-packages/time-measurer'
import CoreTask from '../../../src/CoreTask'

export default class AbortErrorTask extends CoreTask {
  public static readonly taskName = 'abort-error-task'

  public prepare(): Promise<void> | void {}

  public async exec(): Promise<void> {
    await sleep(500)
  }

  public abort(): Promise<void> | void {
    throw 'error'
  }
}
