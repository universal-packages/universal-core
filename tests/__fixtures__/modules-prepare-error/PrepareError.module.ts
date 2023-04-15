import CoreModule from '../../../src/CoreModule'

export default class PrepareErrorModule extends CoreModule {
  public static readonly moduleName = 'prepare-error-module'

  public async prepare(): Promise<void> {
    throw 'Error'
  }

  public async release(): Promise<void> {}
}
