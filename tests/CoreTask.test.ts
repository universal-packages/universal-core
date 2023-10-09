import { CoreTask } from '../src'
import GoodTask from './__fixtures__/tasks/Good.task'

describe(CoreTask, (): void => {
  it('requires configuration, args, logger and modules to be set', async (): Promise<void> => {
    const task = new CoreTask('directive', [], {}, {} as any)

    expect(task).toMatchObject({ directive: 'directive', directiveOptions: [], args: {}, logger: {} })
  })

  describe('.find', (): void => {
    it('finds a task by name', async (): Promise<void> => {
      const Task = await CoreTask.find('Good', {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        tasks: { location: './tests/__fixtures__/tasks' }
      })

      expect(Task).toBe(GoodTask)
    })

    it('throws if no app can be found', async (): Promise<void> => {
      let error: Error

      try {
        await CoreTask.find('notinthere', {
          apps: { location: './tests/__fixtures__/apps' },
          config: { location: './tests/__fixtures__/config' },
          tasks: { location: './tests/__fixtures__/tasks' }
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
          apps: { location: './tests/__fixtures__/apps' },
          config: { location: './tests/__fixtures__/config' },
          tasks: { location: './tests/__fixtures__/tasks-load-error' }
        })
      } catch (err) {
        error = err
      }

      expect(error.message).toEqual('Errored')
    })
  })

  describe('#exec', (): void => {
    it('throws if not implemented', async (): Promise<void> => {
      const task = new CoreTask('directive', [], {}, {} as any)

      expect((): unknown => task.exec()).toThrow('Implement me: Tasks should implement the exec method')
    })
  })

  describe('#abort', (): void => {
    it('does not throw if not implemented', async (): Promise<void> => {
      const task = new CoreTask('directive', [], {}, {} as any)

      expect((): unknown => task.abort()).not.toThrow()
    })
  })
})
