import CoreModule from '../../../src/CoreModule'

export default class LoadErrorModule extends CoreModule {
  public static readonly moduleName = 'load-error-module'

  public async prepare(): Promise<void> {}

  public async release(): Promise<void> {}
}

throw 'Load Error'
