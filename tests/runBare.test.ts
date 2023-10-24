import { Logger } from '@universal-packages/logger'

import { EnvironmentEvent, runBare } from '../src'
import GoodApp from './__fixtures__/apps/Good.app'
import ControlEnvironment from './__fixtures__/environments-event-error/Control.environment'
import EventErrorEnvironment from './__fixtures__/environments-event-error/EventError.environment'
import AppEnvironment from './__fixtures__/environments/App.environment'
import GoodAppEnvironment from './__fixtures__/environments/GoodApp.environment'
import NotProductionEnvironment from './__fixtures__/environments/NotProduction.environment'
import TestEnvironment from './__fixtures__/environments/Test.environment'
import UniversalEnvironment from './__fixtures__/environments/Universal.environment'
import ExcellentModule from './__fixtures__/modules/Excellent.module'
import GoodModule from './__fixtures__/modules/Good.module'
import NotProductionModule from './__fixtures__/modules/NotProduction.module'
import TestModule from './__fixtures__/modules/Test.module'

jest.spyOn(process, 'exit').mockImplementation(((): void => {}) as any)
jest.mock('../src/AppWatcher')
jest.useFakeTimers()

beforeEach((): void => {
  jest.clearAllMocks()
  GoodApp.iWasPrepared = false
  GoodApp.iWasRan = false
  GoodApp.iWasStopped = false
  GoodApp.iWasReleased = false
  AppEnvironment.calls = []
  GoodAppEnvironment.calls = []
  TestEnvironment.calls = []
  UniversalEnvironment.calls = []
  ControlEnvironment.calls = []
  process.removeAllListeners()
})

describe(runBare, (): void => {
  it('do all the preparations (sets core)', async (): Promise<void> => {
    await runBare({
      apps: { location: './tests/__fixtures__/apps' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules' }
    })

    expect(core).toEqual({
      App: null,
      appConfig: null,
      appInstance: null,
      coreConfig: expect.objectContaining({ apps: { location: './tests/__fixtures__/apps' } }),
      coreModules: {
        excellentModule: expect.any(ExcellentModule),
        goodModule: expect.any(GoodModule),
        notProductionModule: expect.any(NotProductionModule),
        testModule: expect.any(TestModule)
      },
      environments: [expect.any(NotProductionEnvironment), expect.any(TestEnvironment), expect.any(UniversalEnvironment)],
      logger: expect.any(Logger),
      projectConfig: expect.objectContaining({ ExcellentModule: expect.anything(), 'good-module': expect.anything(), 'good-app': expect.anything() }),
      stoppable: true,
      stopping: false,
      Task: null,
      taskInstance: null
    })
    expect(TestEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad'])
    expect(UniversalEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad'])
    expect(NotProductionEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad'])
  })

  it('exits if core config has errors', async (): Promise<void> => {
    await runBare({
      apps: { location: './tests/__fixtures__/nonexistent' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules' }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(UniversalEnvironment.calls).toEqual([])
  })

  it('exits if project config has errors', async (): Promise<void> => {
    await runBare({
      apps: { location: './tests/__fixtures__/apps' },
      config: { location: './tests/__fixtures__/config-errored' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules' }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(UniversalEnvironment.calls).toEqual([])
  })

  it('exits if environments load fails', async (): Promise<void> => {
    await runBare({
      apps: { location: './tests/__fixtures__/apps' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments-load-error' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules' }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(UniversalEnvironment.calls).toEqual([])
  })

  it('exits if modules has errors', async (): Promise<void> => {
    await runBare({
      apps: { location: './tests/__fixtures__/apps' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules-load-error' }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(UniversalEnvironment.calls).toEqual(['beforeModulesLoad'])
  })

  it('continues if modules warnings are present (log the warnings)', async (): Promise<void> => {
    await runBare({
      apps: { location: './tests/__fixtures__/apps' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules-warnings' }
    })

    expect(UniversalEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad'])
  })

  it('unloads when calling returning function', async (): Promise<void> => {
    const unload = await runBare({
      apps: { location: './tests/__fixtures__/apps' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules' }
    })

    await unload()

    expect(UniversalEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeModulesRelease', 'afterModulesRelease'])
  })

  it('exits if modules unloading goes wrong', async (): Promise<void> => {
    const unload = await runBare({
      apps: { location: './tests/__fixtures__/apps' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules-release-error' }
    })

    await unload()

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(UniversalEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeModulesRelease'])
  })

  it("waits until the running reaches a stoppable state to start aborting (so we don't unload at the same time the thing is being loaded)", async (): Promise<void> => {
    setTimeout((): void => {
      core.stoppable = true
    }, 100)

    const unload = await runBare({
      apps: { location: './tests/__fixtures__/apps' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules' }
    })

    core.stoppable = false

    jest.runOnlyPendingTimers()

    await unload()
  })

  it('exits if environments events fails', async (): Promise<void> => {
    const baseEvents: EnvironmentEvent[] = ['beforeModulesLoad', 'afterModulesLoad']
    const stopEvents: EnvironmentEvent[] = ['beforeModulesRelease', 'afterModulesRelease']

    for (let i = 0; i < baseEvents.length; i++) {
      const currentEvent = baseEvents[i]

      ControlEnvironment.calls = []
      EventErrorEnvironment.toError = currentEvent

      await runBare({
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments-event-error' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      })

      expect(ControlEnvironment.calls).toEqual(baseEvents.slice(0, i + 1))
    }

    for (let i = 0; i < stopEvents.length; i++) {
      const currentEvent = stopEvents[i]

      process.removeAllListeners()
      ControlEnvironment.calls = []
      EventErrorEnvironment.toError = currentEvent

      const unload = await runBare({
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments-event-error' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      })

      await unload()

      expect(ControlEnvironment.calls).toEqual([...baseEvents, ...stopEvents.slice(0, i + 1)])
    }
  })
})
