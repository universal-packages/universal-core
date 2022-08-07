import CoreModule from '../../../src/CoreModule'

export default class ExcelentModule extends CoreModule {
  public static iWasPrepared = false
  public static iWasReleased = false
  public static readonly moduleName = 'excelent-module'

  public async prepare(): Promise<void> {
    ExcelentModule.iWasPrepared = true
  }

  public async release(): Promise<void> {
    ExcelentModule.iWasReleased = true
  }
}
