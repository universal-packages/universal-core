import { loadConfig } from '@universal-packages/config-loader'
import Logger, { LocalFileTransport, TerminalTransport } from '@universal-packages/logger'
import { loadModules } from '@universal-packages/module-loader'
import { loadPluginConfig } from '@universal-packages/plugin-config-loader'
import { camelCase, paramCase, pascalCase } from 'change-case'
import CoreModule from './CoreModule'
import { coreConfigSchema } from './CoreConfig.schema'
import { CoreConfig, CoreModules, CoreModuleWarning, ProjectConfig } from './Core.types'

export default class Core {
  protected logger: Logger
  protected coreModules: CoreModules

  public constructor(logger: Logger, coreModules: CoreModules) {
    this.logger = logger
    this.coreModules = coreModules
  }

  public static async getCoreConfig(coreConfigOveride?: CoreConfig): Promise<CoreConfig> {
    const loadedCoreConfig = coreConfigOveride || (await loadPluginConfig('core'))
    const finalCoreConfig: CoreConfig = {
      appsDirectory: './srs',
      configDirectory: './src/config',
      modulesDirectory: './src',
      modulesAsGlobals: true,
      tasksDirectory: '.src',
      ...loadedCoreConfig,
      logger: { silence: false, ...loadedCoreConfig.logger }
    }
    const errors = coreConfigSchema.validate(loadedCoreConfig)

    if (errors.length > 0) {
      const errorMessages = errors.map((error: any): string => `${error.path} - ${error.message}`)

      throw new Error(errorMessages.join('\n'))
    }

    return finalCoreConfig
  }

  public static async getProjectConfig(coreConfig: CoreConfig): Promise<ProjectConfig> {
    return await loadConfig(coreConfig.configDirectory, { selectEnvironment: true })
  }

  public static async getCoreModules(coreConfig: CoreConfig, projectConfig: ProjectConfig, logger: Logger): Promise<[CoreModules, CoreModuleWarning[]]> {
    const localModules = await loadModules(coreConfig.modulesDirectory, { conventionPrefix: 'module' })
    const thridPartyModules = await loadModules('./node_modules', { conventionPrefix: 'universal-core-module' })
    const finalModules = [...localModules, ...thridPartyModules]
    const warnings: CoreModuleWarning[] = []
    const coreModules: CoreModules = {}

    for (let i = 0; i < finalModules.length; i++) {
      const currentModule = finalModules[i]

      if (currentModule.error) {
        throw currentModule.error
      } else if (!(currentModule.exports.prototype instanceof CoreModule)) {
        throw new Error(`Module does not implements CoreModule\n${currentModule.location}`)
      }
    }

    for (let i = 0; i < finalModules.length; i++) {
      const currentModule = finalModules[i]
      const moduleName = currentModule.exports.moduleName || currentModule.exports.name
      const moduleCamelCaseName = camelCase(moduleName)
      const moduleParamCaseName = paramCase(moduleName)
      const modulePascalCaseName = pascalCase(moduleName)
      const moduleConfig = projectConfig[moduleParamCaseName] || projectConfig[modulePascalCaseName] || projectConfig[moduleName]

      if (coreModules[moduleParamCaseName]) {
        warnings.push({ title: `Two modules have the same name: ${moduleName}`, message: `First loaded will take presedence\n${currentModule.location}` })
      } else {
        const moduleInstance: CoreModule = new currentModule.exports(moduleConfig, logger)

        await moduleInstance.prepare()

        coreModules[moduleParamCaseName] = moduleInstance

        if (coreConfig.modulesAsGlobals) global[moduleCamelCaseName] = moduleInstance
      }
    }

    return [coreModules, warnings]
  }

  public static getCoreLogger(coreConfig?: CoreConfig): Logger {
    const logger = new Logger()
    const termianlTransport = logger.getTransport('terminal') as TerminalTransport
    const localFileTrasnport = logger.getTransport('localFile') as LocalFileTransport

    termianlTransport.options.categoryColors['CORE'] = 'BLACK'

    if (coreConfig) {
      if (coreConfig.logger?.level) logger.level = coreConfig.logger.level
      if (coreConfig.logger?.silence === true) logger.silence = true

      if (coreConfig.logger?.terminal) {
        termianlTransport.enabled = coreConfig.logger?.terminal?.enable !== false
        termianlTransport.options.clear = coreConfig.logger?.terminal?.clear !== false
        termianlTransport.options.withHeader = coreConfig.logger?.terminal?.withHeader !== false
      }

      if (coreConfig.logger?.localFile) {
        localFileTrasnport.enabled = coreConfig.logger?.localFile?.enable !== false
        localFileTrasnport.options.asJson = coreConfig.logger?.localFile?.asJson !== false
        localFileTrasnport.options.location = coreConfig.logger?.localFile.location || localFileTrasnport.options.location
      }
    }

    return logger
  }

  public static async releaseInternalModules(internalModules: CoreModules = {}): Promise<void> {
    const modulesKeys = Object.keys(internalModules)

    for (let i = 0; i < modulesKeys.length; i++) {
      const currentModuleName = modulesKeys[i]
      const currentModule = internalModules[currentModuleName]

      await currentModule.release()

      delete internalModules[currentModuleName]
    }
  }
}
