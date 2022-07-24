import Logger from '@universal-packages/logger'

export default class BaseApp<O = any, A = any> {
  public static readonly appName: string
  public static readonly description: string

  protected readonly options: O
  protected readonly args: A
  protected readonly logger: Logger

  public constructor(options: O, args: A, logger: Logger) {
    this.options = options
    this.args = args
    this.logger = logger
  }

  public async prepare(): Promise<void> {
    throw 'Implement me: Apps should implement the prepare amethod'
  }

  public async start(): Promise<void> {
    throw 'Implement me: Apps should implement the start amethod'
  }

  public async stop(): Promise<void> {
    throw 'Implement me: Apps should implement the stop amethod'
  }

  public async release(): Promise<void> {}
}
