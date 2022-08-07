import CoreTask from '../../../src/CoreTask'

export default class GoodTask extends CoreTask {
  public static iWasPrepared = false
  public static iWasExecuted = false
  public static iWasAborted = false
  public static readonly appName = 'good-task'

  public prepare(): Promise<void> | void {
    GoodTask.iWasPrepared = true
  }

  public exec(): Promise<void> | void {
    GoodTask.iWasExecuted = true
  }

  public abort(): Promise<void> | void {
    GoodTask.iWasAborted = true
  }
}
