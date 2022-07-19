import Logger, { TerminalTransport } from '@universal-packages/logger'
import { loadModules, ModuleRegistry } from '@universal-packages/module-loader'
import { loadPluginConfig } from '@universal-packages/plugin-config-loader'
import { startMeasurement } from '@universal-packages/time-measurer'
import { paramCase, pascalCase } from 'change-case'
import BaseApp from './BaseApp'
import { coreConfigSchema } from './core-app.schema'
import { CoreAppConfig } from './core-app.types'

const globals = {
  App: null,
  appInstance: null,
  args: null,
  coreAppConfig: null,
  logger: new Logger(),
  errored: false
}

export async function startApp(name: string, args: Record<string, any>): Promise<void> {
  let proceed = true

  proceed = initLogger()
  if (!proceed) return

  proceed = await loadCoreAppConfig()
  if (!proceed) return

  proceed = await loadApp(name, args)
  if (!proceed) return
}

export async function execTask(name: string, directive: string, directiveOptions: string[], options: Record<string, any>): Promise<void> {
  await loadCoreAppConfig()
}

function initLogger(): boolean {
  try {
    const termianlTransport = globals.logger.getTransport('terminal') as TerminalTransport
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

    globals.logger.publish('ERROR', 'Core configuration validation error', null, 'CORE', {
      metadata: { errors: errorMessages },
      measurement: measurer.finish().toString()
    })

    await globals.logger.await()
    return false
  } else {
    if (finalCoreAppConfig.logger?.level) globals.logger.level = finalCoreAppConfig.logger.level
    if (finalCoreAppConfig.logger?.silence === true) globals.logger.silence = true

    globals.logger.publish('DEBUG', 'Core Configuration loaded', null, 'CORE', { metadata: finalCoreAppConfig, measurement: measurer.finish().toString() })

    globals.coreAppConfig = finalCoreAppConfig

    return true
  }
}

async function loadApp(name: string, args: Record<string, any>): Promise<boolean> {
  const measurer = startMeasurement()

  const pascalCaseName = pascalCase(name)
  const paramCaseName = paramCase(name)
  const apps = await loadModules(globals.coreAppConfig.appsDirectory, { conventionPrefix: 'app' })
  const appModuleRegistry = apps.find((module: ModuleRegistry): boolean => {
    const fileMatches = !!module.location.match(new RegExp(`(${pascalCaseName}|${paramCaseName}).app\..*$`))

    return module.exports ? module.exports.appShortName === name || module.exports.name === name || fileMatches : fileMatches
  })

  if (!appModuleRegistry) {
    globals.logger.publish({
      level: 'ERROR',
      title: `No app named ${name} found`,
      category: 'CORE'
    })
    await globals.logger.await()
    return false
  } else if (appModuleRegistry.error) {
    globals.logger.publish({
      level: 'ERROR',
      title: 'There was an error loading the App',
      message: `App "${name}" was loadaded with errors`,
      category: 'CORE',
      error: appModuleRegistry.error
    })
    await globals.logger.await()
    return false
  } else if (!(appModuleRegistry.exports.prototype instanceof BaseApp)) {
    globals.logger.publish({
      level: 'ERROR',
      title: 'Uable to load App',
      message: `App "${name}" seems to not be a class inheriting from BaseApp`,
      category: 'CORE'
    })
    await globals.logger.await()
    return false
  }

  try {
    globals.App = appModuleRegistry.exports
    globals.appInstance = new globals.App(globals, args)
  } catch (error) {
    globals.logger.publish({
      level: 'ERROR',
      title: 'There was an error instantiating the App',
      category: 'CORE',
      error: error
    })
    return false
  }

  try {
    await globals.appInstance.load()
  } catch (error) {
    globals.logger.publish({
      level: 'ERROR',
      title: 'There was an error running the App load routine',
      category: 'CORE',
      error: error
    })
    return false
  }

  globals.logger.publish('INFO', `App ${name} loaded`, null, 'CORE', { measurement: measurer.finish().toString() })

  return true
}
