import CoreApp from '../../../src/CoreApp'

export default class NotAllowApp extends CoreApp {
  public static iWasPrepared = false
  public static iWasRan = false
  public static iWasStopped = false
  public static iWasReleased = false
  public static readonly appName = 'not-allow-app'
  public static readonly allowLoadEnvironments: boolean = false
  public static readonly allowLoadModules: boolean = false

  public prepare(): Promise<void> | void {
    NotAllowApp.iWasPrepared = true
  }

  public run(): Promise<void> | void {
    NotAllowApp.iWasRan = true
  }

  public stop(): Promise<void> | void {
    NotAllowApp.iWasStopped = true
  }

  public release(): Promise<void> | void {
    NotAllowApp.iWasReleased = true
  }
}
