import CoreModule from '../../../../src/CoreModule'

export default class ReleaseTest2Module extends CoreModule {
  public static released: boolean

  public async prepare(): Promise<void> {}

  public async release(): Promise<void> {
    ReleaseTest2Module.released = true
  }
}
