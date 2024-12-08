import CoreModule from '../../../src/CoreModule'

export default class GoodModule extends CoreModule {
  public static iWasPrepared = false
  public static iWasReleased = false
  public static readonly moduleName = 'good-module'
  public static readonly loadPriority = 101
  
  public async prepare(): Promise<void> {
    this.subject = 'I am the subject of the good core module'
    GoodModule.iWasPrepared = true
  }

  public async release(): Promise<void> {
    GoodModule.iWasReleased = true
  }
}
