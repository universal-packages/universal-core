import CoreModule from '../../../src/CoreModule'

export default class ReleaseErrorModule extends CoreModule {
  public static readonly moduleName = 'relese-error-module'

  public async prepare(): Promise<void> {}

  public async release(): Promise<void> {
    throw 'Error'
  }
}
