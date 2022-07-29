export default class TestModule {
  public static readonly moduleName = 'test-module'
  public static readonly description = 'This is a local test module'

  public async prepare(): Promise<void> {}

  public async release(): Promise<void> {}
}
