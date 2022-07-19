export default class BaseApp {
  public static readonly appName: string
  public static readonly appShortName: string
  public static readonly description: string

  public async load(): Promise<void> {
    throw 'Implement me: Apps should implement the load amethod'
  }

  public async start(): Promise<void> {
    throw 'Implement me: Apps should implement the load amethod'
  }

  public async stop(): Promise<void> {
    throw 'Implement me: Apps should implement the load amethod'
  }

  public async release(): Promise<void> {
    throw 'Implement me: Apps should implement the load amethod'
  }
}
