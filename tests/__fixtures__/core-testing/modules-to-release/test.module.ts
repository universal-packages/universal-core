import CoreModule from '../../../../src/CoreModule'

export default class ReleaseTestModule extends CoreModule {
  public static released: boolean
  public static readonly moduleName = 'test-module'
  public static readonly description = 'This is a local test module'

  public async prepare(): Promise<void> {}

  public async release(): Promise<void> {
    ReleaseTestModule.released = true
  }
}
