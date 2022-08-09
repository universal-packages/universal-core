import CoreTask from '../../../src/CoreTask'

export default class ExecErrorTask extends CoreTask {
  public static readonly taskName = 'exec-error-task'

  public prepare(): Promise<void> | void {}

  public async exec(): Promise<void> {
    throw 'Error'
  }

  public abort(): Promise<void> | void {}
}
