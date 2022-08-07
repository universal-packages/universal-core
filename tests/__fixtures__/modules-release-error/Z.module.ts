import CoreModule from '../../../src/CoreModule'

export default class ZModule extends CoreModule {
  public static iWasPrepared = false
  public static iWasReleased = false
  public static readonly moduleName = 'z-good-module'

  public async prepare(): Promise<void> {
    ZModule.iWasPrepared = true
  }

  public async release(): Promise<void> {
    ZModule.iWasReleased = true
  }
}
