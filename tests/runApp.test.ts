import Logger from '@universal-packages/logger'
import { runApp } from '../src/runApp'
import GoodApp from './__fixtures__/apps/Good.app'
import ExcelentModule from './__fixtures__/modules/Excelent.module'
import GoodModule from './__fixtures__/modules/Good.module'

jest.spyOn(process, 'exit').mockImplementation(((): void => {}) as any)
jest.mock('../src/AppWatcher')

beforeEach((): void => {
  jest.clearAllMocks()
  GoodApp.iWasPrepared = false
  GoodApp.iWasRan = false
  GoodApp.iWasStopped = false
  GoodApp.iWasReleased = false
  process.removeAllListeners()
})

describe('runApp', (): void => {
  it('do all the preaprations funds an app and runs it (sets core)', async (): Promise<void> => {
    await runApp('Good', { fast: true }, false, {
      appsDirectory: './tests/__fixtures__/apps',
      configDirectory: './tests/__fixtures__/config',
      tasksDirectory: './tests/__fixtures__/tasks',
      modulesDirectory: './tests/__fixtures__/modules'
    })

    expect(GoodApp.iWasPrepared).toEqual(true)
    expect(GoodApp.iWasRan).toEqual(true)
    expect(core).toEqual({
      App: GoodApp,
      appConfig: { doStuff: true, test: true },
      appInstance: expect.any(GoodApp),
      coreConfig: expect.objectContaining({ tasksDirectory: './tests/__fixtures__/tasks' }),
      coreModules: { 'excelent-module': expect.any(ExcelentModule), 'good-module': expect.any(GoodModule) },
      loaded: true,
      logger: expect.any(Logger),
      projectConfig: expect.objectContaining({ ExcelentModule: expect.anything(), 'good-module': expect.anything(), 'good-app': expect.anything() }),
      running: true,
      stopping: false,
      Task: null,
      taskInstance: null
    })
  })

  it('exits if core config has errors', async (): Promise<void> => {
    await runApp('Good', { fast: true }, false, {
      appsDirectory: './tests/__fixtures__/nonexistent',
      configDirectory: './tests/__fixtures__/config',
      tasksDirectory: './tests/__fixtures__/tasks',
      modulesDirectory: './tests/__fixtures__/modules'
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodApp.iWasPrepared).toEqual(false)
    expect(GoodApp.iWasRan).toEqual(false)
  })

  it('exits if proyect config has errors', async (): Promise<void> => {
    await runApp('Good', { fast: true }, false, {
      appsDirectory: './tests/__fixtures__/apps',
      configDirectory: './tests/__fixtures__/config-errored',
      tasksDirectory: './tests/__fixtures__/tasks',
      modulesDirectory: './tests/__fixtures__/modules'
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodApp.iWasPrepared).toEqual(false)
    expect(GoodApp.iWasRan).toEqual(false)
  })

  it('exits if modules has errors', async (): Promise<void> => {
    await runApp('Good', { fast: true }, false, {
      appsDirectory: './tests/__fixtures__/apps',
      configDirectory: './tests/__fixtures__/config',
      tasksDirectory: './tests/__fixtures__/tasks',
      modulesDirectory: './tests/__fixtures__/modules-load-error',
      logger: {
        silence: true
      }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodApp.iWasPrepared).toEqual(false)
    expect(GoodApp.iWasRan).toEqual(false)
  })

  it('continues if modules warnings are present (log the warnings)', async (): Promise<void> => {
    await runApp('Good', { fast: true }, false, {
      appsDirectory: './tests/__fixtures__/apps',
      configDirectory: './tests/__fixtures__/config',
      tasksDirectory: './tests/__fixtures__/tasks',
      modulesDirectory: './tests/__fixtures__/modules-warnings'
    })

    expect(GoodApp.iWasPrepared).toEqual(true)
    expect(GoodApp.iWasRan).toEqual(true)
  })

  it('exits if app preapration fails (unload modules)', async (): Promise<void> => {
    await runApp('preapre-error-app', { fast: true }, false, {
      appsDirectory: './tests/__fixtures__/apps-prepare-error',
      configDirectory: './tests/__fixtures__/config',
      tasksDirectory: './tests/__fixtures__/tasks',
      modulesDirectory: './tests/__fixtures__/modules'
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(core.coreModules).toEqual({})
  })

  it('exits if running the app fails (unload modules)', async (): Promise<void> => {
    await runApp('run-error-app', { fast: true }, false, {
      appsDirectory: './tests/__fixtures__/apps-run-error',
      configDirectory: './tests/__fixtures__/config',
      tasksDirectory: './tests/__fixtures__/tasks',
      modulesDirectory: './tests/__fixtures__/modules'
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(core.coreModules).toEqual({})
  })

  it('aborts the execution when receiving the signal', async (): Promise<void> => {
    await runApp('good-app', { fast: true }, false, {
      appsDirectory: './tests/__fixtures__/apps',
      configDirectory: './tests/__fixtures__/config',
      tasksDirectory: './tests/__fixtures__/tasks',
      modulesDirectory: './tests/__fixtures__/modules'
    })

    await process.listeners('SIGINT')[0]('SIGINT')

    expect(GoodApp.iWasPrepared).toEqual(true)
    expect(GoodApp.iWasRan).toEqual(true)
    expect(GoodApp.iWasStopped).toEqual(true)
    expect(GoodApp.iWasReleased).toEqual(true)
  })

  it('exists if stopping goes wrong', async (): Promise<void> => {
    await runApp('stop-error-app', { fast: true }, false, {
      appsDirectory: './tests/__fixtures__/apps-stop-error',
      configDirectory: './tests/__fixtures__/config',
      tasksDirectory: './tests/__fixtures__/tasks',
      modulesDirectory: './tests/__fixtures__/modules'
    })

    await process.listeners('SIGINT')[0]('SIGINT')

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(core.coreModules).toEqual({})
  })

  it('exists if releasing goes wrong', async (): Promise<void> => {
    await runApp('release-error-app', { fast: true }, false, {
      appsDirectory: './tests/__fixtures__/apps-release-error',
      configDirectory: './tests/__fixtures__/config',
      tasksDirectory: './tests/__fixtures__/tasks',
      modulesDirectory: './tests/__fixtures__/modules'
    })

    await process.listeners('SIGINT')[0]('SIGINT')

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(core.coreModules).toEqual({})
  })

  it('exits if modules unloading goes wrong', async (): Promise<void> => {
    await runApp('good-app', { fast: true }, false, {
      appsDirectory: './tests/__fixtures__/apps',
      configDirectory: './tests/__fixtures__/config',
      tasksDirectory: './tests/__fixtures__/tasks',
      modulesDirectory: './tests/__fixtures__/modules-release-error'
    })

    await process.listeners('SIGINT')[0]('SIGINT')

    expect(process.exit).toHaveBeenCalledWith(1)
  })

  it('waits until the running reachs a loaded state to start aborting (so we dont unload at the same time the task is being loaded)', async (): Promise<void> => {
    setTimeout((): void => {
      expect(GoodApp.iWasPrepared).toEqual(true)
      expect(GoodApp.iWasRan).toEqual(true)
      expect(GoodApp.iWasStopped).toEqual(false)
      expect(GoodApp.iWasReleased).toEqual(false)
      core.running = true
    }, 500)

    await runApp('good-app', { fast: true }, false, {
      appsDirectory: './tests/__fixtures__/apps',
      configDirectory: './tests/__fixtures__/config',
      tasksDirectory: './tests/__fixtures__/tasks',
      modulesDirectory: './tests/__fixtures__/modules'
    })

    core.running = false

    await process.listeners('SIGINT')[0]('SIGINT')

    expect(GoodApp.iWasPrepared).toEqual(true)
    expect(GoodApp.iWasRan).toEqual(true)
    expect(GoodApp.iWasStopped).toEqual(true)
    expect(GoodApp.iWasReleased).toEqual(true)
  })

  it('special signals are used for restarting and killing when demonized', async (): Promise<void> => {
    await runApp('good-app', { fast: true }, true, {
      appsDirectory: './tests/__fixtures__/apps',
      configDirectory: './tests/__fixtures__/config',
      tasksDirectory: './tests/__fixtures__/tasks',
      modulesDirectory: './tests/__fixtures__/modules'
    })

    await process.listeners('SIGINT')[0]('SIGINT')
    await process.listeners('SIGTERM')[0]('SIGTERM')

    expect(process.exit).not.toHaveBeenCalled()
    expect(GoodApp.iWasStopped).toEqual(false)
    expect(GoodApp.iWasReleased).toEqual(false)

    await process.listeners('SIGABRT')[0]('SIGABRT')

    expect(process.exit).not.toHaveBeenCalled()
    expect(GoodApp.iWasStopped).toEqual(true)
    expect(GoodApp.iWasReleased).toEqual(true)

    await process.listeners('SIGALRM')[0]('SIGALRM')

    expect(process.exit).not.toHaveBeenCalled()
    expect(GoodApp.iWasStopped).toEqual(true)
    expect(GoodApp.iWasReleased).toEqual(true)

    await process.listeners('SIGABRT')[0]('SIGABRT')

    expect(process.exit).toHaveBeenLastCalledWith(0)
  })

  it('runs an app watcher if configured', async (): Promise<void> => {
    await runApp('good-app', { fast: true }, false, {
      appsDirectory: './tests/__fixtures__/apps',
      configDirectory: './tests/__fixtures__/config',
      tasksDirectory: './tests/__fixtures__/tasks',
      modulesDirectory: './tests/__fixtures__/modules',
      appWatcher: {
        enabled: true
      }
    })

    process.listeners('SIGINT')[0]('SIGINT')

    expect(core.stopping).toBeTruthy()

    process.listeners('SIGTERM')[0]('SIGTERM')
    expect(process.exit).toHaveBeenCalledWith(0)
  })
})
