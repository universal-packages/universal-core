import CoreModule from '../../../src/CoreModule'

export default class TestModule extends CoreModule {
  public static iWasPrepared = false
  public static iWasReleased = false
  public static readonly moduleName = 'test-module'

  public async prepare(): Promise<void> {
    this.subject = 'I am the subject of the test core module'
    TestModule.iWasPrepared = true
  }

  public async release(): Promise<void> {
    TestModule.iWasReleased = true
  }
}
