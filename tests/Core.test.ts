import Core from '../src/Core'

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
            transportsDirectory: './nop',
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
logger.transportsDirectory - Directory is not accesible
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
})
