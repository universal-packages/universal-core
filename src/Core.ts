import { loadConfig } from '@universal-packages/config-loader'
import { LocalFileTransport, Logger, TerminalTransport } from '@universal-packages/logger'
import { loadModules, ModuleRegistry } from '@universal-packages/module-loader'
import { loadPluginConfig } from '@universal-packages/plugin-config-loader'
import { camelCase, paramCase, pascalCase } from 'change-case'
import CoreModule from './CoreModule'
import { coreConfigSchema } from './CoreConfig.schema'
import { CoreConfig, CoreModules, CoreModuleWarning, ProcessType, ProjectConfig } from './Core.types'
import CoreEnvironment from './CoreEnvironment'

export default class Core {
  protected logger: Logger
  protected coreModules: CoreModules

  public constructor(logger: Logger) {
    this.logger = logger
  }

  public static async getCoreConfig(coreConfigOverride?: CoreConfig): Promise<CoreConfig> {
    const loadedCoreConfig = { ...(await loadPluginConfig('core', { selectEnvironment: true })), ...coreConfigOverride }
    const finalCoreConfig: CoreConfig = {
      appsLocation: './src',
      configLocation: './src/config',
      environmentsLocation: './src',
      modulesLocation: './src',
      modulesAsGlobals: true,
      tasksLocation: './src',
      ...loadedCoreConfig,
      logger: { silence: false, ...loadedCoreConfig?.logger, ...coreConfigOverride?.logger }
    }
    const errors = coreConfigSchema.validate(finalCoreConfig)

    if (errors.length > 0) {
      const errorMessages = errors.map((error: any): string => `${error.path} - ${error.message}`)

      throw new Error(errorMessages.join('\n'))
    }

    return finalCoreConfig
  }

  public static async getProjectConfig(coreConfig: CoreConfig): Promise<ProjectConfig> {
    return await loadConfig(coreConfig.configLocation, { selectEnvironment: true })
  }

  public static async getCoreEnvironments(coreConfig: CoreConfig, logger: Logger, processType?: ProcessType, processableName?: string): Promise<CoreEnvironment[]> {
    const localEnvironments = await loadModules(coreConfig.environmentsLocation, { conventionPrefix: 'environment' })
    const thirdPartyEnvironments = await loadModules('./node_modules', { conventionPrefix: 'universal-core-environment' })
    const finalEnvironments = [...thirdPartyEnvironments, ...localEnvironments]
    const environments: CoreEnvironment[] = []

    for (let i = 0; i < finalEnvironments.length; i++) {
      const currentEnvironment = finalEnvironments[i]

      if (currentEnvironment.error) {
        throw currentEnvironment.error
      }
    }

    for (let i = 0; i < finalEnvironments.length; i++) {
      const currentEnvironment = finalEnvironments[i]
      const EnvironmentClass: typeof CoreEnvironment = currentEnvironment.exports

      const configuredNodeEnvironments = [].concat(EnvironmentClass.environment).filter(Boolean)
      const configuredProcessTypes = [].concat(EnvironmentClass.onlyFor)
      const configuredProcessNames = [].concat(EnvironmentClass.tideTo)

      const canRunInNodeEnvironment = !EnvironmentClass.environment || configuredNodeEnvironments.includes(process.env['NODE_ENV'])
      const canRunForProcessType = !EnvironmentClass.onlyFor || configuredProcessTypes.includes(processType)
      const canRunForProcessName = !EnvironmentClass.tideTo || configuredProcessNames.includes(processableName)

      if (canRunInNodeEnvironment && canRunForProcessType && canRunForProcessName) {
        const EnvironmentInstance = new EnvironmentClass(logger)

        environments.push(EnvironmentInstance)
      }
    }

    return environments
  }

  public static async getCoreModules(coreConfig: CoreConfig, projectConfig: ProjectConfig, logger: Logger): Promise<[CoreModules, CoreModuleWarning[]]> {
    const localModules = await loadModules(coreConfig.modulesLocation, { conventionPrefix: 'module' })
    const thirdPartyModules = await loadModules('./node_modules', { conventionPrefix: 'universal-core-module' })
    const finalModules = [
      ...thirdPartyModules.sort((moduleA: ModuleRegistry, ModuleB: ModuleRegistry): number =>
        moduleA.location.replace(/^.*(\\|\/|\:)/, '') > ModuleB.location.replace(/^.*(\\|\/|\:)/, '') ? 1 : -1
      ),
      ...localModules
    ]
    const warnings: CoreModuleWarning[] = []
    const coreModules: CoreModules = {}

    for (let i = 0; i < finalModules.length; i++) {
      const currentModule = finalModules[i]

      if (currentModule.error) {
        throw currentModule.error
      }
    }

    for (let i = 0; i < finalModules.length; i++) {
      const currentModule = finalModules[i]
      const moduleName = currentModule.exports.moduleName || currentModule.exports.name
      const moduleCamelCaseName = camelCase(moduleName)
      const moduleParamCaseName = paramCase(moduleName)
      const modulePascalCaseName = pascalCase(moduleName)
      const subjectName = moduleCamelCaseName.replace('Module', 'Subject')
      const moduleConfig = projectConfig[moduleParamCaseName] || projectConfig[modulePascalCaseName] || projectConfig[moduleName]

      if (coreModules[moduleCamelCaseName]) {
        warnings.push({ title: `Two modules have the same name: ${moduleName}`, message: `First loaded will take precedence\n${currentModule.location}` })
      } else {
        const ModuleClass: typeof CoreModule = currentModule.exports
        const moduleInstance = new ModuleClass({ ...ModuleClass.defaultConfig, ...moduleConfig }, logger)

        try {
          await moduleInstance.prepare()
        } catch (error) {
          // Release already loaded modules
          try {
            await Core.releaseInternalModules(coreModules)
          } catch (err) {}

          throw error
        }

        coreModules[moduleCamelCaseName] = moduleInstance

        if (coreConfig.modulesAsGlobals && moduleInstance.subject) global[subjectName] = moduleInstance.subject

        // While loading we let other modules know about what core has loaded
        const globalCore = global.core || ({} as any)
        globalCore.coreModules = coreModules
      }
    }

    return [coreModules, warnings]
  }

  public static getCoreLogger(coreConfig?: CoreConfig): Logger {
    const logger = new Logger({ silence: process.env['NODE_ENV'] === 'test' })
    const terminalTransport = logger.getTransport('terminal') as TerminalTransport
    const localFileTransport = logger.getTransport('localFile') as LocalFileTransport

    terminalTransport.options.categoryColors['CORE'] = 'BLACK'

    if (coreConfig) {
      if (coreConfig.logger?.level) logger.level = coreConfig.logger.level
      if (coreConfig.logger?.silence !== undefined) logger.silence = coreConfig.logger?.silence

      if (coreConfig.logger?.terminal) {
        terminalTransport.enabled = coreConfig.logger?.terminal?.enable !== false
        terminalTransport.options.clear = coreConfig.logger?.terminal?.clear !== false
        terminalTransport.options.withHeader = coreConfig.logger?.terminal?.withHeader !== false
      }

      if (coreConfig.logger?.localFile) {
        localFileTransport.enabled = coreConfig.logger?.localFile?.enable !== false
        localFileTransport.options.asJson = coreConfig.logger?.localFile?.asJson !== false
        localFileTransport.options.location = coreConfig.logger?.localFile.location || localFileTransport.options.location
      }
    }

    return logger
  }

  public static async releaseInternalModules(internalModules: CoreModules = {}): Promise<void> {
    const modulesKeys = Object.keys(internalModules)
    let error: Error

    for (let i = 0; i < modulesKeys.length; i++) {
      const currentModuleName = modulesKeys[i]
      const currentModule = internalModules[currentModuleName]

      try {
        await currentModule.release()
      } catch (err) {
        error = err
      }

      delete internalModules[currentModuleName]
    }

    if (error) throw error
  }
}
