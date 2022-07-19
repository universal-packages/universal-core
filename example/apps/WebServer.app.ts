import BaseApp from '../../src/BaseApp'

export default class WebServerCoreApp extends BaseApp {
  public static readonly appShortName = 'app-maniaca'

  public async load(): Promise<void> {}

  public async start(): Promise<void> {}

  public async stop(): Promise<void> {}

  public async release(): Promise<void> {}
}
