import { Logger } from '@universal-packages/logger'
import { ModuleRegistry, loadModules } from '@universal-packages/module-loader'
import { paramCase, pascalCase } from 'change-case'

import Core from './Core'
import { CoreConfig } from './Core.types'

export default class CoreApp<C = any, A = any> extends Core {
  public static readonly appName: string
  public static readonly description: string
  public static readonly defaultConfig: any

  public readonly config: C
  public readonly args: A

  public constructor(config: C, args: A, logger: Logger) {
    super(logger)
    this.config = config
    this.args = args
  }

  public static async find(name: string, coreConfigOverride?: CoreConfig): Promise<typeof CoreApp> {
    const coreConfig = await this.getCoreConfig(coreConfigOverride)
    const pascalCaseName = pascalCase(name)
    const paramCaseName = paramCase(name)
    const localApps = await loadModules(coreConfig.apps.location, { conventionPrefix: 'app' })
    const thirdPartyApps = await loadModules('./node_modules', { conventionPrefix: 'universal-core-app' })
    const finalApps = [...localApps, ...thirdPartyApps]
    const appModuleRegistry = finalApps.find((module: ModuleRegistry): boolean => {
      const fileMatches = !!module.location.match(new RegExp(`(${pascalCaseName}|${paramCaseName}).(app|universal-core-app)\..*$`))

      return module.exports ? module.exports?.appName === name || module.exports?.name === name || fileMatches : fileMatches
    })

    if (!appModuleRegistry) {
      throw new Error(`App "${name}" can't be found anywhere in: ${coreConfig.apps.location}`)
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
