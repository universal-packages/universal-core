import Logger from '@universal-packages/logger'

export default class CoreModule<O = any> {
  public static readonly moduleName: string
  public static readonly description: string

  public readonly options: O

  protected readonly logger: Logger

  public constructor(options: O, logger: Logger) {
    this.options = options
    this.logger = logger
  }

  public async prepare(): Promise<void> {
    throw 'Implement me: Modules should implement the prepare amethod'
  }

  public async release(): Promise<void> {
    throw 'Implement me: Modules should implement the release amethod'
  }
}
