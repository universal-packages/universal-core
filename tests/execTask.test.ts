import { execTask } from '../src/execTask'
import GoodTask from './__fixtures__/tasks/Good.task'

describe('execTask', (): void => {
  it('do all the preaprations funds a task and runs it', async (): Promise<void> => {
    await execTask(
      'Good',
      'directive',
      ['option'],
      { fast: true },
      {
        appsDirectory: './tests/__fixtures__/apps',
        configDirectory: './tests/__fixtures__/config',
        tasksDirectory: './tests/__fixtures__/tasks',
        modulesDirectory: './tests/__fixtures__/modules',
        logger: {
          silence: true
        }
      }
    )

    expect(GoodTask.iWasPrepared).toEqual(true)
    expect(GoodTask.iWasExecuted).toEqual(true)
  })
})
