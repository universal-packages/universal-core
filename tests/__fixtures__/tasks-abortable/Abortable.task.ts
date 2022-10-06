import CoreTask from '../../../src/CoreTask'

export default class AbortableTask extends CoreTask {
  public static iWasExecuted = false
  public static iWasAborted = false
  public static readonly taskName = 'abortable-task'

  private resolve: (value: void | PromiseLike<void>) => void
  private extraTimeout: NodeJS.Timeout

  public async exec(): Promise<void> {
    return new Promise((resolve): void => {
      this.resolve = resolve
      AbortableTask.iWasExecuted = true
      this.extraTimeout = setTimeout(resolve, 500)
    })
  }

  public abort(): Promise<void> | void {
    AbortableTask.iWasAborted = true
    setTimeout(this.resolve, 100)
    clearTimeout(this.extraTimeout)
  }
}
