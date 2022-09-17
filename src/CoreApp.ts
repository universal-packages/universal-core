import { Logger } from '@universal-packages/logger'
import { loadModules, ModuleRegistry } from '@universal-packages/module-loader'
import { paramCase, pascalCase } from 'change-case'
import Core from './Core'
import { CoreConfig, CoreModules } from './Core.types'

export default class CoreApp<C = any, A = any> extends Core {
  public static readonly appName: string
  public static readonly description: string

  public readonly config: C
  public readonly args: A
  public readonly defaultConfig: C

  public constructor(config: C, args: A, logger: Logger, coreModules: CoreModules) {
    super(logger, coreModules)
    this.config = { ...this.defaultConfig, ...config }
    this.args = args
  }

  public static async find(name: string, coreConfigverride?: CoreConfig): Promise<typeof CoreApp> {
    const coreConfig = await this.getCoreConfig(coreConfigverride)
    const pascalCaseName = pascalCase(name)
    const paramCaseName = paramCase(name)
    const localApps = await loadModules(coreConfig.appsLocation, { conventionPrefix: 'app' })
    const thirdPartyApps = await loadModules('./node_modules', { conventionPrefix: 'universal-core-app' })
    const finalApps = [...localApps, ...thirdPartyApps]
    const appModuleRegistry = finalApps.find((module: ModuleRegistry): boolean => {
      const fileMatches = !!module.location.match(new RegExp(`(${pascalCaseName}|${paramCaseName}).(app|universal-core-app)\..*$`))

      return module.exports ? module.exports?.appName === name || module.exports?.name === name || fileMatches : fileMatches
    })

    if (!appModuleRegistry) {
      throw new Error(`App "${name}" can't be found anywhere in\n${coreConfig.appsLocation}`)
    } else if (appModuleRegistry.error) {
      throw appModuleRegistry.error
    }

    return appModuleRegistry.exports
  }

  public prepare(): Promise<void> | void {}

  public run(): Promise<void> | void {
    throw 'Implement me: Apps should implement the run method'
  }

  public stop(): Promise<void> | void {
    throw 'Implement me: Apps should implement the stop method'
  }

  public release(): Promise<void> | void {}
}
