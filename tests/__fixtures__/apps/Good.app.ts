import CoreApp from '../../../src/CoreApp'

export default class GoodApp extends CoreApp {
  public static iWasPrepared = false
  public static iWasRan = false
  public static iWasStopped = false
  public static iWasReleased = false
  public static readonly appName = 'good-app'

  public prepare(): Promise<void> | void {
    GoodApp.iWasPrepared = true
  }

  public run(): Promise<void> | void {
    GoodApp.iWasRan = true
  }

  public stop(): Promise<void> | void {
    GoodApp.iWasStopped = true
  }

  public release(): Promise<void> | void {
    GoodApp.iWasReleased = true
  }
}
