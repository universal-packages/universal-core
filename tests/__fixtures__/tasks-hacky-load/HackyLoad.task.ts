import CoreTask from '../../../src/CoreTask'

export default class HackyLoadTask extends CoreTask {
  public static iWasExecuted = false
  public static iWasAborted = false
  public static readonly taskName = 'hacky-load-task'

  private resolve: (value: void | PromiseLike<void>) => void

  public async exec(): Promise<void> {
    return new Promise((resolve): void => {
      this.resolve = resolve
      HackyLoadTask.iWasExecuted = true
      core.stoppable = false
    })
  }

  public abort(): Promise<void> | void {
    HackyLoadTask.iWasAborted = true
    this.resolve()
  }
}
