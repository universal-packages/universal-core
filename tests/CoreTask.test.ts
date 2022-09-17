import { CoreTask } from '../src'
import GoodTask from './__fixtures__/tasks/Good.task'

describe('CoreTask', (): void => {
  it('requires configuration, args, logger and modules to be set', async (): Promise<void> => {
    const task = new CoreTask('directive', [], {}, {} as any, {})

    expect(task).toMatchObject({ directive: 'directive', directiveOptions: [], args: {}, logger: {}, coreModules: {} })
  })

  describe('.find', (): void => {
    it('finds a task by name', async (): Promise<void> => {
      const Task = await CoreTask.find('Good', {
        appsLocation: './tests/__fixtures__/apps',
        configLocation: './tests/__fixtures__/config',
        tasksLocation: './tests/__fixtures__/tasks'
      })

      expect(Task).toBe(GoodTask)
    })

    it('throws if no app can be found', async (): Promise<void> => {
      let error: Error

      try {
        await CoreTask.find('notinthere', {
          appsLocation: './tests/__fixtures__/apps',
          configLocation: './tests/__fixtures__/config',
          tasksLocation: './tests/__fixtures__/tasks'
        })
      } catch (err) {
        error = err
      }

      expect(error.message).toEqual(`Task \"notinthere\" can't be found anywhere in\n./tests/__fixtures__/tasks`)
    })

    it('throws if task can not be loaded because of errors', async (): Promise<void> => {
      let error: Error

      try {
        await CoreTask.find('LoadError', {
          appsLocation: './tests/__fixtures__/apps',
          configLocation: './tests/__fixtures__/config',
          tasksLocation: './tests/__fixtures__/tasks-load-error'
        })
      } catch (err) {
        error = err
      }

      expect(error.message).toEqual('Errored')
    })
  })

  describe('#prepare', (): void => {
    it('does not thow if not implemented', async (): Promise<void> => {
      const task = new CoreTask('directive', [], {}, {} as any, {})

      expect((): unknown => task.prepare()).not.toThrow()
    })
  })

  describe('#exec', (): void => {
    it('thows if not implemented', async (): Promise<void> => {
      const task = new CoreTask('directive', [], {}, {} as any, {})

      expect((): unknown => task.exec()).toThrow('Implement me: Tasks should implement the exec method')
    })
  })

  describe('#abort', (): void => {
    it('does not thow if not implemented', async (): Promise<void> => {
      const task = new CoreTask('directive', [], {}, {} as any, {})

      expect((): unknown => task.abort()).not.toThrow()
    })
  })
})
