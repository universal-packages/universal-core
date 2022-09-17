import { Logger } from '@universal-packages/logger'
import EventEmitter from 'events'
import repl from 'repl'
import { runConsole } from '../src/runConsole'
import ExcelentModule from './__fixtures__/modules/Excelent.module'
import GoodModule from './__fixtures__/modules/Good.module'

class ReplServerMock extends EventEmitter {
  public setupHistory = jest.fn()
}

const replServerMock = new ReplServerMock()

beforeEach((): void => {
  jest.spyOn(repl, 'start').mockImplementation(((): ReplServerMock => replServerMock) as any)
  jest.spyOn(process, 'exit').mockImplementation(((): void => {}) as any)

  jest.clearAllMocks()
  process.removeAllListeners()
})

describe('runConsole', (): void => {
  it('do all the preaprations and runs a repl server (sets core)', async (): Promise<void> => {
    await runConsole({
      appsLocation: './tests/__fixtures__/apps',
      configLocation: './tests/__fixtures__/config',
      tasksLocation: './tests/__fixtures__/tasks',
      modulesLocation: './tests/__fixtures__/modules'
    })

    expect(core).toEqual({
      App: null,
      appConfig: null,
      appInstance: null,
      coreConfig: expect.objectContaining({ modulesLocation: './tests/__fixtures__/modules' }),
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
    await runConsole({
      appsLocation: './tests/__fixtures__/noexistent',
      configLocation: './tests/__fixtures__/config',
      tasksLocation: './tests/__fixtures__/tasks',
      modulesLocation: './tests/__fixtures__/modules'
    })

    expect(process.exit).toHaveBeenCalledWith(1)
  })

  it('exits if proyect config has errors', async (): Promise<void> => {
    await runConsole({
      appsLocation: './tests/__fixtures__/apps',
      configLocation: './tests/__fixtures__/config-errored',
      tasksLocation: './tests/__fixtures__/tasks',
      modulesLocation: './tests/__fixtures__/modules'
    })

    expect(process.exit).toHaveBeenCalledWith(1)
  })

  it('exits if modules has errors', async (): Promise<void> => {
    await runConsole({
      appsLocation: './tests/__fixtures__/apps',
      configLocation: './tests/__fixtures__/config',
      tasksLocation: './tests/__fixtures__/tasks',
      modulesLocation: './tests/__fixtures__/modules-load-error'
    })

    expect(process.exit).toHaveBeenCalledWith(1)
  })

  it('continues if modules warnings are present (log the warnings)', async (): Promise<void> => {
    await runConsole({
      appsLocation: './tests/__fixtures__/apps',
      configLocation: './tests/__fixtures__/config',
      tasksLocation: './tests/__fixtures__/tasks',
      modulesLocation: './tests/__fixtures__/modules-warnings'
    })

    expect(core.running).toBeTruthy()
  })

  it('exits if repl server starting fails (unload modules)', async (): Promise<void> => {
    jest.spyOn(repl, 'start').mockImplementation((): never => {
      throw 'Error'
    })

    await runConsole({
      appsLocation: './tests/__fixtures__/apps',
      configLocation: './tests/__fixtures__/config',
      tasksLocation: './tests/__fixtures__/tasks',
      modulesLocation: './tests/__fixtures__/modules'
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(core.coreModules).toEqual({})
  })

  it('unload modules when repl server exists', async (): Promise<void> => {
    await runConsole({
      appsLocation: './tests/__fixtures__/apps',
      configLocation: './tests/__fixtures__/config',
      tasksLocation: './tests/__fixtures__/tasks',
      modulesLocation: './tests/__fixtures__/modules'
    })

    await replServerMock.listeners('exit')[0]()

    expect(core.coreModules).toEqual({})
  })

  it('exists if module releasing fails', async (): Promise<void> => {
    await runConsole({
      appsLocation: './tests/__fixtures__/apps',
      configLocation: './tests/__fixtures__/config',
      tasksLocation: './tests/__fixtures__/tasks',
      modulesLocation: './tests/__fixtures__/modules-release-error'
    })

    await replServerMock.listeners('exit')[0]()

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(core.coreModules).toEqual({})
  })
})
