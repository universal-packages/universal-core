import { Logger } from '@universal-packages/logger'

import { EnvironmentEvent } from '../src'
import { execTask } from '../src/execTask'
import ControlEnvironment from './__fixtures__/environments-event-error/Control.environment'
import EventErrorEnvironment from './__fixtures__/environments-event-error/EventError.environment'
import GoodTaskEnvironment from './__fixtures__/environments/GoodTask.environment'
import NotProductionEnvironment from './__fixtures__/environments/NotProduction.environment'
import TaskEnvironment from './__fixtures__/environments/Task.environment'
import TestEnvironment from './__fixtures__/environments/Test.environment'
import UniversalEnvironment from './__fixtures__/environments/Universal.environment'
import AbortableTask from './__fixtures__/tasks-abortable/Abortable.task'
import HackyLoadTask from './__fixtures__/tasks-hacky-load/HackyLoad.task'
import GoodTask from './__fixtures__/tasks/Good.task'

jest.spyOn(process, 'exit').mockImplementation(((): void => {}) as any)

beforeEach((): void => {
  jest.clearAllMocks()
  GoodTask.iWasExecuted = false
  GoodTask.iWasAborted = false
  GoodTaskEnvironment.calls = []
  TaskEnvironment.calls = []
  TestEnvironment.calls = []
  UniversalEnvironment.calls = []
  ControlEnvironment.calls = []
  process.removeAllListeners()
})

describe(execTask, (): void => {
  it('do all the preparations finds a task and runs it (sets core)', async (): Promise<void> => {
    await execTask('Good', {
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(GoodTask.iWasExecuted).toEqual(true)
    expect(core).toEqual({
      App: null,
      appConfig: null,
      appInstance: null,
      coreConfig: expect.objectContaining({ tasks: { location: './tests/__fixtures__/tasks' } }),
      coreModules: {},
      developer: {
        updateProgress: expect.any(Function),
        bucket: {}
      },
      environments: [
        expect.any(GoodTaskEnvironment),
        expect.any(NotProductionEnvironment),
        expect.any(TaskEnvironment),
        expect.any(TestEnvironment),
        expect.any(UniversalEnvironment)
      ],
      Initializer: null,
      initializerInstance: null,
      logger: expect.any(Logger),
      projectConfig: expect.objectContaining({ ExcellentModule: expect.anything(), 'good-module': expect.anything(), 'good-app': expect.anything() }),
      stoppable: true,
      stopping: false,
      Task: GoodTask,
      taskInstance: expect.any(GoodTask),
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
    expect(GoodTaskEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeTaskExec', 'afterTaskExec', 'beforeModulesRelease', 'afterModulesRelease'])
    expect(TaskEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeTaskExec', 'afterTaskExec', 'beforeModulesRelease', 'afterModulesRelease'])
    expect(TestEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeTaskExec', 'afterTaskExec', 'beforeModulesRelease', 'afterModulesRelease'])
    expect(UniversalEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeTaskExec', 'afterTaskExec', 'beforeModulesRelease', 'afterModulesRelease'])
    expect(NotProductionEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeTaskExec', 'afterTaskExec', 'beforeModulesRelease', 'afterModulesRelease'])
    expect(Logger).toHaveLogged({ level: 'DEBUG', title: 'Core config loaded', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'DEBUG', title: 'Project config loaded', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'DEBUG', title: 'Core environments loaded', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'DEBUG', title: 'Core modules loaded', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'INFO', title: 'good-task executing...', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'DEBUG', title: 'good-task executed', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'DEBUG', title: 'Core modules unloaded', category: 'CORE' })
  })

  it('exits if core config has errors', async (): Promise<void> => {
    await execTask('Good', {
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: 10 as any },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodTask.iWasExecuted).toEqual(false)
    expect(TaskEnvironment.calls).toEqual([])
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error loading the core config', category: 'CORE' })
  })

  it('exits if project config has errors', async (): Promise<void> => {
    await execTask('Good', {
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config-errored' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodTask.iWasExecuted).toEqual(false)
    expect(TaskEnvironment.calls).toEqual([])
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error loading the project config', category: 'CORE' })
  })

  it('exits if environments load fails', async (): Promise<void> => {
    await execTask('Good', {
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments-load-error' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodTask.iWasExecuted).toEqual(false)
    expect(TaskEnvironment.calls).toEqual([])
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error loading core environments', category: 'CORE' })
  })

  it('exits if task load fails', async (): Promise<void> => {
    await execTask('load-error-task', {
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks-load-error' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodTask.iWasExecuted).toEqual(false)
    expect(TaskEnvironment.calls).toEqual([])
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error loading the task', category: 'CORE' })
  })

  it('exits if modules has errors', async (): Promise<void> => {
    await execTask('Good', {
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules-load-error' }
      }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodTask.iWasExecuted).toEqual(false)
    expect(TaskEnvironment.calls).toEqual(['beforeModulesLoad'])
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error loading core modules', category: 'CORE' })
  })

  it('continues if modules warnings are present (log the warnings)', async (): Promise<void> => {
    await execTask('Good', {
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules-warnings' }
      }
    })

    expect(GoodTask.iWasExecuted).toEqual(true)
    expect(TaskEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeTaskExec', 'afterTaskExec', 'beforeModulesRelease', 'afterModulesRelease'])
    expect(Logger).toHaveLogged({ level: 'WARNING', title: 'Two modules have the same name: good-module', category: 'CORE' })
  })

  it('exits if task execution fails (unload modules)', async (): Promise<void> => {
    await execTask('exec-error-task', {
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks-exec-error' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(core.coreModules).toEqual({})
    expect(TaskEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeTaskExec'])
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error while executing task exec-error-task', category: 'CORE' })
  })

  it('exits if modules unloading goes wrong', async (): Promise<void> => {
    await execTask('good', {
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules-release-error' }
      }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(core.coreModules).toEqual({})
    expect(TaskEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeTaskExec', 'afterTaskExec', 'beforeModulesRelease'])
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error while releasing modules', category: 'CORE' })
  })

  it('aborts the execution when receiving the signal', async (): Promise<void> => {
    setTimeout((): void => {
      process.emit('SIGINT')
    }, 200)

    await execTask('AbortableTask', {
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks-abortable' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(AbortableTask.iWasExecuted).toEqual(true)
    expect(AbortableTask.iWasAborted).toEqual(true)
    expect(TaskEnvironment.calls).toEqual([
      'beforeModulesLoad',
      'afterModulesLoad',
      'beforeTaskExec',
      'beforeTaskAborts',
      'afterTaskAborts',
      'afterTaskExec',
      'beforeModulesRelease',
      'afterModulesRelease'
    ])
    expect(Logger).toHaveLogged({ level: 'INFO', title: 'Aborting task gracefully', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'DEBUG', title: 'Task aborted', category: 'CORE' })
  })

  it('exists if abortion goes wrong', async (): Promise<void> => {
    setTimeout((): void => {
      process.emit('SIGINT')
    }, 200)

    await execTask('AbortError', {
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks-abort-error' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error while aborting task', category: 'CORE' })
  })

  it('waits until the execution reaches a stoppable state to start aborting (so we do not unload at the same time the task is being loaded)', async (): Promise<void> => {
    setTimeout((): void => {
      process.emit('SIGINT')

      setTimeout((): void => {
        expect(HackyLoadTask.iWasExecuted).toEqual(true)
        expect(HackyLoadTask.iWasAborted).toEqual(false)
        core.stoppable = true
      }, 500)
    }, 200)

    await execTask('HackyLoad', {
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks-hacky-load' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(HackyLoadTask.iWasExecuted).toEqual(true)
    expect(HackyLoadTask.iWasAborted).toEqual(true)
  })

  it('exits if environments events fails', async (): Promise<void> => {
    const baseEvents: EnvironmentEvent[] = ['beforeModulesLoad', 'afterModulesLoad', 'beforeTaskExec', 'afterTaskExec', 'beforeModulesRelease', 'afterModulesRelease']

    for (let i = 0; i < baseEvents.length; i++) {
      const currentEvent = baseEvents[i]

      ControlEnvironment.calls = []
      EventErrorEnvironment.toError = currentEvent

      await execTask('Good', {
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

    ControlEnvironment.calls = []
    EventErrorEnvironment.toError = 'beforeTaskAborts'

    setTimeout((): void => {
      process.emit('SIGINT')
    }, 200)

    await execTask('AbortableTask', {
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments-event-error' },
        tasks: { location: './tests/__fixtures__/tasks-abortable' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(ControlEnvironment.calls).toEqual([
      'beforeModulesLoad',
      'afterModulesLoad',
      'beforeTaskExec',
      'beforeTaskAborts',
      'afterTaskExec',
      'beforeModulesRelease',
      'afterModulesRelease'
    ])
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error calling environment event', category: 'CORE' })

    ControlEnvironment.calls = []
    EventErrorEnvironment.toError = 'afterTaskAborts'

    setTimeout((): void => {
      process.emit('SIGINT')
    }, 200)

    await execTask('AbortableTask', {
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments-event-error' },
        tasks: { location: './tests/__fixtures__/tasks-abortable' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(ControlEnvironment.calls).toEqual([
      'beforeModulesLoad',
      'afterModulesLoad',
      'beforeTaskExec',
      'beforeTaskAborts',
      'afterTaskAborts',
      'afterTaskExec',
      'beforeModulesRelease',
      'afterModulesRelease'
    ])
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error calling environment event', category: 'CORE' })
  })
})
