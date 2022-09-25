import { CoreApp } from '../src'
import TestApp from './__fixtures__/apps/Good.app'

describe('CoreApp', (): void => {
  it('requires configuration, args, logger and modules to be set', async (): Promise<void> => {
    const app = new CoreApp({}, {}, {} as any, {})

    expect(app).toMatchObject({ config: {}, args: {}, logger: {}, coreModules: {} })
  })

  describe('.find', (): void => {
    it('finds an app by name', async (): Promise<void> => {
      const App = await CoreApp.find('Good', {
        appsLocation: './tests/__fixtures__/apps',
        configLocation: './tests/__fixtures__/config',
        tasksLocation: './tests/__fixtures__/tasks'
      })

      expect(App).toBe(TestApp)
    })

    it('throws if no app can not be found', async (): Promise<void> => {
      let error: Error

      try {
        await CoreApp.find('notinthere', {
          appsLocation: './tests/__fixtures__/apps',
          configLocation: './tests/__fixtures__/config',
          tasksLocation: './tests/__fixtures__/tasks'
        })
      } catch (err) {
        error = err
      }

      expect(error.message).toEqual(`App \"notinthere\" can't be found anywhere in\n./tests/__fixtures__/apps`)
    })

    it('throws if app can not be loaded because of errors', async (): Promise<void> => {
      let error: Error

      try {
        await CoreApp.find('LoadError', {
          appsLocation: './tests/__fixtures__/apps-load-error',
          configLocation: './tests/__fixtures__/config',
          tasksLocation: './tests/__fixtures__/tasks'
        })
      } catch (err) {
        error = err
      }

      expect(error.message).toEqual('Errored')
    })
  })

  describe('#prepare', (): void => {
    it('does not throw if not implemented', async (): Promise<void> => {
      const app = new CoreApp({}, {}, {} as any, {})

      expect((): unknown => app.prepare()).not.toThrow()
    })
  })

  describe('#run', (): void => {
    it('throws if not implemented', async (): Promise<void> => {
      const app = new CoreApp({}, {}, {} as any, {})

      expect((): unknown => app.run()).toThrow('Implement me: Apps should implement the run method')
    })
  })

  describe('#stop', (): void => {
    it('throws if not implemented', async (): Promise<void> => {
      const app = new CoreApp({}, {}, {} as any, {})

      expect((): unknown => app.stop()).toThrow('Implement me: Apps should implement the stop method')
    })
  })

  describe('#release', (): void => {
    it('does not throw if not implemented', async (): Promise<void> => {
      const app = new CoreApp({}, {}, {} as any, {})

      expect((): unknown => app.release()).not.toThrow()
    })
  })
})
