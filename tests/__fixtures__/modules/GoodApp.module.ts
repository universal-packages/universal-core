import CoreModule from '../../../src/CoreModule'

export default class GoodAppModule extends CoreModule {
  public static iWasPrepared = false
  public static iWasReleased = false
  public static readonly moduleName = 'good-app-module'
  public static readonly tideTo = 'good-app'

  public async prepare(): Promise<void> {
    this.subject = 'I am the subject of the good app core module'
    GoodAppModule.iWasPrepared = true
  }

  public async release(): Promise<void> {
    GoodAppModule.iWasReleased = true
  }
}
