import CoreTask from '../../../src/CoreTask'

export default class AbortableTask extends CoreTask {
  public static iWasPrepared = false
  public static iWasExecuted = false
  public static iWasAborted = false
  public static readonly taskName = 'abortable-task'

  private resolve: (value: void | PromiseLike<void>) => void

  public prepare(): Promise<void> | void {
    AbortableTask.iWasPrepared = true
  }

  public async exec(): Promise<void> {
    return new Promise((resolve): void => {
      this.resolve = resolve
      AbortableTask.iWasExecuted = true
    })
  }

  public abort(): Promise<void> | void {
    AbortableTask.iWasAborted = true
    this.resolve()
  }
}
