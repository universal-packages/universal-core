import { Core } from '../src'
import AppEnvironment from './__fixtures__/environments/App.environment'
import ConsoleEnvironment from './__fixtures__/environments/Console.environment'
import GoodAppEnvironment from './__fixtures__/environments/GoodApp.environment'
import GoodTaskEnvironment from './__fixtures__/environments/GoodTask.environment'
import TaskEnvironment from './__fixtures__/environments/Task.environment'
import TestEnvironment from './__fixtures__/environments/Test.environment'
import UniversalEnvironment from './__fixtures__/environments/Universal.environment'
import AModule from './__fixtures__/modules-prepare-error/A.module'
import ZModule from './__fixtures__/modules-release-error/Z.module'
import ExcellentModule from './__fixtures__/modules/Excellent.module'
import GoodModule from './__fixtures__/modules/Good.module'

describe(Core, (): void => {
  describe('.getCoreConfig', (): void => {
    it('loads the core config set up', async (): Promise<void> => {
      const config = await Core.getCoreConfig()

      expect(config).not.toBeUndefined()
    })

    it('lets you override config', async (): Promise<void> => {
      const config = await Core.getCoreConfig({ appsLocation: './tests', tasksLocation: './tests', configLocation: './tests' })

      expect(config).toMatchObject({ appsLocation: './tests', tasksLocation: './tests', configLocation: './tests' })
    })

    it('validates the core config schema', async (): Promise<void> => {
      let error: Error

      try {
        const config = await Core.getCoreConfig({
          appsLocation: './nop',
          appWatcher: {
            enabled: 'nop',
            ignore: [55]
          },
          configLocation: './nop',
          modulesLocation: './nop',
          modulesAsGlobals: 'nop',
          tasksLocation: './nop',
          logger: {
            level: 'LEVEL',
            silence: 'nop',
            terminal: {
              clear: 'nop',
              enable: 'nop',
              withHeader: 'nop'
            },
            localFile: {
              asJson: 'nop',
              location: '/nop',
              enable: 'nop'
            }
          }
        } as any)
      } catch (err) {
        error = err
      }

      expect(error.message).toEqual(`appsLocation - Location is not accessible
appWatcher.enabled - appWatcher.enabled must be of type Boolean.
appWatcher.ignore.0 - appWatcher.ignore.0 must be of type String.
configLocation - Location is not accessible
modulesLocation - Location is not accessible
modulesAsGlobals - modulesAsGlobals must be of type Boolean.
tasksLocation - Location is not accessible
logger.level - Must be one of: FATAL | ERROR | WARNING | QUERY | INFO | DEBUG | TRACE
logger.silence - logger.silence must be of type Boolean.
logger.terminal.enable - logger.terminal.enable must be of type Boolean.
logger.terminal.clear - logger.terminal.clear must be of type Boolean.
logger.terminal.withHeader - logger.terminal.withHeader must be of type Boolean.
logger.localFile.enable - logger.localFile.enable must be of type Boolean.
logger.localFile.asJson - logger.localFile.asJson must be of type Boolean.
logger.localFile.location - Location is not accessible`)
    })
  })

  describe('.getProjectConfig', (): void => {
    it('loads the project config in the config directory (whole)', async (): Promise<void> => {
      const config = await Core.getProjectConfig({ configLocation: './tests/__fixtures__/config' })

      expect(config).toEqual({
        'good-app': { doStuff: true, test: true },
        'good-module': { isLocal: true, test: true },
        ExcellentModule: { isSecond: true, test: true }
      })
    })
  })

  describe('.getCoreEnvironments', (): void => {
    it('loads all core environments for NODE_ENV and not constrains specified', async (): Promise<void> => {
      const logger = Core.getCoreLogger()
      const environments = await Core.getCoreEnvironments({ environmentsLocation: './tests/__fixtures__/environments' }, logger)

      expect(environments).toEqual([expect.any(TestEnvironment), expect.any(UniversalEnvironment)])
    })

    it('loads all core environments by process type', async (): Promise<void> => {
      const logger = Core.getCoreLogger()

      let environments = await Core.getCoreEnvironments({ environmentsLocation: './tests/__fixtures__/environments' }, logger, 'apps')
      expect(environments).toEqual([expect.any(AppEnvironment), expect.any(TestEnvironment), expect.any(UniversalEnvironment)])

      environments = await Core.getCoreEnvironments({ environmentsLocation: './tests/__fixtures__/environments' }, logger, 'console')
      expect(environments).toEqual([expect.any(ConsoleEnvironment), expect.any(TestEnvironment), expect.any(UniversalEnvironment)])

      environments = await Core.getCoreEnvironments({ environmentsLocation: './tests/__fixtures__/environments' }, logger, 'tasks')
      expect(environments).toEqual([expect.any(TaskEnvironment), expect.any(TestEnvironment), expect.any(UniversalEnvironment)])
    })

    it('loads all core environments by process name', async (): Promise<void> => {
      const logger = Core.getCoreLogger()

      let environments = await Core.getCoreEnvironments({ environmentsLocation: './tests/__fixtures__/environments' }, logger, null, 'good-app')
      expect(environments).toEqual([expect.any(GoodAppEnvironment), expect.any(TestEnvironment), expect.any(UniversalEnvironment)])

      environments = await Core.getCoreEnvironments({ environmentsLocation: './tests/__fixtures__/environments' }, logger, null, 'good-task')
      expect(environments).toEqual([expect.any(GoodTaskEnvironment), expect.any(TestEnvironment), expect.any(UniversalEnvironment)])
    })

    it('throws if it finds an environment with errors', async (): Promise<void> => {
      let error: Error
      try {
        const logger = Core.getCoreLogger()
        await Core.getCoreEnvironments({ environmentsLocation: './tests/__fixtures__/environments-load-error' }, logger)
      } catch (err) {
        error = err
      }

      expect(error).toEqual('Load Error')
    })
  })

  describe('.getCoreModules', (): void => {
    it('loads all core modules and passes the matching config form project config and a logger', async (): Promise<void> => {
      const logger = Core.getCoreLogger()
      const projectConfig = await Core.getProjectConfig({ configLocation: './tests/__fixtures__/config' })
      const [modules, warnings] = await Core.getCoreModules({ modulesLocation: './tests/__fixtures__/modules' }, projectConfig, logger)

      expect(modules).toMatchObject({ goodModule: { config: { isLocal: true, test: true }, logger }, excellentModule: { config: { isSecond: true, test: true }, logger } })
      expect(warnings).toEqual([])
      expect(GoodModule.iWasPrepared).toBeTruthy()
      expect(ExcellentModule.iWasPrepared).toBeTruthy()
    })

    it('throws as soon as a module preparation throws and unloads previously loaded ones', async (): Promise<void> => {
      let error: Error
      try {
        const logger = Core.getCoreLogger()
        const projectConfig = await Core.getProjectConfig({ configLocation: './tests/__fixtures__/config' })
        await Core.getCoreModules({ modulesLocation: './tests/__fixtures__/modules-prepare-error' }, projectConfig, logger)
      } catch (err) {
        error = err
      }

      expect(error).toEqual('Error')
      expect(AModule.iWasPrepared).toBeTruthy()
      expect(AModule.iWasReleased).toBeTruthy()
    })

    it('throws if it finds module with errors', async (): Promise<void> => {
      let error: Error
      try {
        const logger = Core.getCoreLogger()
        const projectConfig = await Core.getProjectConfig({ configLocation: './tests/__fixtures__/config' })
        await Core.getCoreModules({ modulesLocation: './tests/__fixtures__/modules-load-error' }, projectConfig, logger)
      } catch (err) {
        error = err
      }

      expect(error).toEqual('Load Error')
    })

    it('returns warnings about repeated modules (named intentionally the same)', async (): Promise<void> => {
      const logger = Core.getCoreLogger()
      const projectConfig = await Core.getProjectConfig({ configLocation: './tests/__fixtures__/config' })
      const [modules, warnings] = await Core.getCoreModules({ modulesLocation: './tests/__fixtures__/modules-warnings' }, projectConfig, logger)

      expect(modules).toMatchObject({ goodModule: { config: { isLocal: true, test: true }, logger } })
      expect(warnings).toEqual([
        {
          title: 'Two modules have the same name: good-module',
          message: expect.stringMatching(/^First loaded will take precedence.*/)
        }
      ])
    })

    it('sets modules as globals', async (): Promise<void> => {
      const logger = Core.getCoreLogger()
      const projectConfig = await Core.getProjectConfig({ configLocation: './tests/__fixtures__/config' })
      await Core.getCoreModules({ modulesLocation: './tests/__fixtures__/modules', modulesAsGlobals: true }, projectConfig, logger)

      expect(global['goodSubject']).toEqual('I am the subject of the good core module')
      expect(global['excellentSubject']).toEqual('I am the subject of the excellent core module')
    })
  })

  describe('.getCoreLogger', (): void => {
    it('creates and setups a logger and its basic transports', async (): Promise<void> => {
      const logger = Core.getCoreLogger({
        logger: { level: 'ERROR', silence: true, terminal: { enable: false, clear: false, withHeader: true }, localFile: { enable: false, asJson: true } }
      })

      expect(logger).toMatchObject({
        level: 'ERROR',
        silence: true,
        transports: { terminal: { enabled: false, options: { clear: false, withHeader: true } }, localFile: { enabled: false, options: { asJson: true } } }
      })
    })
  })

  describe('.releaseInternalModules', (): void => {
    it('calls the release method in all modules', async (): Promise<void> => {
      const logger = Core.getCoreLogger()
      const projectConfig = await Core.getProjectConfig({ configLocation: './tests/__fixtures__/config' })
      const [modules] = await Core.getCoreModules({ modulesLocation: './tests/__fixtures__/modules' }, projectConfig, logger)

      await Core.releaseInternalModules(modules)

      expect(GoodModule.iWasReleased).toBeTruthy()
      expect(ExcellentModule.iWasReleased).toBeTruthy()
    })

    it('throws at release error but still keep releasing what can be releases', async (): Promise<void> => {
      const logger = Core.getCoreLogger()
      const projectConfig = await Core.getProjectConfig({ configLocation: './tests/__fixtures__/config' })
      const [modules] = await Core.getCoreModules({ modulesLocation: './tests/__fixtures__/modules-release-error' }, projectConfig, logger)
      let error: Error

      try {
        await Core.releaseInternalModules(modules)
      } catch (err) {
        error = err
      }

      expect(error).toEqual('Error')
      expect(ZModule.iWasReleased).toBeTruthy()
    })
  })
})
