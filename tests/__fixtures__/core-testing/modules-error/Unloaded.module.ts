import CoreModule from '../../../../src/CoreModule'

export default class UnloadedTestModule extends CoreModule {
  public static wasUnloaded: boolean
  public static readonly moduleName = 'unloaded-module'
  public static readonly description = 'This is a local test module'

  public async prepare(): Promise<void> {}

  public async release(): Promise<void> {
    UnloadedTestModule.wasUnloaded = true
  }
}
