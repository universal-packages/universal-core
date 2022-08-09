import { sleep } from '@universal-packages/time-measurer'
import CoreTask from '../../../src/CoreTask'

export default class GoodTask extends CoreTask {
  public static iWasPrepared = false
  public static iWasExecuted = false
  public static iWasAborted = false
  public static readonly taskName = 'good-task'

  public prepare(): Promise<void> | void {
    GoodTask.iWasPrepared = true
  }

  public async exec(): Promise<void> {
    await sleep(50)
    GoodTask.iWasExecuted = true
  }

  public abort(): Promise<void> | void {
    GoodTask.iWasAborted = true
  }
}
