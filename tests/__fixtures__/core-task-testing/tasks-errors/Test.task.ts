import CoreTask from '../../../../src/CoreTask'

export default class TestTask extends CoreTask {
  public static readonly taskName = 'test-task-for-sho'
  public static readonly description = 'Test the task'

  public async exec(): Promise<void> {}
}

throw new Error('Errored')
