import Logger from '@universal-packages/logger'

export default class BaseTask<A = any> {
  public static readonly taskName: string
  public static readonly description: string

  protected readonly directive: string
  protected readonly directiveOptions: string[]
  protected readonly args: A
  protected readonly logger: Logger

  public constructor(directive: string, directiveOptions: string[], args: A, logger: Logger) {
    this.directive = directive
    this.directiveOptions = directiveOptions
    this.args = args
    this.logger = logger
  }

  public async prepare(): Promise<void> {
    throw 'Implement me: Tasks should implement the prepare method'
  }

  public async exec(): Promise<void> {
    throw 'Implement me: Tasks should implement the exec method'
  }

  public async abort(): Promise<void> {
    throw 'Implement me: Tasks should implement the abort method'
  }

  public async release(): Promise<void> {
    throw 'Implement me: Tasks should implement the release method'
  }
}
