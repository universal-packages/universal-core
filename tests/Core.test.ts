import Core from '../src/Core'
import UnloadedTestModule from './__fixtures__/core-testing/modules-error/Unloaded.module'
import ReleaseTestModule from './__fixtures__/core-testing/modules-to-release/test.module'
import ReleaseTest2Module from './__fixtures__/core-testing/modules-to-release/test2.module'
import TestModule from './__fixtures__/core-testing/modules/test.module'
import Test2Module from './__fixtures__/core-testing/modules/test2.module'

describe('Core', (): void => {
  describe('.getCoreConfig', (): void => {
    it('loads the core config setted up', async (): Promise<void> => {
      const config = await Core.getCoreConfig()

      expect(config).not.toBeUndefined()
    })

    it('lets you overide config', async (): Promise<void> => {
      const config = await Core.getCoreConfig({ appsDirectory: './tests', tasksDirectory: './tests', configDirectory: './tests' })

      expect(config).toMatchObject({ appsDirectory: './tests', tasksDirectory: './tests', configDirectory: './tests' })
    })

    it('validates the core config schema', async (): Promise<void> => {
      let error: Error

      try {
        const config = await Core.getCoreConfig({
          appsDirectory: './nop',
          appWatcher: {
            enabled: 'nop',
            ignore: [55]
          },
          configDirectory: './nop',
          modulesDirectory: './nop',
          modulesAsGlobals: 'nop',
          tasksDirectory: './nop',
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

      expect(error.message).toEqual(`appsDirectory - Directory is not accesible
appWatcher.enabled - appWatcher.enabled must be of type Boolean.
appWatcher.ignore.0 - appWatcher.ignore.0 must be of type String.
configDirectory - Directory is not accesible
modulesDirectory - Directory is not accesible
modulesAsGlobals - modulesAsGlobals must be of type Boolean.
tasksDirectory - Directory is not accesible
logger.level - Must be one of: FATAL | ERROR | WARNING | QUERY | INFO | DEBUG | TRACE
logger.silence - logger.silence must be of type Boolean.
logger.terminal.enable - logger.terminal.enable must be of type Boolean.
logger.terminal.clear - logger.terminal.clear must be of type Boolean.
logger.terminal.withHeader - logger.terminal.withHeader must be of type Boolean.
logger.localFile.enable - logger.localFile.enable must be of type Boolean.
logger.localFile.asJson - logger.localFile.asJson must be of type Boolean.
logger.localFile.location - Directory is not accesible`)
    })
  })

  describe('.getProjectConfig', (): void => {
    it('loads the project config in the config directory (whole)', async (): Promise<void> => {
      const config = await Core.getProjectConfig({ configDirectory: './tests/__fixtures__/core-testing/config' })

      expect(config).toEqual({
        'test-app': { doStuff: true, test: true },
        'test-module': { isLocal: true, test: true },
        Test2Module: { isSecond: true, test: true }
      })
    })
  })

  describe('.getCoreModules', (): void => {
    it('loads all core modules and passes the matching config form project config and a logger', async (): Promise<void> => {
      const logger = Core.getCoreLogger()
      const projectConfig = await Core.getProjectConfig({ configDirectory: './tests/__fixtures__/core-testing/config' })
      const [modules, warnings] = await Core.getCoreModules({ modulesDirectory: './tests/__fixtures__/core-testing/modules' }, projectConfig, logger)

      expect(modules).toMatchObject({ 'test-module': { config: { isLocal: true, test: true }, logger }, 'test2-module': { config: { isSecond: true, test: true }, logger } })
      expect(warnings).toEqual([])
    })

    it('throws as soon as a module preapration throws and unloads previously loaded ones', async (): Promise<void> => {
      let error: Error
      try {
        const logger = Core.getCoreLogger()
        const projectConfig = await Core.getProjectConfig({ configDirectory: './tests/__fixtures__/core-testing/config' })
        await Core.getCoreModules({ modulesDirectory: './tests/__fixtures__/core-testing/modules-error' }, projectConfig, logger)
      } catch (err) {
        error = err
      }

      expect(error).toEqual('Error')
      expect(UnloadedTestModule.wasUnloaded).toBeTruthy()
    })

    it('throws if it finds module with errors', async (): Promise<void> => {
      let error: Error
      try {
        const logger = Core.getCoreLogger()
        const projectConfig = await Core.getProjectConfig({ configDirectory: './tests/__fixtures__/core-testing/config' })
        await Core.getCoreModules({ modulesDirectory: './tests/__fixtures__/core-testing/modules-error-3' }, projectConfig, logger)
      } catch (err) {
        error = err
      }

      expect(error.message).toMatch(/Module does not implements CoreModule.*/)
    })

    it('throws if it finds module dows not extends CoreModule', async (): Promise<void> => {
      let error: Error
      try {
        const logger = Core.getCoreLogger()
        const projectConfig = await Core.getProjectConfig({ configDirectory: './tests/__fixtures__/core-testing/config' })
        await Core.getCoreModules({ modulesDirectory: './tests/__fixtures__/core-testing/modules-error-2' }, projectConfig, logger)
      } catch (err) {
        error = err
      }

      expect(error).toEqual('Load Error')
    })

    it('returns warnings about repeated modules (named intentionaly the same)', async (): Promise<void> => {
      const logger = Core.getCoreLogger()
      const projectConfig = await Core.getProjectConfig({ configDirectory: './tests/__fixtures__/core-testing/config' })
      const [modules, warnings] = await Core.getCoreModules({ modulesDirectory: './tests/__fixtures__/core-testing/modules-warnings' }, projectConfig, logger)

      expect(modules).toMatchObject({ 'test-module': { config: { isLocal: true, test: true }, logger } })
      expect(warnings).toEqual([
        {
          title: 'Two modules have the same name: test-module',
          message: expect.stringMatching(/^First loaded will take presedence.*/)
        }
      ])
    })

    it('sets modules as globals', async (): Promise<void> => {
      const logger = Core.getCoreLogger()
      const projectConfig = await Core.getProjectConfig({ configDirectory: './tests/__fixtures__/core-testing/config' })
      await Core.getCoreModules({ modulesDirectory: './tests/__fixtures__/core-testing/modules', modulesAsGlobals: true }, projectConfig, logger)

      expect(global['testModule']).toBeInstanceOf(TestModule)
      expect(global['test2Module']).toBeInstanceOf(Test2Module)
    })
  })

  describe('.getCoreLogger', (): void => {
    it('creates and setups a logger and its basiv transports', async (): Promise<void> => {
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

  describe('.getCoreLogger', (): void => {
    it('creates and setups a logger and its basiv transports', async (): Promise<void> => {
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
      const projectConfig = await Core.getProjectConfig({ configDirectory: './tests/__fixtures__/core-testing/config' })
      const [modules] = await Core.getCoreModules({ modulesDirectory: './tests/__fixtures__/core-testing/modules-to-release' }, projectConfig, logger)

      await Core.releaseInternalModules(modules)

      expect(ReleaseTestModule.released).toBeTruthy()
      expect(ReleaseTest2Module.released).toBeTruthy()
    })
  })
})
