import CoreApp from '../../../src/CoreApp'

export default class PrepareErrorApp extends CoreApp {
  public static readonly appName = 'prepare-error-app'

  public prepare(): Promise<void> | void {
    throw 'Error'
  }

  public run(): Promise<void> | void {}

  public stop(): Promise<void> | void {}

  public release(): Promise<void> | void {}
}
