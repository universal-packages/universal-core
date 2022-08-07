import CoreModule from '../../../src/CoreModule'

export default class GoodModule extends CoreModule {
  public static iWasPrepared = false
  public static iWasReleased = false
  public static readonly moduleName = 'good-module'

  public async prepare(): Promise<void> {
    GoodModule.iWasPrepared = true
  }

  public async release(): Promise<void> {
    GoodModule.iWasReleased = true
  }
}
