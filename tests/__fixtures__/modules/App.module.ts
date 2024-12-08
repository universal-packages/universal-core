import CoreModule from '../../../src/CoreModule'

export default class AppModule extends CoreModule {
  public static iWasPrepared = false
  public static iWasReleased = false
  public static readonly moduleName = 'app-module'
  public static readonly onlyFor = 'apps'
  public static readonly loadPriority = 120

  public async prepare(): Promise<void> {
    this.subject = 'I am the subject of the app core module'
    AppModule.iWasPrepared = true
  }

  public async release(): Promise<void> {
    AppModule.iWasReleased = true
  }
}
