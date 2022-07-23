import { loadConfig } from '@universal-packages/config-loader'
import Logger, { TerminalTransport } from '@universal-packages/logger'
import { loadModules, ModuleRegistry } from '@universal-packages/module-loader'
import { loadPluginConfig } from '@universal-packages/plugin-config-loader'
import { startMeasurement } from '@universal-packages/time-measurer'
import { camelCase, paramCase, pascalCase } from 'change-case'
import BaseApp from './BaseApp'
import BaseModule from './BaseModule'
import { coreConfigSchema } from './core-app.schema'
import { CoreAppConfig, InternalModuleRegistry } from './core-app.types'

global.core = {
  App: null,
  allConfig: null,
  appConfig: null,
  appInstance: null,
  appParamCaseName: null,
  appPascalCaseName: null,
  args: null,
  coreAppConfig: null,
  logger: new Logger(),
  loadedModules: [],
  moduleRegistries: {},
  stopping: false
}

export async function startApp(name: string, args: Record<string, any>): Promise<void> {
  let proceed = true

  proceed = initLogger()
  if (!proceed) return

  proceed = await loadCoreAppConfig()
  if (!proceed) return

  proceed = await loadAppConfig()
  if (!proceed) return

  proceed = await loadCoreAppModules()
  if (!proceed) return

  proceed = await loadApp(name, args)
  if (!proceed) return

  const terminate = async (): Promise<void> => {
    process.stdout.clearLine(0)
    process.stdout.cursorTo(0)

    if (core.stopping) process.exit(0)

    core.logger.publish('INFO', 'Stopping app gracefully', 'press CTRL+C again to kill', 'CORE')

    core.stopping = true

    for (let i = 0; i < core.loadedModules.length; i++) {
      const currentModuleName = core.loadedModules[i]
      const currentModule = core.moduleRegistries[currentModuleName]

      try {
        await currentModule.instance.release()
      } catch (error) {
        core.logger.publish('ERROR', currentModuleName, 'There was an error releasing module', 'CORE', { error })
      }
    }

    try {
      await core.appInstance.stop()
    } catch (error) {
      core.logger.publish('ERROR', core.appParamCaseName, 'There was an error while stoppig app', 'CORE', { error })
      await core.logger.await()
      process.exit(1)
    }
    try {
      await core.appInstance.release()
    } catch (error) {
      core.logger.publish('ERROR', core.appParamCaseName, 'There was an error while relaasing app', 'CORE', { error })
      await core.logger.await()
      process.exit(1)
    }
  }

  process.addListener('SIGINT', terminate)
  process.addListener('SIGTERM', terminate)

  core.logger.publish('INFO', `${core.appParamCaseName} staring...`, core.App.description, 'CORE')

  try {
    await core.appInstance.start()
  } catch (error) {
    core.logger.publish('ERROR', core.appParamCaseName, 'There was an error while starting app', 'CORE', { error })

    await core.logger.await()
    process.exit(1)
  }
}

export async function execTask(name: string, directive: string, directiveOptions: string[], options: Record<string, any>): Promise<void> {
  await loadCoreAppConfig()
}

function initLogger(): boolean {
  try {
    const termianlTransport = core.logger.getTransport('terminal') as TerminalTransport
    termianlTransport.setCategoryColor('CORE', 'BLACK')
  } catch (error) {
    console.log(error)
    return false
  }

  return true
}

async function loadCoreAppConfig(): Promise<boolean> {
  const measurer = startMeasurement()

  const loadedCoreAppConfig = await loadPluginConfig('core-app')
  const finalCoreAppConfig: CoreAppConfig = {
    appsDirectory: './srs/apps',
    configDirectory: './src/config',
    modulesDirectory: './src/modules',
    tasksDirectory: '.src/tasks',
    ...loadedCoreAppConfig,
    logger: { logsDirectory: '.logs', silence: false, ...loadedCoreAppConfig.logger }
  }
  const errors = coreConfigSchema.validate(finalCoreAppConfig)

  if (errors.length > 0) {
    const errorMessages = errors.map((error: any): string => `${error.path} - ${error.message}`)

    core.logger.publish('ERROR', 'Core config validation error', null, 'CORE', {
      metadata: { errors: errorMessages },
      measurement: measurer.finish().toString()
    })

    return false
  } else {
    if (finalCoreAppConfig.logger?.level) core.logger.level = finalCoreAppConfig.logger.level
    if (finalCoreAppConfig.logger?.silence === true) core.logger.silence = true

    core.logger.publish('DEBUG', 'Core config loaded', null, 'CORE', { metadata: finalCoreAppConfig, measurement: measurer.finish().toString() })

    core.coreAppConfig = finalCoreAppConfig

    return true
  }
}

async function loadAppConfig(): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    const loadedAppConfig = await loadConfig(core.coreAppConfig.configDirectory, { selectEnvironment: true })

    core.logger.publish('DEBUG', 'App config loaded', null, 'CORE', { metadata: loadedAppConfig, measurement: measurer.finish().toString() })

    core.allConfig = loadedAppConfig
  } catch (error) {
    core.logger.publish('ERROR', 'There was an error loading the app config', null, 'CORE', {
      error,
      measurement: measurer.finish().toString()
    })

    return false
  }

  return true
}

async function loadApp(name: string, args: Record<string, any>): Promise<boolean> {
  const measurer = startMeasurement()
  const appPascalCaseName = pascalCase(name)
  const appParamCaseName = paramCase(name)

  const apps = await loadModules(core.coreAppConfig.appsDirectory, { conventionPrefix: 'app' })
  const appModuleRegistry = apps.find((module: ModuleRegistry): boolean => {
    const fileMatches = !!module.location.match(new RegExp(`(${appPascalCaseName}|${appParamCaseName}).app\..*$`))

    return module.exports ? module.exports.appShortName === name || module.exports.name === name || fileMatches : fileMatches
  })

  if (!appModuleRegistry) {
    core.logger.publish('ERROR', `No app named ${name} found`, null, 'CORE')
    return false
  } else if (appModuleRegistry.error) {
    core.logger.publish('ERROR', appParamCaseName, 'There was an error loading the app', 'CORE', { error: appModuleRegistry.error })
    return false
  } else if (!(appModuleRegistry.exports.prototype instanceof BaseApp)) {
    core.logger.publish('ERROR', appParamCaseName, 'App seems to not be a class inheriting from BaseApp', 'CORE')
    return false
  }

  core.appPascalCaseName = appPascalCaseName
  core.appParamCaseName = appParamCaseName
  core.appConfig = core.allConfig[appParamCaseName] || core.allConfig[appPascalCaseName]

  try {
    core.App = appModuleRegistry.exports
    core.appInstance = new core.App(core.appConfig, args, core.logger)
  } catch (error) {
    core.logger.publish('ERROR', appParamCaseName, 'There was an error instantiating the App', 'CORE', { error })
    return false
  }

  try {
    await core.appInstance.prepare()
  } catch (error) {
    core.logger.publish('ERROR', appParamCaseName, 'There was an error prparing the app', 'CORE', { error })
    return false
  }

  core.logger.publish('DEBUG', appParamCaseName, 'Loaded and prepared', 'CORE', { measurement: measurer.finish().toString() })

  return true
}

async function loadCoreAppModules(): Promise<boolean> {
  const measurer = startMeasurement()
  const localModules = await loadModules(core.coreAppConfig.modulesDirectory, { conventionPrefix: 'module' })
  const thridPartyModules = await loadModules('./node_modules', { conventionPrefix: 'universal-core-app-module' })
  const finalModules = [...localModules, ...thridPartyModules]
  let withErorrs = false

  for (let i = 0; i < finalModules.length; i++) {
    const currentModule = finalModules[i]

    if (currentModule.error) {
      core.logger.publish('ERROR', 'Module Error', 'There was an error loading a module', 'CORE', { error: currentModule.error })
      withErorrs = true
    } else if (!(currentModule.exports.prototype instanceof BaseModule)) {
      core.logger.publish('ERROR', 'Module does not implements BaseModule', currentModule.location, 'CORE')
      withErorrs = true
    }
  }

  if (withErorrs) return false

  for (let i = 0; i < finalModules.length; i++) {
    const moduleMeasurer = startMeasurement()
    const currentModule = finalModules[i]
    const moduleName = currentModule.exports.moduleName || currentModule.exports.name
    const moduleCamelCaseName = camelCase(moduleName)
    const moduleParamCaseName = paramCase(moduleName)
    const modulePascalCaseName = pascalCase(moduleName)
    const moduleConfig = (core.appConfig = core.allConfig[moduleParamCaseName] || core.allConfig[modulePascalCaseName] || core.allConfig[moduleName])

    if (core.moduleRegistries[moduleParamCaseName]) {
      core.logger.publish('WARNING', `Two modules have the same name: ${moduleName}`, `First loaded will take presedence\n${currentModule.location}`, 'CORE')
    } else {
      let moduleInstance: BaseModule

      try {
        moduleInstance = new currentModule.exports(moduleConfig, core.logger)
      } catch (error) {
        core.logger.publish('ERROR', moduleParamCaseName, 'There was an error instantiating the module', 'CORE', { error })
        return false
      }

      try {
        await moduleInstance.prepare()
      } catch (error) {
        core.logger.publish('ERROR', moduleParamCaseName, 'There was an error preparing the module', 'CORE', { error })
        return false
      }

      const internalModuleRegistry: InternalModuleRegistry = {
        ...currentModule,
        instance: moduleInstance,
        camelCaseName: moduleCamelCaseName,
        paramCaseName: moduleParamCaseName,
        pascalCaseName: modulePascalCaseName
      }

      core.loadedModules.push(moduleParamCaseName)
      core.moduleRegistries[moduleParamCaseName] = internalModuleRegistry

      // Let modules instances be visible in the global scupe
      global[moduleCamelCaseName] = moduleInstance

      core.logger.publish('DEBUG', moduleParamCaseName, 'Loaded and prepared', 'CORE', { measurement: moduleMeasurer.finish().toString() })
    }
  }

  core.logger.publish('INFO', 'Modules loaded', null, 'CORE', { measurement: measurer.finish().toString() })

  return true
}
