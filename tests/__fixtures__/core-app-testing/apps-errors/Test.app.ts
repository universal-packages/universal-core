import CoreApp from '../../../../src/CoreApp'

export default class TestApp extends CoreApp {
  public static readonly appName = 'test-app-for-sho'
  public static readonly description = 'Test the app'

  public async run(): Promise<void> {}

  public async stop(): Promise<void> {}
}

throw new Error('Errored')
