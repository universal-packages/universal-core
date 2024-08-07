import { Logger } from '@universal-packages/logger'
import EventEmitter from 'events'
import repl from 'repl'

import { EnvironmentEvent } from '../src'
import { runConsole } from '../src/runConsole'
import ControlEnvironment from './__fixtures__/environments-event-error/Control.environment'
import EventErrorEnvironment from './__fixtures__/environments-event-error/EventError.environment'
import ConsoleEnvironment from './__fixtures__/environments/Console.environment'
import NotProductionEnvironment from './__fixtures__/environments/NotProduction.environment'
import TestEnvironment from './__fixtures__/environments/Test.environment'
import UniversalEnvironment from './__fixtures__/environments/Universal.environment'
import ConsoleModule from './__fixtures__/modules/Console.module'
import ExcellentModule from './__fixtures__/modules/Excellent.module'
import GoodModule from './__fixtures__/modules/Good.module'
import NotProductionModule from './__fixtures__/modules/NotProduction.module'
import TestModule from './__fixtures__/modules/Test.module'

class ReplServerMock extends EventEmitter {
  public setupHistory = jest.fn()
}

const replServerMock = new ReplServerMock()

beforeEach((): void => {
  jest.spyOn(repl, 'start').mockImplementation(((): ReplServerMock => replServerMock) as any)
  jest.spyOn(process, 'exit').mockImplementation(((): void => {}) as any)

  ConsoleEnvironment.calls = []
  TestEnvironment.calls = []
  UniversalEnvironment.calls = []
  ControlEnvironment.calls = []
  jest.clearAllMocks()
  process.removeAllListeners()
})

describe(runConsole, (): void => {
  it('do all the preparations and runs a repl server (sets core)', async (): Promise<void> => {
    await runConsole({
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(core).toEqual({
      App: null,
      appConfig: null,
      appInstance: null,
      coreConfig: expect.objectContaining({ modules: { asGlobals: true, location: './tests/__fixtures__/modules' } }),
      coreModules: {
        consoleModule: expect.any(ConsoleModule),
        excellentModule: expect.any(ExcellentModule),
        goodModule: expect.any(GoodModule),
        notProductionModule: expect.any(NotProductionModule),
        testModule: expect.any(TestModule)
      },
      developer: {
        bucket: {},
        terminalPresenter: {
          setProgressPercentage: expect.any(Function),
          increaseProgressPercentageBy: expect.any(Function),
          startProgressIncreaseSimulation: expect.any(Function),
          finishProgressIncreaseSimulation: expect.any(Function),
          setScriptOutput: expect.any(Function),
          setSubProcess: expect.any(Function),
          runSubProcess: expect.any(Function)
        }
      },
      environments: [expect.any(ConsoleEnvironment), expect.any(NotProductionEnvironment), expect.any(TestEnvironment), expect.any(UniversalEnvironment)],
      Initializer: null,
      initializerInstance: null,
      logger: expect.any(Logger),
      projectConfig: expect.objectContaining({ ExcellentModule: expect.anything(), 'good-module': expect.anything(), 'good-app': expect.anything() }),
      stoppable: false,
      stopping: false,
      Task: null,
      taskInstance: null,
      terminalPresenter: {
        configure: expect.any(Function),
        appendRealTimeDocument: expect.any(Function),
        clearRealTimeDocuments: expect.any(Function),
        clearScreen: expect.any(Function),
        captureConsole: expect.any(Function),
        prependRealTimeDocument: expect.any(Function),
        present: expect.any(Function),
        printString: expect.any(Function),
        printDocument: expect.any(Function),
        releaseConsole: expect.any(Function),
        removeRealTimeDocument: expect.any(Function),
        restore: expect.any(Function),
        updateRealTimeDocument: expect.any(Function),
        OPTIONS: expect.any(Object)
      }
    })
    expect(ConsoleEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeConsoleRuns', 'afterConsoleRuns'])
    expect(TestEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeConsoleRuns', 'afterConsoleRuns'])
    expect(UniversalEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeConsoleRuns', 'afterConsoleRuns'])
    expect(NotProductionEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeConsoleRuns', 'afterConsoleRuns'])
    expect(Logger).toHaveLogged({ level: 'DEBUG', title: 'Core config loaded', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'DEBUG', title: 'Project config loaded', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'DEBUG', title: 'Core environments loaded', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'DEBUG', title: 'Core modules loaded', category: 'CORE' })
  })

  it('exits if core config has errors', async (): Promise<void> => {
    await runConsole({
      coreConfigOverride: {
        apps: { location: 10 as any },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(ConsoleEnvironment.calls).toEqual([])
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error loading the core config', category: 'CORE' })
  })

  it('exits if project config has errors', async (): Promise<void> => {
    await runConsole({
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config-errored' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(ConsoleEnvironment.calls).toEqual([])
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error loading the project config', category: 'CORE' })
  })

  it('exits if environments load fails', async (): Promise<void> => {
    await runConsole({
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments-load-error' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(ConsoleEnvironment.calls).toEqual([])
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error loading core environments', category: 'CORE' })
  })

  it('exits if modules has errors', async (): Promise<void> => {
    await runConsole({
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules-load-error' }
      }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(ConsoleEnvironment.calls).toEqual(['beforeModulesLoad'])
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error loading core modules', category: 'CORE' })
  })

  it('continues if modules warnings are present (log the warnings)', async (): Promise<void> => {
    await runConsole({
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules-warnings' }
      }
    })

    expect(ConsoleEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeConsoleRuns', 'afterConsoleRuns'])
    expect(Logger).toHaveLogged({ level: 'WARNING', title: 'Two modules have the same name: good-module', category: 'CORE' })
  })

  it('exits if repl server starting fails (unload modules)', async (): Promise<void> => {
    jest.spyOn(repl, 'start').mockImplementation((): never => {
      throw 'Error'
    })

    await runConsole({
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(core.coreModules).toEqual({})
    expect(ConsoleEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeConsoleRuns'])
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error while running the console', category: 'CORE' })
  })

  it('unload modules when repl server exists', async (): Promise<void> => {
    await runConsole({
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    await replServerMock.listeners('exit')[0]()

    expect(core.coreModules).toEqual({})
    expect(ConsoleEnvironment.calls).toEqual([
      'beforeModulesLoad',
      'afterModulesLoad',
      'beforeConsoleRuns',
      'afterConsoleRuns',
      'afterConsoleStops',
      'beforeModulesRelease',
      'afterModulesRelease'
    ])
    expect(Logger).toHaveLogged({ level: 'DEBUG', title: 'Core modules unloaded', category: 'CORE' })
  })

  it('exists if module releasing fails', async (): Promise<void> => {
    await runConsole({
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules-release-error' }
      }
    })

    await replServerMock.listeners('exit')[0]()

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(core.coreModules).toEqual({})
    expect(ConsoleEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeConsoleRuns', 'afterConsoleRuns', 'afterConsoleStops', 'beforeModulesRelease'])
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error while releasing modules', category: 'CORE' })
  })

  it('exits if environments events fails', async (): Promise<void> => {
    const baseEvents: EnvironmentEvent[] = ['beforeModulesLoad', 'afterModulesLoad', 'beforeConsoleRuns', 'afterConsoleRuns']
    const stopEvents: EnvironmentEvent[] = ['afterConsoleStops', 'beforeModulesRelease', 'afterModulesRelease']

    for (let i = 0; i < baseEvents.length; i++) {
      const currentEvent = baseEvents[i]

      ControlEnvironment.calls = []
      EventErrorEnvironment.toError = currentEvent

      await runConsole({
        coreConfigOverride: {
          apps: { location: './tests/__fixtures__/apps' },
          config: { location: './tests/__fixtures__/config' },
          environments: { location: './tests/__fixtures__/environments-event-error' },
          tasks: { location: './tests/__fixtures__/tasks' },
          modules: { location: './tests/__fixtures__/modules' }
        }
      })

      expect(ControlEnvironment.calls).toEqual(baseEvents.slice(0, i + 1))
    }

    for (let i = 0; i < stopEvents.length; i++) {
      const currentEvent = stopEvents[i]

      ControlEnvironment.calls = []
      EventErrorEnvironment.toError = currentEvent

      await runConsole({
        coreConfigOverride: {
          apps: { location: './tests/__fixtures__/apps' },
          config: { location: './tests/__fixtures__/config' },
          environments: { location: './tests/__fixtures__/environments-event-error' },
          tasks: { location: './tests/__fixtures__/tasks' },
          modules: { location: './tests/__fixtures__/modules' }
        }
      })

      await replServerMock.listeners('exit')[0]()

      expect(ControlEnvironment.calls).toEqual([...baseEvents, ...stopEvents.slice(0, i + 1)])
      expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error calling environment event', category: 'CORE' })
    }
  })
})
