import { Logger } from '@universal-packages/logger'

import { EnvironmentEvent } from '../src'
import { execTask } from '../src/execTask'
import ControlEnvironment from './__fixtures__/environments-event-error/Control.environment'
import EventErrorEnvironment from './__fixtures__/environments-event-error/EventError.environment'
import GoodTaskEnvironment from './__fixtures__/environments/GoodTask.environment'
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
  it('do all the preparations funds a task and runs it (sets core)', async (): Promise<void> => {
    await execTask(
      'Good',
      'directive',
      ['option'],
      { fast: true },
      {
        appsLocation: './tests/__fixtures__/apps',
        configLocation: './tests/__fixtures__/config',
        environmentsLocation: './tests/__fixtures__/environments',
        tasksLocation: './tests/__fixtures__/tasks',
        modulesLocation: './tests/__fixtures__/modules'
      }
    )

    expect(GoodTask.iWasExecuted).toEqual(true)
    expect(core).toEqual({
      App: null,
      appConfig: null,
      appInstance: null,
      coreConfig: expect.objectContaining({ tasksLocation: './tests/__fixtures__/tasks' }),
      coreModules: {},
      environments: [expect.any(GoodTaskEnvironment), expect.any(TaskEnvironment), expect.any(TestEnvironment), expect.any(UniversalEnvironment)],
      logger: expect.any(Logger),
      projectConfig: expect.objectContaining({ ExcellentModule: expect.anything(), 'good-module': expect.anything(), 'good-app': expect.anything() }),
      stoppable: true,
      stopping: false,
      Task: GoodTask,
      taskInstance: expect.any(GoodTask)
    })
    expect(GoodTaskEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeTaskExec', 'afterTaskExec', 'beforeModulesRelease', 'afterModulesRelease'])
    expect(TaskEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeTaskExec', 'afterTaskExec', 'beforeModulesRelease', 'afterModulesRelease'])
    expect(TestEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeTaskExec', 'afterTaskExec', 'beforeModulesRelease', 'afterModulesRelease'])
    expect(UniversalEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeTaskExec', 'afterTaskExec', 'beforeModulesRelease', 'afterModulesRelease'])
  })

  it('exits if core config has errors', async (): Promise<void> => {
    await execTask(
      'Good',
      'directive',
      ['option'],
      { fast: true },
      {
        appsLocation: './tests/__fixtures__/apps',
        configLocation: './tests/__fixtures__/config',
        environmentsLocation: './tests/__fixtures__/environments',
        tasksLocation: './tests/__fixtures__/nonexistent',
        modulesLocation: './tests/__fixtures__/modules'
      }
    )

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodTask.iWasExecuted).toEqual(false)
    expect(TaskEnvironment.calls).toEqual([])
  })

  it('exits if project config has errors', async (): Promise<void> => {
    await execTask(
      'Good',
      'directive',
      ['option'],
      { fast: true },
      {
        appsLocation: './tests/__fixtures__/apps',
        configLocation: './tests/__fixtures__/config-errored',
        environmentsLocation: './tests/__fixtures__/environments',
        tasksLocation: './tests/__fixtures__/tasks',
        modulesLocation: './tests/__fixtures__/modules'
      }
    )

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodTask.iWasExecuted).toEqual(false)
    expect(TaskEnvironment.calls).toEqual([])
  })

  it('exits if environments load fails', async (): Promise<void> => {
    await execTask(
      'Good',
      'directive',
      ['option'],
      { fast: true },
      {
        appsLocation: './tests/__fixtures__/apps',
        configLocation: './tests/__fixtures__/config',
        environmentsLocation: './tests/__fixtures__/environments-load-error',
        tasksLocation: './tests/__fixtures__/tasks',
        modulesLocation: './tests/__fixtures__/modules'
      }
    )

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodTask.iWasExecuted).toEqual(false)
    expect(TaskEnvironment.calls).toEqual([])
  })

  it('exits if task load fails', async (): Promise<void> => {
    await execTask(
      'load-error-task',
      'directive',
      ['option'],
      { fast: true },
      {
        appsLocation: './tests/__fixtures__/apps',
        configLocation: './tests/__fixtures__/config',
        environmentsLocation: './tests/__fixtures__/environments',
        tasksLocation: './tests/__fixtures__/tasks-load-error',
        modulesLocation: './tests/__fixtures__/modules'
      }
    )

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodTask.iWasExecuted).toEqual(false)
    expect(TaskEnvironment.calls).toEqual([])
  })

  it('exits if modules has errors', async (): Promise<void> => {
    await execTask(
      'Good',
      'directive',
      ['option'],
      { fast: true },
      {
        appsLocation: './tests/__fixtures__/apps',
        configLocation: './tests/__fixtures__/config',
        environmentsLocation: './tests/__fixtures__/environments',
        tasksLocation: './tests/__fixtures__/tasks',
        modulesLocation: './tests/__fixtures__/modules-load-error'
      }
    )

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodTask.iWasExecuted).toEqual(false)
    expect(TaskEnvironment.calls).toEqual(['beforeModulesLoad'])
  })

  it('continues if modules warnings are present (log the warnings)', async (): Promise<void> => {
    await execTask(
      'Good',
      'directive',
      ['option'],
      { fast: true },
      {
        appsLocation: './tests/__fixtures__/apps',
        configLocation: './tests/__fixtures__/config',
        environmentsLocation: './tests/__fixtures__/environments',
        tasksLocation: './tests/__fixtures__/tasks',
        modulesLocation: './tests/__fixtures__/modules-warnings'
      }
    )

    expect(GoodTask.iWasExecuted).toEqual(true)
    expect(TaskEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeTaskExec', 'afterTaskExec', 'beforeModulesRelease', 'afterModulesRelease'])
  })

  it('exits if task execution fails (unload modules)', async (): Promise<void> => {
    await execTask(
      'exec-error-task',
      'directive',
      ['option'],
      { fast: true },
      {
        appsLocation: './tests/__fixtures__/apps',
        configLocation: './tests/__fixtures__/config',
        environmentsLocation: './tests/__fixtures__/environments',
        tasksLocation: './tests/__fixtures__/tasks-exec-error',
        modulesLocation: './tests/__fixtures__/modules'
      }
    )

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(core.coreModules).toEqual({})
    expect(TaskEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeTaskExec'])
  })

  it('exits if modules unloading goes wrong', async (): Promise<void> => {
    await execTask(
      'good',
      'directive',
      ['option'],
      { fast: true },
      {
        appsLocation: './tests/__fixtures__/apps',
        configLocation: './tests/__fixtures__/config',
        environmentsLocation: './tests/__fixtures__/environments',
        tasksLocation: './tests/__fixtures__/tasks',
        modulesLocation: './tests/__fixtures__/modules-release-error'
      }
    )

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(core.coreModules).toEqual({})
    expect(TaskEnvironment.calls).toEqual(['beforeModulesLoad', 'afterModulesLoad', 'beforeTaskExec', 'afterTaskExec', 'beforeModulesRelease'])
  })

  it('aborts the execution when receiving the signal', async (): Promise<void> => {
    setTimeout((): void => {
      process.emit('SIGINT')
    }, 200)

    await execTask(
      'AbortableTask',
      'directive',
      ['option'],
      { fast: true },
      {
        appsLocation: './tests/__fixtures__/apps',
        configLocation: './tests/__fixtures__/config',
        environmentsLocation: './tests/__fixtures__/environments',
        tasksLocation: './tests/__fixtures__/tasks-abortable',
        modulesLocation: './tests/__fixtures__/modules'
      }
    )

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
  })

  it('exists if abortion goes wrong', async (): Promise<void> => {
    setTimeout((): void => {
      process.emit('SIGINT')
    }, 200)

    await execTask(
      'AbortError',
      'directive',
      ['option'],
      { fast: true },
      {
        appsLocation: './tests/__fixtures__/apps',
        configLocation: './tests/__fixtures__/config',
        environmentsLocation: './tests/__fixtures__/environments',
        tasksLocation: './tests/__fixtures__/tasks-abort-error',
        modulesLocation: './tests/__fixtures__/modules'
      }
    )

    expect(process.exit).toHaveBeenCalledWith(1)
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

    await execTask(
      'HackyLoad',
      'directive',
      ['option'],
      { fast: true },
      {
        appsLocation: './tests/__fixtures__/apps',
        configLocation: './tests/__fixtures__/config',
        environmentsLocation: './tests/__fixtures__/environments',
        tasksLocation: './tests/__fixtures__/tasks-hacky-load',
        modulesLocation: './tests/__fixtures__/modules'
      }
    )

    expect(HackyLoadTask.iWasExecuted).toEqual(true)
    expect(HackyLoadTask.iWasAborted).toEqual(true)
  })

  it('exits if environments events fails', async (): Promise<void> => {
    const baseEvents: EnvironmentEvent[] = ['beforeModulesLoad', 'afterModulesLoad', 'beforeTaskExec', 'afterTaskExec', 'beforeModulesRelease', 'afterModulesRelease']

    for (let i = 0; i < baseEvents.length; i++) {
      const currentEvent = baseEvents[i]

      ControlEnvironment.calls = []
      EventErrorEnvironment.toError = currentEvent

      await execTask(
        'Good',
        'directive',
        ['option'],
        { fast: true },
        {
          appsLocation: './tests/__fixtures__/apps',
          configLocation: './tests/__fixtures__/config',
          environmentsLocation: './tests/__fixtures__/environments-event-error',
          tasksLocation: './tests/__fixtures__/tasks',
          modulesLocation: './tests/__fixtures__/modules'
        }
      )

      expect(ControlEnvironment.calls).toEqual(baseEvents.slice(0, i + 1))
    }

    ControlEnvironment.calls = []
    EventErrorEnvironment.toError = 'beforeTaskAborts'

    setTimeout((): void => {
      process.emit('SIGINT')
    }, 200)

    await execTask(
      'AbortableTask',
      'directive',
      ['option'],
      { fast: true },
      {
        appsLocation: './tests/__fixtures__/apps',
        configLocation: './tests/__fixtures__/config',
        environmentsLocation: './tests/__fixtures__/environments-event-error',
        tasksLocation: './tests/__fixtures__/tasks-abortable',
        modulesLocation: './tests/__fixtures__/modules'
      }
    )

    expect(ControlEnvironment.calls).toEqual([
      'beforeModulesLoad',
      'afterModulesLoad',
      'beforeTaskExec',
      'beforeTaskAborts',
      'afterTaskExec',
      'beforeModulesRelease',
      'afterModulesRelease'
    ])

    ControlEnvironment.calls = []
    EventErrorEnvironment.toError = 'afterTaskAborts'

    setTimeout((): void => {
      process.emit('SIGINT')
    }, 200)

    await execTask(
      'AbortableTask',
      'directive',
      ['option'],
      { fast: true },
      {
        appsLocation: './tests/__fixtures__/apps',
        configLocation: './tests/__fixtures__/config',
        environmentsLocation: './tests/__fixtures__/environments-event-error',
        tasksLocation: './tests/__fixtures__/tasks-abortable',
        modulesLocation: './tests/__fixtures__/modules'
      }
    )

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
  })
})
