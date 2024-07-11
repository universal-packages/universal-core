import CoreInitializer from '../../../src/CoreInitializer'

export default class HackyLoadInitializer extends CoreInitializer {
  public static iWasInitialized = false
  public static iWasAborted = false
  public static readonly taskName = 'hacky-load-task'

  private resolve: (value: void | PromiseLike<void>) => void

  protected async afterTemplatePopulate(): Promise<void> {
    return new Promise((resolve): void => {
      this.resolve = resolve
      HackyLoadInitializer.iWasInitialized = true
      core.stoppable = false
    })
  }

  public abort(): Promise<void> | void {
    HackyLoadInitializer.iWasAborted = true
    this.resolve()
  }
}
