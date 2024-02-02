import { Logger } from '@universal-packages/logger'

import { Core } from '../src'
import AppEnvironment from './__fixtures__/environments/App.environment'
import ConsoleEnvironment from './__fixtures__/environments/Console.environment'
import GoodAppEnvironment from './__fixtures__/environments/GoodApp.environment'
import GoodTaskEnvironment from './__fixtures__/environments/GoodTask.environment'
import NotProductionEnvironment from './__fixtures__/environments/NotProduction.environment'
import TaskEnvironment from './__fixtures__/environments/Task.environment'
import TestEnvironment from './__fixtures__/environments/Test.environment'
import UniversalEnvironment from './__fixtures__/environments/Universal.environment'
import AModule from './__fixtures__/modules-prepare-error/A.module'
import ZModule from './__fixtures__/modules-release-error/Z.module'
import AppModule from './__fixtures__/modules/App.module'
import ConsoleModule from './__fixtures__/modules/Console.module'
import ExcellentModule from './__fixtures__/modules/Excellent.module'
import GoodModule from './__fixtures__/modules/Good.module'
import GoodAppModule from './__fixtures__/modules/GoodApp.module'
import GoodTaskModule from './__fixtures__/modules/GoodTask.module'
import NotProductionModule from './__fixtures__/modules/NotProduction.module'
import TaskModule from './__fixtures__/modules/Task.module'
import TestModule from './__fixtures__/modules/Test.module'

describe(Core, (): void => {
  describe('.getCoreConfig', (): void => {
    it('loads the core config set up', async (): Promise<void> => {
      const config = await Core.getCoreConfig()

      expect(config).not.toBeUndefined()
    })

    it('lets you override config', async (): Promise<void> => {
      const config = await Core.getCoreConfig({ apps: { location: './tests' }, tasks: { location: './tests' }, config: { location: './tests' } })

      expect(config).toMatchObject({ apps: { location: './tests' }, tasks: { location: './tests' }, config: { location: './tests' } })
    })

    it('validates the core config schema', async (): Promise<void> => {
      let error: Error

      try {
        const config = await Core.getCoreConfig({
          apps: { location: './nop', watcher: { enabled: 'nop', ignore: [55] } },
          config: { location: './nop' },
          modules: { location: './nop', asGlobals: 'nop' },
          tasks: { location: './nop' },
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

      expect(error.message).toEqual(`apps.location - Location is not accessible
apps.watcher.enabled - apps.watcher.enabled must be of type Boolean.
apps.watcher.ignore.0 - apps.watcher.ignore.0 must be of type String.
config.location - Location is not accessible
modules.asGlobals - modules.asGlobals must be of type Boolean.
modules.location - Location is not accessible
tasks.location - Location is not accessible
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
      const config = Core.getProjectConfig({ config: { location: './tests/__fixtures__/config' } })

      expect(config).toEqual({
        'app-module': { isApp: true, test: true },
        ExcellentModule: { isSecond: true, test: true },
        'good-app': { doStuff: true, test: true },
        'good-module': { isLocal: true, test: true },
        'good-app-module': { isGoodApp: true, test: true },
        'not-production-module': { isNotProduction: true, test: true }
      })
    })
  })

  describe('.getCoreEnvironments', (): void => {
    it('loads all core environments considering process type and process name', async (): Promise<void> => {
      const logger = new Logger({ silence: true })

      let environments = await Core.getCoreEnvironments({ environments: { location: './tests/__fixtures__/environments' } }, logger, 'apps', 'good-app')
      expect(environments).toEqual([
        expect.any(AppEnvironment),
        expect.any(GoodAppEnvironment),
        expect.any(NotProductionEnvironment),
        expect.any(TestEnvironment),
        expect.any(UniversalEnvironment)
      ])

      environments = await Core.getCoreEnvironments({ environments: { location: './tests/__fixtures__/environments' } }, logger, 'tasks', 'good-task')
      expect(environments).toEqual([
        expect.any(GoodTaskEnvironment),
        expect.any(NotProductionEnvironment),
        expect.any(TaskEnvironment),
        expect.any(TestEnvironment),
        expect.any(UniversalEnvironment)
      ])

      environments = await Core.getCoreEnvironments({ environments: { location: './tests/__fixtures__/environments' } }, logger, 'console', 'console')
      expect(environments).toEqual([expect.any(ConsoleEnvironment), expect.any(NotProductionEnvironment), expect.any(TestEnvironment), expect.any(UniversalEnvironment)])
    })

    it('throws if it finds an environment with errors', async (): Promise<void> => {
      let error: Error
      try {
        const logger = new Logger({ silence: true })
        await Core.getCoreEnvironments({ environments: { location: './tests/__fixtures__/environments-load-error' } }, logger, 'apps', 'good-app')
      } catch (err) {
        error = err
      }

      expect(error).toEqual('Load Error')
    })
  })

  describe('.getCoreModules', (): void => {
    it('loads all core modules and passes the matching config form project config and a logger', async (): Promise<void> => {
      const logger = new Logger({ silence: true })
      const projectConfig = Core.getProjectConfig({ config: { location: './tests/__fixtures__/config' } })
      const [modules, warnings] = await Core.getCoreModules({ modules: { location: './tests/__fixtures__/modules' } }, projectConfig, logger, 'apps', 'good-app')

      expect(Object.keys(modules).length).toEqual(6)
      expect(modules).toEqual({
        appModule: expect.objectContaining({ config: { isApp: true, test: true }, logger }),
        excellentModule: expect.objectContaining({ config: { isSecond: true, test: true }, logger }),
        goodModule: expect.objectContaining({ config: { isLocal: true, test: true }, logger }),
        goodAppModule: expect.objectContaining({ config: { isGoodApp: true, test: true }, logger }),
        notProductionModule: expect.objectContaining({ config: { isNotProduction: true, test: true }, logger }),
        testModule: expect.objectContaining({ config: {}, logger })
      })
      expect(warnings).toEqual([])
      expect(AppModule.iWasPrepared).toBeTruthy()
      expect(ExcellentModule.iWasPrepared).toBeTruthy()
      expect(GoodModule.iWasPrepared).toBeTruthy()
      expect(GoodAppModule.iWasPrepared).toBeTruthy()
      expect(NotProductionModule.iWasPrepared).toBeTruthy()
      expect(TestModule.iWasPrepared).toBeTruthy()
    })

    it('loads all core modules by process type', async (): Promise<void> => {
      const logger = new Logger({ silence: true })
      const projectConfig = Core.getProjectConfig({ config: { location: './tests/__fixtures__/config' } })

      const [app_modules] = await Core.getCoreModules({ modules: { location: './tests/__fixtures__/modules' } }, projectConfig, logger, 'apps', 'good-app')
      expect(app_modules).toEqual({
        appModule: expect.any(AppModule),
        excellentModule: expect.any(ExcellentModule),
        goodModule: expect.any(GoodModule),
        goodAppModule: expect.any(GoodAppModule),
        notProductionModule: expect.any(NotProductionModule),
        testModule: expect.any(TestModule)
      })

      const [task_modules] = await Core.getCoreModules({ modules: { location: './tests/__fixtures__/modules' } }, projectConfig, logger, 'tasks', 'good-task')
      expect(task_modules).toEqual({
        excellentModule: expect.any(ExcellentModule),
        goodModule: expect.any(GoodModule),
        goodTaskModule: expect.any(GoodTaskModule),
        notProductionModule: expect.any(NotProductionModule),
        taskModule: expect.any(TaskModule),
        testModule: expect.any(TestModule)
      })

      const [console_modules] = await Core.getCoreModules({ modules: { location: './tests/__fixtures__/modules' } }, projectConfig, logger, 'console', 'console')
      expect(console_modules).toEqual({
        consoleModule: expect.any(ConsoleModule),
        excellentModule: expect.any(ExcellentModule),
        goodModule: expect.any(GoodModule),
        notProductionModule: expect.any(NotProductionModule),
        testModule: expect.any(TestModule)
      })
    })

    it('throws as soon as a module preparation throws and unloads previously loaded ones', async (): Promise<void> => {
      let error: Error
      try {
        const logger = new Logger({ silence: true })
        const projectConfig = Core.getProjectConfig({ config: { location: './tests/__fixtures__/config' } })
        await Core.getCoreModules({ modules: { location: './tests/__fixtures__/modules-prepare-error' } }, projectConfig, logger, 'apps', 'any-app')
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
        const logger = new Logger({ silence: true })
        const projectConfig = Core.getProjectConfig({ config: { location: './tests/__fixtures__/config' } })
        await Core.getCoreModules({ modules: { location: './tests/__fixtures__/modules-load-error' } }, projectConfig, logger, 'apps', 'any-app')
      } catch (err) {
        error = err
      }

      expect(error).toEqual('Load Error')
    })

    it('returns warnings about repeated modules (named intentionally the same)', async (): Promise<void> => {
      const logger = new Logger({ silence: true })
      const projectConfig = Core.getProjectConfig({ config: { location: './tests/__fixtures__/config' } })
      const [modules, warnings] = await Core.getCoreModules({ modules: { location: './tests/__fixtures__/modules-warnings' } }, projectConfig, logger, 'apps', 'any-app')

      expect(modules).toMatchObject({ goodModule: { config: { isLocal: true, test: true }, logger } })
      expect(warnings).toEqual([
        {
          title: 'Two modules have the same name: good-module',
          message: expect.stringMatching(/^First loaded will take precedence.*/)
        }
      ])
    })

    it('sets modules as globals', async (): Promise<void> => {
      const logger = new Logger({ silence: true })
      const projectConfig = Core.getProjectConfig({ config: { location: './tests/__fixtures__/config' } })
      await Core.getCoreModules({ modules: { location: './tests/__fixtures__/modules', asGlobals: true } }, projectConfig, logger, 'apps', 'any-app')

      expect(global['goodSubject']).toEqual('I am the subject of the good core module')
      expect(global['excellentSubject']).toEqual('I am the subject of the excellent core module')
    })
  })

  describe('.releaseInternalModules', (): void => {
    it('calls the release method in all modules', async (): Promise<void> => {
      const logger = new Logger({ silence: true })
      const projectConfig = Core.getProjectConfig({ config: { location: './tests/__fixtures__/config' } })
      const [modules] = await Core.getCoreModules({ modules: { location: './tests/__fixtures__/modules' } }, projectConfig, logger, 'apps', 'any-app')

      await Core.releaseInternalModules(modules)

      expect(GoodModule.iWasReleased).toBeTruthy()
      expect(ExcellentModule.iWasReleased).toBeTruthy()
    })

    it('throws at release error but still keep releasing what can be releases', async (): Promise<void> => {
      const logger = new Logger({ silence: true })
      const projectConfig = Core.getProjectConfig({ config: { location: './tests/__fixtures__/config' } })
      const [modules] = await Core.getCoreModules({ modules: { location: './tests/__fixtures__/modules-release-error' } }, projectConfig, logger, 'apps', 'any-app')
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
