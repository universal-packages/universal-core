import { deepMergeConfig, loadConfig } from '@universal-packages/config-loader'
import { Logger } from '@universal-packages/logger'
import { ModuleRegistry, loadModules } from '@universal-packages/module-loader'
import { loadPluginConfig } from '@universal-packages/plugin-config-loader'
import Ajv from 'ajv'
import { camelCase, paramCase, pascalCase } from 'change-case'

import { CoreConfig, CoreModuleWarning, CoreModules, ProcessType, ProjectConfig } from './Core.types'
import { coreConfigSchema } from './CoreConfig.schema'
import CoreEnvironment from './CoreEnvironment'
import CoreModule from './CoreModule'

export default class Core {
  protected logger: Logger
  protected coreModules: CoreModules

  public constructor(logger: Logger) {
    this.logger = logger
  }

  public static async getCoreConfig(coreConfigOverride?: CoreConfig): Promise<CoreConfig> {
    const defaultConfig: CoreConfig = {
      apps: { location: './src' },
      config: { location: './src/config' },
      environments: { location: './src' },
      modules: { asGlobals: true, location: './src' },
      tasks: { location: './src' },
      logger: { silence: false }
    }

    const loadedCoreConfig = await loadPluginConfig<CoreConfig>('core', { cleanOrphanReplaceable: true, selectEnvironment: true })
    const defaultPlusLoadedCoreConfig = loadedCoreConfig ? deepMergeConfig(defaultConfig, loadedCoreConfig) : defaultConfig
    const finalCoreConfig = coreConfigOverride ? deepMergeConfig(defaultPlusLoadedCoreConfig, coreConfigOverride) : defaultPlusLoadedCoreConfig

    const ajv = new Ajv({ allowUnionTypes: true })
    const validate = ajv.compile(coreConfigSchema)

    validate(finalCoreConfig)

    const errors = validate.errors

    if (errors) {
      const baseMessage = `Core config is invalid:\n\n`
      const schemaErrors = errors
        .map((error) => {
          const instancePath = error.instancePath
          const message = error.message
          const allowedValues = error.params.allowedValues ? ` ${JSON.stringify(error.params.allowedValues)}` : ''

          return `${instancePath} ${message}${allowedValues}`.trim()
        })
        .join('\n')
      const errorMessages = `${baseMessage}${schemaErrors}`

      throw new Error(errorMessages)
    }

    return finalCoreConfig
  }

  public static getProjectConfig(coreConfig: CoreConfig): ProjectConfig {
    return loadConfig(coreConfig.config.location, { cleanOrphanReplaceable: true, selectEnvironment: true })
  }

  public static async getCoreEnvironments(coreConfig: CoreConfig, logger: Logger, processType: ProcessType, processableName: string): Promise<CoreEnvironment[]> {
    const localEnvironments = await loadModules(coreConfig.environments.location, { conventionPrefix: 'environment' })
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
      const positiveConfiguredNodeEnvironments = configuredNodeEnvironments.filter((configuredNodeEnvironment: string): boolean => !configuredNodeEnvironment.startsWith('!'))
      const negativeConfiguredNodeEnvironments = configuredNodeEnvironments.filter((configuredNodeEnvironment: string): boolean => configuredNodeEnvironment.startsWith('!'))
      const configuredProcessTypes = [].concat(EnvironmentClass.onlyFor)
      const configuredProcessNames = [].concat(EnvironmentClass.tideTo)

      const canRunInNodeEnvironment =
        !EnvironmentClass.environment ||
        (positiveConfiguredNodeEnvironments.length > 0
          ? positiveConfiguredNodeEnvironments.includes(process.env['NODE_ENV'])
          : !negativeConfiguredNodeEnvironments.includes(`!${process.env['NODE_ENV']}`))
      const canRunForProcessType = !EnvironmentClass.onlyFor || !processType || configuredProcessTypes.includes(processType)
      const canRunForProcessName = !EnvironmentClass.tideTo || !processableName || configuredProcessNames.includes(processableName)

      if (canRunInNodeEnvironment && canRunForProcessType && canRunForProcessName) {
        const EnvironmentInstance = new EnvironmentClass(logger)

        environments.push(EnvironmentInstance)
      }
    }

    return environments
  }

  public static async getCoreModules(
    coreConfig: CoreConfig,
    projectConfig: ProjectConfig,
    logger: Logger,
    processType: ProcessType,
    processableName: string
  ): Promise<[CoreModules, CoreModuleWarning[]]> {
    const localModules = await loadModules(coreConfig.modules.location, { conventionPrefix: 'module' })
    const thirdPartyModules = await loadModules('./node_modules', { conventionPrefix: 'universal-core-module' })
    const finalModules = [...thirdPartyModules, ...localModules].sort((moduleA: ModuleRegistry, ModuleB: ModuleRegistry): number =>
      moduleA.exports.loadPriority > ModuleB.exports.loadPriority ? 1 : moduleA.exports.loadPriority < ModuleB.exports.loadPriority ? -1 : 0
    )
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
      const moduleCamelCaseNameWithForcedModule = camelCase(moduleName).replace(/Module$/, '') + 'Module'
      const moduleParamCaseNameWithForcedModule = paramCase(moduleName).replace(/-module$/, '') + '-module'
      const modulePascalCaseNameWithForcedModule = pascalCase(moduleName).replace(/Module$/, '') + 'Module'
      const subjectName = camelCase(moduleName).replace(/Module$/, '') + 'Subject'
      const moduleConfig =
        projectConfig[moduleCamelCaseNameWithForcedModule] || projectConfig[moduleParamCaseNameWithForcedModule] || projectConfig[modulePascalCaseNameWithForcedModule]
      const ModuleClass: typeof CoreModule = currentModule.exports

      const configuredNodeEnvironments = [].concat(ModuleClass.environment).filter(Boolean)
      const positiveConfiguredNodeEnvironments = configuredNodeEnvironments.filter((configuredNodeEnvironment: string): boolean => !configuredNodeEnvironment.startsWith('!'))
      const negativeConfiguredNodeEnvironments = configuredNodeEnvironments.filter((configuredNodeEnvironment: string): boolean => configuredNodeEnvironment.startsWith('!'))
      const configuredProcessTypes = [].concat(ModuleClass.onlyFor)
      const configuredProcessNames = [].concat(ModuleClass.tideTo)

      const canRunInNodeEnvironment =
        !ModuleClass.environment ||
        (positiveConfiguredNodeEnvironments.length > 0
          ? positiveConfiguredNodeEnvironments.includes(process.env['NODE_ENV'])
          : !negativeConfiguredNodeEnvironments.includes(`!${process.env['NODE_ENV']}`))
      const canRunForProcessType = !ModuleClass.onlyFor || !processType || configuredProcessTypes.includes(processType)
      const canRunForProcessName = !ModuleClass.tideTo || !processableName || configuredProcessNames.includes(processableName)

      if (canRunInNodeEnvironment && canRunForProcessType && canRunForProcessName) {
        if (coreModules[moduleCamelCaseName]) {
          warnings.push({ title: `Two modules have the same name: ${moduleName}`, message: `First loaded will take precedence\n${currentModule.location}` })
        } else {
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

          if (coreConfig.modules.asGlobals && moduleInstance.subject) global[subjectName] = moduleInstance.subject

          // While loading we let other modules know about what core has loaded
          const globalCore = global.core || ({} as any)
          globalCore.coreModules = coreModules
        }
      }
    }

    return [coreModules, warnings]
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
