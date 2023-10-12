import { Logger } from '@universal-packages/logger'

import { EnvironmentEvent } from '../src'
import { runApp } from '../src/runApp'
import GoodApp from './__fixtures__/apps/Good.app'
import ControlEnvironment from './__fixtures__/environments-event-error/Control.environment'
import EventErrorEnvironment from './__fixtures__/environments-event-error/EventError.environment'
import AppEnvironment from './__fixtures__/environments/App.environment'
import GoodAppEnvironment from './__fixtures__/environments/GoodApp.environment'
import NotProductionEnvironment from './__fixtures__/environments/NotProduction.environment'
import TestEnvironment from './__fixtures__/environments/Test.environment'
import UniversalEnvironment from './__fixtures__/environments/Universal.environment'
import AppModule from './__fixtures__/modules/App.module'
import ExcellentModule from './__fixtures__/modules/Excellent.module'
import GoodModule from './__fixtures__/modules/Good.module'
import GoodAppModule from './__fixtures__/modules/GoodApp.module'
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

describe(runApp, (): void => {
  it('do all the preparations funds an app and runs it (sets core)', async (): Promise<void> => {
    await runApp('Good', { fast: true }, false, {
      apps: { location: './tests/__fixtures__/apps' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules' }
    })

    expect(GoodApp.iWasPrepared).toEqual(true)
    expect(GoodApp.iWasRan).toEqual(true)
    expect(core).toEqual({
      App: GoodApp,
      appConfig: { doStuff: true, test: true },
      appInstance: expect.any(GoodApp),
      coreConfig: expect.objectContaining({ apps: { location: './tests/__fixtures__/apps' } }),
      coreModules: {
        appModule: expect.any(AppModule),
        excellentModule: expect.any(ExcellentModule),
        goodModule: expect.any(GoodModule),
        goodAppModule: expect.any(GoodAppModule),
        notProductionModule: expect.any(NotProductionModule),
        testModule: expect.any(TestModule)
      },
      environments: [
        expect.any(AppEnvironment),
        expect.any(GoodAppEnvironment),
        expect.any(NotProductionEnvironment),
        expect.any(TestEnvironment),
        expect.any(UniversalEnvironment)
      ],
      logger: expect.any(Logger),
      projectConfig: expect.objectContaining({ ExcellentModule: expect.anything(), 'good-module': expect.anything(), 'good-app': expect.anything() }),
      stoppable: true,
      stopping: false,
      Task: null,
      taskInstance: null
    })
    expect(AppEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeAppPrepare', 'afterAppPrepare', 'beforeAppRuns', 'afterAppRuns'])
    expect(GoodAppEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeAppPrepare', 'afterAppPrepare', 'beforeAppRuns', 'afterAppRuns'])
    expect(TestEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeAppPrepare', 'afterAppPrepare', 'beforeAppRuns', 'afterAppRuns'])
    expect(UniversalEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeAppPrepare', 'afterAppPrepare', 'beforeAppRuns', 'afterAppRuns'])
    expect(NotProductionEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeAppPrepare', 'afterAppPrepare', 'beforeAppRuns', 'afterAppRuns'])
  })

  it('exits if core config has errors', async (): Promise<void> => {
    await runApp('Good', { fast: true }, false, {
      apps: { location: './tests/__fixtures__/nonexistent' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules' }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodApp.iWasPrepared).toEqual(false)
    expect(GoodApp.iWasRan).toEqual(false)
    expect(AppEnvironment.calls).toEqual([])
  })

  it('exits if project config has errors', async (): Promise<void> => {
    await runApp('Good', { fast: true }, false, {
      apps: { location: './tests/__fixtures__/apps' },
      config: { location: './tests/__fixtures__/config-errored' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules' }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodApp.iWasPrepared).toEqual(false)
    expect(GoodApp.iWasRan).toEqual(false)
    expect(AppEnvironment.calls).toEqual([])
  })

  it('exits if environments load fails', async (): Promise<void> => {
    await runApp('Good', { fast: true }, false, {
      apps: { location: './tests/__fixtures__/apps' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments-load-error' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules' }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodApp.iWasPrepared).toEqual(false)
    expect(GoodApp.iWasRan).toEqual(false)
    expect(AppEnvironment.calls).toEqual([])
  })

  it('exits if app load fails', async (): Promise<void> => {
    await runApp('load-error-app', { fast: true }, false, {
      apps: { location: './tests/__fixtures__/apps-load-error' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules' }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodApp.iWasPrepared).toEqual(false)
    expect(GoodApp.iWasRan).toEqual(false)
    expect(AppEnvironment.calls).toEqual([])
  })

  it('exits if modules has errors', async (): Promise<void> => {
    await runApp('Good', { fast: true }, false, {
      apps: { location: './tests/__fixtures__/apps' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules-load-error' }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodApp.iWasPrepared).toEqual(false)
    expect(GoodApp.iWasRan).toEqual(false)
    expect(AppEnvironment.calls).toEqual(['beforeModulesLoad'])
  })

  it('continues if modules warnings are present (log the warnings)', async (): Promise<void> => {
    await runApp('Good', { fast: true }, false, {
      apps: { location: './tests/__fixtures__/apps' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules-warnings' }
    })

    expect(GoodApp.iWasPrepared).toEqual(true)
    expect(GoodApp.iWasRan).toEqual(true)
    expect(AppEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeAppPrepare', 'afterAppPrepare', 'beforeAppRuns', 'afterAppRuns'])
  })

  it('exits if app preparation fails (unload modules)', async (): Promise<void> => {
    await runApp('prepare-error-app', { fast: true }, false, {
      apps: { location: './tests/__fixtures__/apps-prepare-error' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules' }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(core.coreModules).toEqual({})
    expect(AppEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeAppPrepare'])
  })

  it('exits if running the app fails (unload modules)', async (): Promise<void> => {
    await runApp('run-error-app', { fast: true }, false, {
      apps: { location: './tests/__fixtures__/apps-run-error' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules' }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(core.coreModules).toEqual({})
    expect(AppEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeAppPrepare', 'afterAppPrepare', 'beforeAppRuns'])
  })

  it('stops the app when receiving the signal', async (): Promise<void> => {
    await runApp('good-app', { fast: true }, false, {
      apps: { location: './tests/__fixtures__/apps' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules' }
    })

    await process.listeners('SIGINT')[0]('SIGINT')

    expect(GoodApp.iWasPrepared).toEqual(true)
    expect(GoodApp.iWasRan).toEqual(true)
    expect(GoodApp.iWasStopped).toEqual(true)
    expect(GoodApp.iWasReleased).toEqual(true)
    expect(AppEnvironment.calls).toEqual([
      'beforeModulesLoad',
      'afterModulesLoad',
      'beforeAppPrepare',
      'afterAppPrepare',
      'beforeAppRuns',
      'afterAppRuns',
      'beforeAppStops',
      'afterAppStops',
      'beforeAppRelease',
      'afterAppRelease',
      'beforeModulesRelease',
      'afterModulesRelease'
    ])
  })

  it('exists if stopping goes wrong', async (): Promise<void> => {
    await runApp('stop-error-app', { fast: true }, false, {
      apps: { location: './tests/__fixtures__/apps-stop-error' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules' }
    })

    jest.runOnlyPendingTimers()

    await process.listeners('SIGINT')[0]('SIGINT')

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(core.coreModules).toEqual({})
    expect(AppEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeAppPrepare', 'afterAppPrepare', 'beforeAppRuns', 'afterAppRuns', 'beforeAppStops'])
  })

  it('exists if releasing goes wrong', async (): Promise<void> => {
    await runApp('release-error-app', { fast: true }, false, {
      apps: { location: './tests/__fixtures__/apps-release-error' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules' }
    })

    jest.runOnlyPendingTimers()

    await process.listeners('SIGINT')[0]('SIGINT')

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(core.coreModules).toEqual({})
    expect(AppEnvironment.calls).toEqual([
      'beforeModulesLoad',
      'afterModulesLoad',
      'beforeAppPrepare',
      'afterAppPrepare',
      'beforeAppRuns',
      'afterAppRuns',
      'beforeAppStops',
      'afterAppStops',
      'beforeAppRelease'
    ])
  })

  it('exits if modules unloading goes wrong', async (): Promise<void> => {
    await runApp('good-app', { fast: true }, false, {
      apps: { location: './tests/__fixtures__/apps' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules-release-error' }
    })

    jest.runOnlyPendingTimers()

    await process.listeners('SIGINT')[0]('SIGINT')

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(AppEnvironment.calls).toEqual([
      'beforeModulesLoad',
      'afterModulesLoad',
      'beforeAppPrepare',
      'afterAppPrepare',
      'beforeAppRuns',
      'afterAppRuns',
      'beforeAppStops',
      'afterAppStops',
      'beforeAppRelease',
      'afterAppRelease',
      'beforeModulesRelease'
    ])
  })

  it("waits until the running reaches a stoppable state to start aborting (so we don't unload at the same time the app is being loaded)", async (): Promise<void> => {
    setTimeout((): void => {
      expect(GoodApp.iWasPrepared).toEqual(true)
      expect(GoodApp.iWasRan).toEqual(true)
      expect(GoodApp.iWasStopped).toEqual(false)
      expect(GoodApp.iWasReleased).toEqual(false)
      core.stoppable = true
    }, 500)

    await runApp('good-app', { fast: true }, false, {
      apps: { location: './tests/__fixtures__/apps' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules' }
    })

    core.stoppable = false

    jest.runOnlyPendingTimers()

    await process.listeners('SIGINT')[0]('SIGINT')

    expect(GoodApp.iWasPrepared).toEqual(true)
    expect(GoodApp.iWasRan).toEqual(true)
    expect(GoodApp.iWasStopped).toEqual(true)
    expect(GoodApp.iWasReleased).toEqual(true)
  })

  it('special signals are used for restarting and killing when demonized', async (): Promise<void> => {
    await runApp('good-app', { fast: true }, true, {
      apps: { location: './tests/__fixtures__/apps' },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules' }
    })

    jest.runOnlyPendingTimers()

    await process.listeners('SIGINT')[0]('SIGINT')
    await process.listeners('SIGTERM')[0]('SIGTERM')

    jest.runOnlyPendingTimers()

    expect(process.exit).not.toHaveBeenCalled()
    expect(GoodApp.iWasStopped).toEqual(false)
    expect(GoodApp.iWasReleased).toEqual(false)

    jest.runOnlyPendingTimers()

    await process.listeners('SIGABRT')[0]('SIGABRT')

    expect(process.exit).not.toHaveBeenCalled()
    expect(GoodApp.iWasStopped).toEqual(true)
    expect(GoodApp.iWasReleased).toEqual(true)

    jest.runOnlyPendingTimers()

    await process.listeners('SIGALRM')[0]('SIGALRM')

    expect(process.exit).not.toHaveBeenCalled()
    expect(GoodApp.iWasStopped).toEqual(true)
    expect(GoodApp.iWasReleased).toEqual(true)

    jest.runOnlyPendingTimers()

    await process.listeners('SIGABRT')[0]('SIGABRT')

    expect(process.exit).toHaveBeenLastCalledWith(0)
  })

  it('runs an app watcher if configured', async (): Promise<void> => {
    await runApp('good-app', { fast: true }, false, {
      apps: { location: './tests/__fixtures__/apps', watcher: { enabled: true } },
      config: { location: './tests/__fixtures__/config' },
      environments: { location: './tests/__fixtures__/environments' },
      tasks: { location: './tests/__fixtures__/tasks' },
      modules: { location: './tests/__fixtures__/modules' }
    })

    jest.runOnlyPendingTimers()

    process.listeners('SIGINT')[0]('SIGINT')

    expect(core.stopping).toBeTruthy()

    process.listeners('SIGTERM')[0]('SIGTERM')
    expect(process.exit).not.toHaveBeenCalled()
    expect(AppEnvironment.calls).toEqual([])
    expect(TestEnvironment.calls).toEqual([])
  })

  it('exits if environments events fails', async (): Promise<void> => {
    const baseEvents: EnvironmentEvent[] = ['beforeModulesLoad', 'afterModulesLoad', 'beforeAppPrepare', 'afterAppPrepare', 'beforeAppRuns', 'afterAppRuns']
    const stopEvents: EnvironmentEvent[] = ['beforeAppStops', 'afterAppStops', 'beforeAppRelease', 'afterAppRelease', 'beforeModulesRelease', 'afterModulesRelease']

    for (let i = 0; i < baseEvents.length; i++) {
      const currentEvent = baseEvents[i]

      ControlEnvironment.calls = []
      EventErrorEnvironment.toError = currentEvent

      await runApp('Good', { fast: true }, false, {
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

      await runApp('Good', { fast: true }, false, {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments-event-error' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      })

      await process.listeners('SIGINT')[0]('SIGINT')

      expect(ControlEnvironment.calls).toEqual([...baseEvents, ...stopEvents.slice(0, i + 1)])
    }
  })
})
