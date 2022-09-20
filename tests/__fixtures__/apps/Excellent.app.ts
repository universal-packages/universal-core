import CoreApp from '../../../src/CoreApp'

export default class ExcellentApp extends CoreApp {
  public static iWasPrepared = false
  public static iWasRan = false
  public static iWasStopped = false
  public static iWasReleased = false
  public static readonly appName = 'excellent-app'

  public prepare(): Promise<void> | void {
    ExcellentApp.iWasPrepared = true
  }

  public run(): Promise<void> | void {
    ExcellentApp.iWasRan = true
  }

  public stop(): Promise<void> | void {
    ExcellentApp.iWasStopped = true
  }

  public release(): Promise<void> | void {
    ExcellentApp.iWasReleased = true
  }
}
