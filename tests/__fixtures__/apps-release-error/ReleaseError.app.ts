import CoreApp from '../../../src/CoreApp'

export default class ReleaseErrorApp extends CoreApp {
  public static readonly appName = 'release-error-app'

  public prepare(): Promise<void> | void {}

  public run(): Promise<void> | void {}

  public stop(): Promise<void> | void {}

  public release(): Promise<void> | void {
    throw 'Error'
  }
}
