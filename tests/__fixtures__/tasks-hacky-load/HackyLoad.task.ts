import CoreTask from '../../../src/CoreTask'

export default class HackyLoadTask extends CoreTask {
  public static iWasPrepared = false
  public static iWasExecuted = false
  public static iWasAborted = false
  public static readonly taskName = 'hacky-load-task'

  private resolve: (value: void | PromiseLike<void>) => void

  public prepare(): Promise<void> | void {
    HackyLoadTask.iWasPrepared = true
  }

  public async exec(): Promise<void> {
    return new Promise((resolve): void => {
      this.resolve = resolve
      HackyLoadTask.iWasExecuted = true
      core.loaded = false
    })
  }

  public abort(): Promise<void> | void {
    HackyLoadTask.iWasAborted = true
    this.resolve()
  }
}
