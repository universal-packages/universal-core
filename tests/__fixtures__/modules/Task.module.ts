import CoreModule from '../../../src/CoreModule'

export default class TaskModule extends CoreModule {
  public static iWasPrepared = false
  public static iWasReleased = false
  public static readonly moduleName = 'task-module'
  public static readonly onlyFor = 'tasks'

  public async prepare(): Promise<void> {
    this.subject = 'I am the subject of the task core module'
    TaskModule.iWasPrepared = true
  }

  public async release(): Promise<void> {
    TaskModule.iWasReleased = true
  }
}
