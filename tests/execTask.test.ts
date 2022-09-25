import { Logger } from '@universal-packages/logger'
import { execTask } from '../src/execTask'
import AbortableTask from './__fixtures__/tasks-abortable/Abortable.task'
import HackyLoadTask from './__fixtures__/tasks-hacky-load/HackyLoad.task'
import GoodTask from './__fixtures__/tasks/Good.task'

jest.spyOn(process, 'exit').mockImplementation(((): void => {}) as any)

beforeEach((): void => {
  jest.clearAllMocks()
  GoodTask.iWasPrepared = false
  GoodTask.iWasExecuted = false
  GoodTask.iWasAborted = false
  process.removeAllListeners()
})

describe('execTask', (): void => {
  it('do all the preparations funds a task and runs it (sets core)', async (): Promise<void> => {
    await execTask(
      'Good',
      'directive',
      ['option'],
      { fast: true },
      {
        appsLocation: './tests/__fixtures__/apps',
        configLocation: './tests/__fixtures__/config',
        tasksLocation: './tests/__fixtures__/tasks',
        modulesLocation: './tests/__fixtures__/modules'
      }
    )

    expect(GoodTask.iWasPrepared).toEqual(true)
    expect(GoodTask.iWasExecuted).toEqual(true)
    expect(core).toEqual({
      App: null,
      appConfig: null,
      appInstance: null,
      coreConfig: expect.objectContaining({ tasksLocation: './tests/__fixtures__/tasks' }),
      coreModules: {},
      loaded: true,
      logger: expect.any(Logger),
      projectConfig: expect.objectContaining({ ExcellentModule: expect.anything(), 'good-module': expect.anything(), 'good-app': expect.anything() }),
      running: false,
      stopping: false,
      Task: GoodTask,
      taskInstance: expect.any(GoodTask)
    })
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
        tasksLocation: './tests/__fixtures__/nonexistent',
        modulesLocation: './tests/__fixtures__/modules'
      }
    )

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodTask.iWasPrepared).toEqual(false)
    expect(GoodTask.iWasExecuted).toEqual(false)
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
        tasksLocation: './tests/__fixtures__/tasks',
        modulesLocation: './tests/__fixtures__/modules'
      }
    )

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodTask.iWasPrepared).toEqual(false)
    expect(GoodTask.iWasExecuted).toEqual(false)
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
        tasksLocation: './tests/__fixtures__/tasks',
        modulesLocation: './tests/__fixtures__/modules-load-error'
      }
    )

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodTask.iWasPrepared).toEqual(false)
    expect(GoodTask.iWasExecuted).toEqual(false)
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
        tasksLocation: './tests/__fixtures__/tasks',
        modulesLocation: './tests/__fixtures__/modules-warnings'
      }
    )

    expect(GoodTask.iWasPrepared).toEqual(true)
    expect(GoodTask.iWasExecuted).toEqual(true)
  })

  it('exits if task preparation fails (unload modules)', async (): Promise<void> => {
    await execTask(
      'prepare-error-task',
      'directive',
      ['option'],
      { fast: true },
      {
        appsLocation: './tests/__fixtures__/apps',
        configLocation: './tests/__fixtures__/config',
        tasksLocation: './tests/__fixtures__/tasks-prepare-error',
        modulesLocation: './tests/__fixtures__/modules'
      }
    )

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(core.coreModules).toEqual({})
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
        tasksLocation: './tests/__fixtures__/tasks-exec-error',
        modulesLocation: './tests/__fixtures__/modules'
      }
    )

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(core.coreModules).toEqual({})
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
        tasksLocation: './tests/__fixtures__/tasks',
        modulesLocation: './tests/__fixtures__/modules-release-error'
      }
    )

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(core.coreModules).toEqual({})
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
        tasksLocation: './tests/__fixtures__/tasks-abortable',
        modulesLocation: './tests/__fixtures__/modules'
      }
    )

    expect(AbortableTask.iWasPrepared).toEqual(true)
    expect(AbortableTask.iWasExecuted).toEqual(true)
    expect(AbortableTask.iWasAborted).toEqual(true)
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
        tasksLocation: './tests/__fixtures__/tasks-abort-error',
        modulesLocation: './tests/__fixtures__/modules'
      }
    )

    expect(process.exit).toHaveBeenCalledWith(1)
  })

  it('waits until the execution reaches a loaded state to start aborting (so we do not unload at the same time the task is being loaded)', async (): Promise<void> => {
    setTimeout((): void => {
      process.emit('SIGINT')

      setTimeout((): void => {
        expect(HackyLoadTask.iWasPrepared).toEqual(true)
        expect(HackyLoadTask.iWasExecuted).toEqual(true)
        expect(HackyLoadTask.iWasAborted).toEqual(false)
        core.loaded = true
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
        tasksLocation: './tests/__fixtures__/tasks-hacky-load',
        modulesLocation: './tests/__fixtures__/modules'
      }
    )

    expect(HackyLoadTask.iWasPrepared).toEqual(true)
    expect(HackyLoadTask.iWasExecuted).toEqual(true)
    expect(HackyLoadTask.iWasAborted).toEqual(true)
  })
})
