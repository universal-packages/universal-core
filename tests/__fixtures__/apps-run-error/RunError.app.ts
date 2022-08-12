import CoreApp from '../../../src/CoreApp'

export default class RunErrorApp extends CoreApp {
  public static readonly appName = 'run-error-app'

  public prepare(): Promise<void> | void {}

  public run(): Promise<void> | void {
    throw 'Error'
  }

  public stop(): Promise<void> | void {}

  public release(): Promise<void> | void {}
}
