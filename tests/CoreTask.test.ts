import CoreTask from '../src/CoreTask'
import TestTask from './__fixtures__/core-task-testing/tasks/Test.task'

describe('CoreTask', (): void => {
  it('requires configuration, args, logger and modules to be set', async (): Promise<void> => {
    const task = new CoreTask({}, 'directive', [], {}, {} as any, {})

    expect(task).toMatchObject({ directive: 'directive', directiveOptions: [], config: {}, args: {}, logger: {}, coreModules: {} })
  })

  describe('.find', (): void => {
    it('finds a task by name', async (): Promise<void> => {
      const Task = await CoreTask.find('TestTask', {
        appsDirectory: './tests/__fixtures__/core-task-testing/apps',
        configDirectory: './tests/__fixtures__/core-task-testing/config',
        tasksDirectory: './tests/__fixtures__/core-task-testing/tasks'
      })

      expect(Task).toBe(TestTask)
    })

    it('throws if no app can be found', async (): Promise<void> => {
      let error: Error

      try {
        await CoreTask.find('notinthere', {
          appsDirectory: './tests/__fixtures__/core-task-testing/apps',
          configDirectory: './tests/__fixtures__/core-task-testing/config',
          tasksDirectory: './tests/__fixtures__/core-task-testing/tasks'
        })
      } catch (err) {
        error = err
      }

      expect(error.message).toEqual(`Task \"notinthere\" can't be found anywhere in\n./tests/__fixtures__/core-task-testing/tasks`)
    })

    it('throws if task can not be loaded because of errors', async (): Promise<void> => {
      let error: Error

      try {
        await CoreTask.find('test', {
          appsDirectory: './tests/__fixtures__/core-task-testing/apps',
          configDirectory: './tests/__fixtures__/core-task-testing/config',
          tasksDirectory: './tests/__fixtures__/core-task-testing/tasks-errors'
        })
      } catch (err) {
        error = err
      }

      expect(error.message).toEqual('Errored')
    })

    it('throws if task does not implements CoreTask', async (): Promise<void> => {
      let error: Error

      try {
        await CoreTask.find('test-task-for-sho', {
          appsDirectory: './tests/__fixtures__/core-task-testing/apps',
          configDirectory: './tests/__fixtures__/core-task-testing/config',
          tasksDirectory: './tests/__fixtures__/core-task-testing/tasks-not-implements'
        })
      } catch (err) {
        error = err
      }

      expect(error.message).toMatch(/Module does not implements CoreTask\n\/.*__fixtures__\/core-task-testing\/tasks-not-implements\/Test.task.ts/)
    })
  })

  describe('#prepare', (): void => {
    it('does not thow if not implemented', async (): Promise<void> => {
      const task = new CoreTask({}, 'directive', [], {}, {} as any, {})

      expect((): unknown => task.prepare()).not.toThrow()
    })
  })

  describe('#exec', (): void => {
    it('thows if not implemented', async (): Promise<void> => {
      const task = new CoreTask({}, 'directive', [], {}, {} as any, {})

      expect((): unknown => task.exec()).toThrow('Implement me: Tasks should implement the exec method')
    })
  })

  describe('#abort', (): void => {
    it('does not thow if not implemented', async (): Promise<void> => {
      const task = new CoreTask({}, 'directive', [], {}, {} as any, {})

      expect((): unknown => task.abort()).not.toThrow()
    })
  })
})
