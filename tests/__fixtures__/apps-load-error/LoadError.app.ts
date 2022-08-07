import CoreApp from '../../../src/CoreApp'

export default class LoadErrorApp extends CoreApp {
  public static readonly appName = 'load-error-app'

  public async run(): Promise<void> {}

  public async stop(): Promise<void> {}
}

throw new Error('Errored')
