import CoreModule from '../../../src/CoreModule'

export default class NotProductionModule extends CoreModule {
  public static iWasPrepared = false
  public static iWasReleased = false
  public static readonly moduleName = 'not-production-module'
  public static readonly environment = '!production'

  public async prepare(): Promise<void> {
    this.subject = 'I am the subject of the not production core module'
    NotProductionModule.iWasPrepared = true
  }

  public async release(): Promise<void> {
    NotProductionModule.iWasReleased = true
  }
}
