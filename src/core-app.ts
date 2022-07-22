import { loadConfig } from '@universal-packages/config-loader'
import Logger, { TerminalTransport } from '@universal-packages/logger'
import { loadModules, ModuleRegistry } from '@universal-packages/module-loader'
import { loadPluginConfig } from '@universal-packages/plugin-config-loader'
import { startMeasurement } from '@universal-packages/time-measurer'
import { paramCase, pascalCase } from 'change-case'
import BaseApp from './BaseApp'
import { coreConfigSchema } from './core-app.schema'
import { CoreAppConfig } from './core-app.types'

interface CoreCapsule {
  App: typeof BaseApp
  allConfig: Record<string, any>
  appConfig: Record<string, any>
  appInstance: BaseApp
  appParamCaseName: string
  appPascalCaseName: string
  args: Record<string, any>
  coreAppConfig: CoreAppConfig
  logger: Logger
  stopping: boolean
}

const coreCapsule: CoreCapsule = {
  App: null,
  allConfig: null,
  appConfig: null,
  appInstance: null,
  appParamCaseName: null,
  appPascalCaseName: null,
  args: null,
  coreAppConfig: null,
  logger: new Logger(),
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

  proceed = await loadApp(name, args)
  if (!proceed) return

  const terminate = async (): Promise<void> => {
    process.stdout.clearLine(0)
    process.stdout.cursorTo(0)

    if (coreCapsule.stopping) process.exit(0)

    coreCapsule.logger.publish('INFO', `Stopping ${name} app gracefully, press CTRL+C to kill`, null, 'CORE')

    coreCapsule.stopping = true
    await coreCapsule.appInstance.stop()
    await coreCapsule.appInstance.release()
  }

  process.addListener('SIGINT', terminate)
  process.addListener('SIGTERM', terminate)

  coreCapsule.logger.publish('INFO', `Staring ${name} app`, null, 'CORE')
  await coreCapsule.appInstance.start()
}

export async function execTask(name: string, directive: string, directiveOptions: string[], options: Record<string, any>): Promise<void> {
  await loadCoreAppConfig()
}

function initLogger(): boolean {
  try {
    const termianlTransport = coreCapsule.logger.getTransport('terminal') as TerminalTransport
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
    tasksDirectory: '.src/tasks',
    configDirectory: './src/config',
    ...loadedCoreAppConfig,
    logger: { logsDirectory: '.logs', silence: false, ...loadedCoreAppConfig.logger }
  }
  const errors = coreConfigSchema.validate(finalCoreAppConfig)

  if (errors.length > 0) {
    const errorMessages = errors.map((error: any): string => `${error.path} - ${error.message}`)

    coreCapsule.logger.publish('ERROR', 'Core configuration validation error', null, 'CORE', {
      metadata: { errors: errorMessages },
      measurement: measurer.finish().toString()
    })

    await coreCapsule.logger.await()
    return false
  } else {
    if (finalCoreAppConfig.logger?.level) coreCapsule.logger.level = finalCoreAppConfig.logger.level
    if (finalCoreAppConfig.logger?.silence === true) coreCapsule.logger.silence = true

    coreCapsule.logger.publish('DEBUG', 'Core Configuration loaded', null, 'CORE', { metadata: finalCoreAppConfig, measurement: measurer.finish().toString() })

    coreCapsule.coreAppConfig = finalCoreAppConfig

    return true
  }
}

async function loadAppConfig(): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    const loadedAppConfig = await loadConfig(coreCapsule.coreAppConfig.configDirectory, { selectEnvironment: true })

    coreCapsule.logger.publish('DEBUG', 'Core Configuration loaded', null, 'CORE', { metadata: loadedAppConfig, measurement: measurer.finish().toString() })

    coreCapsule.allConfig = loadedAppConfig
  } catch (error) {
    coreCapsule.logger.publish('ERROR', 'There was an error loading the config (The one from teh config dir)', null, 'CORE', {
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

  const apps = await loadModules(coreCapsule.coreAppConfig.appsDirectory, { conventionPrefix: 'app' })
  const appModuleRegistry = apps.find((module: ModuleRegistry): boolean => {
    const fileMatches = !!module.location.match(new RegExp(`(${appPascalCaseName}|${appParamCaseName}).app\..*$`))

    return module.exports ? module.exports.appShortName === name || module.exports.name === name || fileMatches : fileMatches
  })

  if (!appModuleRegistry) {
    coreCapsule.logger.publish({
      level: 'ERROR',
      title: `No app named ${name} found`,
      category: 'CORE'
    })
    await coreCapsule.logger.await()
    return false
  } else if (appModuleRegistry.error) {
    coreCapsule.logger.publish({
      level: 'ERROR',
      title: 'There was an error loading the App',
      message: `App "${name}" was loadaded with errors`,
      category: 'CORE',
      error: appModuleRegistry.error
    })
    await coreCapsule.logger.await()
    return false
  } else if (!(appModuleRegistry.exports.prototype instanceof BaseApp)) {
    coreCapsule.logger.publish({
      level: 'ERROR',
      title: 'Uable to load App',
      message: `App "${name}" seems to not be a class inheriting from BaseApp`,
      category: 'CORE'
    })
    await coreCapsule.logger.await()
    return false
  }

  coreCapsule.appPascalCaseName = appPascalCaseName
  coreCapsule.appParamCaseName = appParamCaseName
  coreCapsule.appConfig = coreCapsule.allConfig[appParamCaseName] || coreCapsule.allConfig[appPascalCaseName] || {}

  try {
    coreCapsule.App = appModuleRegistry.exports
    coreCapsule.appInstance = new coreCapsule.App(coreCapsule.appConfig, args, coreCapsule.logger)
  } catch (error) {
    coreCapsule.logger.publish({
      level: 'ERROR',
      title: 'There was an error instantiating the App',
      category: 'CORE',
      error: error
    })
    return false
  }

  try {
    await coreCapsule.appInstance.load()
  } catch (error) {
    coreCapsule.logger.publish({
      level: 'ERROR',
      title: 'There was an error running the App load routine',
      category: 'CORE',
      error: error
    })
    return false
  }

  coreCapsule.logger.publish('DEBUG', `App ${name} loaded`, null, 'CORE', { measurement: measurer.finish().toString() })

  return true
}
