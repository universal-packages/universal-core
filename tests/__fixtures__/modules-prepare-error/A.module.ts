import CoreModule from '../../../src/CoreModule'

export default class AModule extends CoreModule {
  public static iWasPrepared = false
  public static iWasReleased = false
  public static readonly moduleName = 'a-good-module'

  public async prepare(): Promise<void> {
    AModule.iWasPrepared = true
  }

  public async release(): Promise<void> {
    AModule.iWasReleased = true
  }
}
