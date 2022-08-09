import CoreTask from '../../../src/CoreTask'

export default class PrepareErrorTask extends CoreTask {
  public static readonly taskName = 'prepare-error-task'

  public prepare(): Promise<void> | void {
    throw 'Error'
  }

  public async exec(): Promise<void> {}

  public abort(): Promise<void> | void {}
}
