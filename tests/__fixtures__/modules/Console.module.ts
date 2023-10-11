import CoreModule from '../../../src/CoreModule'

export default class ConsoleModule extends CoreModule {
  public static iWasPrepared = false
  public static iWasReleased = false
  public static readonly moduleName = 'console-module'
  public static readonly onlyFor = 'console'

  public async prepare(): Promise<void> {
    this.subject = 'I am the subject of the console core module'
    ConsoleModule.iWasPrepared = true
  }

  public async release(): Promise<void> {
    ConsoleModule.iWasReleased = true
  }
}
