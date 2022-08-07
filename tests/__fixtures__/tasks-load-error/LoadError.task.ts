import CoreTask from '../../../src/CoreTask'

export default class LoadErrorTask extends CoreTask {
  public static readonly taskName = 'load-error-task'

  public async exec(): Promise<void> {}
}

throw new Error('Errored')
