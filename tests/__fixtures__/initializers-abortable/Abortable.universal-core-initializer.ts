import CoreInitializer from '../../../src/CoreInitializer'

export default class AbortableInitializer extends CoreInitializer {
  public static iWasInitialized = false
  public static iWasAborted = false
  public static readonly initializerName = 'abortable-initializer'

  public readonly templatesLocation: string = `${__dirname}/templates`

  private resolve: (value: void | PromiseLike<void>) => void
  private extraTimeout: NodeJS.Timeout

  protected async afterTemplatePopulate(): Promise<void> {
    return new Promise((resolve): void => {
      this.resolve = resolve
      AbortableInitializer.iWasInitialized = true
      this.extraTimeout = setTimeout(resolve, 500)
    })
  }

  public abort(): Promise<void> | void {
    AbortableInitializer.iWasAborted = true
    setTimeout(this.resolve, 100)
    clearTimeout(this.extraTimeout)
  }
}
