import CoreModule from '../../../src/CoreModule'

export default class ExcellentModule extends CoreModule {
  public static iWasPrepared = false
  public static iWasReleased = false
  public static readonly moduleName = 'excellent-module'

  public async prepare(): Promise<void> {
    this.subject = 'I am the subject of the excellent core module'
    ExcellentModule.iWasPrepared = true
  }

  public async release(): Promise<void> {
    ExcellentModule.iWasReleased = true
  }
}
