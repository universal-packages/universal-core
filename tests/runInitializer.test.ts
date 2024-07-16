import { Logger } from '@universal-packages/logger'
import { populateTemplates } from '@universal-packages/template-populator'

import { runInitializer } from '../src/runInitializer'
import AbortableInitializer from './__fixtures__/initializers-abortable/Abortable.universal-core-initializer'
import HackyLoadInitializer from './__fixtures__/initializers-hacky-load/HackyLoad.universal-core-initializer'
import GoodInitializer from './__fixtures__/initializers/Good.universal-core-initializer'

jest.mock('@universal-packages/template-populator')

jest.spyOn(process, 'exit').mockImplementation(((): void => {}) as any)

beforeEach((): void => {
  jest.clearAllMocks()
  GoodInitializer.iWasInitialized = false
  process.removeAllListeners()
})

describe(runInitializer, (): void => {
  it('do all the preparations finds an initializer and runs it (sets core)', async (): Promise<void> => {
    await runInitializer('Good', {
      locationOverride: './tests/__fixtures__/initializers',
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(GoodInitializer.iWasInitialized).toEqual(true)
    expect(core).toEqual({
      App: null,
      appConfig: null,
      appInstance: null,
      coreConfig: expect.any(Object),
      coreModules: null,
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
      environments: null,
      Initializer: GoodInitializer,
      initializerInstance: expect.any(GoodInitializer),
      logger: expect.any(Logger),
      projectConfig: null,
      stoppable: true,
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
    expect(Logger).toHaveLogged({ level: 'DEBUG', title: 'Core config loaded', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'INFO', title: 'Initializing good-initializer...', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'DEBUG', title: 'good-initializer initialized', category: 'CORE' })
  })

  it('automatically populates the default template', async (): Promise<void> => {
    await runInitializer('Good', {
      locationOverride: './tests/__fixtures__/initializers',
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(populateTemplates).toHaveBeenCalledWith(expect.stringMatching(/universal-core\/tests\/__fixtures__\/initializers\/templates\/default/), './src', {
      replacementVariables: {
        appName: '@universal-packages/core',
        sourceLocation: './src'
      }
    })
  })

  it('uses the typescript template if requested', async (): Promise<void> => {
    await runInitializer('Good', {
      args: { typescript: true },
      locationOverride: './tests/__fixtures__/initializers',
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(populateTemplates).toHaveBeenCalledWith(expect.stringMatching(/universal-core\/tests\/__fixtures__\/initializers\/templates\/typescript/), './src', {
      replacementVariables: {
        appName: '@universal-packages/core',
        sourceLocation: './src'
      }
    })
  })

  it('warns that the typescript template was requested but none is available', async (): Promise<void> => {
    await runInitializer('Good', {
      args: { typescript: true },
      locationOverride: './tests/__fixtures__/initializers-no-typescript',
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(populateTemplates).not.toHaveBeenCalledWith(expect.stringMatching(/universal-core\/tests\/__fixtures__\/initializers\/templates\/typescript/), './src', {
      replacementVariables: {
        appName: '@universal-packages/core',
        sourceLocation: './src'
      }
    })
    expect(Logger).toHaveLogged({
      level: 'WARNING',
      title: 'Typescript template not available',
      message: 'The typescript template was requested but the initializer does not provide it',
      category: 'CORE'
    })
  })

  it('exits if core config has errors', async (): Promise<void> => {
    await runInitializer('Good', {
      locationOverride: './tests/__fixtures__/initializers',
      coreConfigOverride: {
        apps: 10 as any,
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(GoodInitializer.iWasInitialized).toEqual(false)
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error loading the core config', category: 'CORE' })
  })

  it('exits if initializer load fails', async (): Promise<void> => {
    await runInitializer('load-error', {
      locationOverride: './tests/__fixtures__/initializers-load-error',
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error loading the initializer', category: 'CORE' })
  })

  it('exits if initializer run fails', async (): Promise<void> => {
    await runInitializer('run-error', {
      locationOverride: './tests/__fixtures__/initializers-run-error',
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error while initializing run-error-initializer', category: 'CORE' })
  })

  it('aborts the execution when receiving the signal', async (): Promise<void> => {
    setTimeout((): void => {
      process.emit('SIGINT')
    }, 200)

    await runInitializer('AbortableInitializer', {
      locationOverride: './tests/__fixtures__/initializers-abortable',
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(AbortableInitializer.iWasInitialized).toEqual(true)
    expect(AbortableInitializer.iWasAborted).toEqual(true)
    expect(Logger).toHaveLogged({ level: 'INFO', title: 'Aborting initialization gracefully', category: 'CORE' })
    expect(Logger).toHaveLogged({ level: 'DEBUG', title: 'Initializer aborted', category: 'CORE' })
  })

  it('exists if abortion goes wrong', async (): Promise<void> => {
    setTimeout((): void => {
      process.emit('SIGINT')
    }, 200)

    await runInitializer('AbortError', {
      locationOverride: './tests/__fixtures__/initializers-abort-error',
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(process.exit).toHaveBeenCalledWith(1)
    expect(Logger).toHaveLogged({ level: 'ERROR', title: 'There was an error while aborting initializer', category: 'CORE' })
  })

  it('waits until the execution reaches a stoppable state to start aborting (so we do not unload at the same time the task is being loaded)', async (): Promise<void> => {
    setTimeout((): void => {
      process.emit('SIGINT')

      setTimeout((): void => {
        expect(HackyLoadInitializer.iWasInitialized).toEqual(true)
        expect(HackyLoadInitializer.iWasAborted).toEqual(false)
        core.stoppable = true
      }, 500)
    }, 200)

    await runInitializer('HackyLoad', {
      locationOverride: './tests/__fixtures__/initializers-hacky-load',
      coreConfigOverride: {
        apps: { location: './tests/__fixtures__/apps' },
        config: { location: './tests/__fixtures__/config' },
        environments: { location: './tests/__fixtures__/environments' },
        tasks: { location: './tests/__fixtures__/tasks-hacky-load' },
        modules: { location: './tests/__fixtures__/modules' }
      }
    })

    expect(HackyLoadInitializer.iWasInitialized).toEqual(true)
    expect(HackyLoadInitializer.iWasAborted).toEqual(true)
  })
})
