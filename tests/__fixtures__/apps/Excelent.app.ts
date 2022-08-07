import CoreApp from '../../../src/CoreApp'

export default class ExcelentApp extends CoreApp {
  public static iWasPrepared = false
  public static iWasRan = false
  public static iWasStopped = false
  public static iWasReleased = false
  public static readonly appName = 'excelent-app'

  public prepare(): Promise<void> | void {
    ExcelentApp.iWasPrepared = true
  }

  public run(): Promise<void> | void {
    ExcelentApp.iWasRan = true
  }

  public stop(): Promise<void> | void {
    ExcelentApp.iWasStopped = true
  }

  public release(): Promise<void> | void {
    ExcelentApp.iWasReleased = true
  }
}
