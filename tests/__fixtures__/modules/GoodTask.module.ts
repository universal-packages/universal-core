import CoreModule from '../../../src/CoreModule'

export default class GoodTaskModule extends CoreModule {
  public static iWasPrepared = false
  public static iWasReleased = false
  public static readonly moduleName = 'good-task-module'
  public static readonly tideTo = 'good-task'

  public async prepare(): Promise<void> {
    this.subject = 'I am the subject of the good task core module'
    GoodTaskModule.iWasPrepared = true
  }

  public async release(): Promise<void> {
    GoodTaskModule.iWasReleased = true
  }
}
