import CoreApp from '../../../src/CoreApp'

export default class StopErrorApp extends CoreApp {
  public static readonly appName = 'stop-error-app'

  public prepare(): Promise<void> | void {}

  public run(): Promise<void> | void {}

  public stop(): Promise<void> | void {
    throw 'Error'
  }

  public release(): Promise<void> | void {}
}
