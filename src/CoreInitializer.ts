import { quickCheckDirectory } from '@universal-packages/fs-utils'
import { Logger } from '@universal-packages/logger'
import { ModuleRegistry, loadModules } from '@universal-packages/module-loader'
import { populateTemplates } from '@universal-packages/template-populator'
import { paramCase, pascalCase } from 'change-case'

import Core from './Core'

export default class CoreInitializer<A = any> extends Core {
  public static readonly initializerName: string
  public static readonly description: string

  public readonly args: A
  public readonly typescript: boolean = false
  public readonly sourceLocation: string = './src'

  public readonly templatesLocation: string = `${__dirname}/templates`

  protected readonly templateVariables: Record<string, string> = {}
  protected readonly operationLocation: string = './'

  public constructor(args: A, logger: Logger) {
    super(logger)
    this.args = args
    this.typescript = args['typescript'] || args['ts'] || false
    this.sourceLocation = args['source'] || args['src'] || this.sourceLocation
  }

  public static async find(name: string, locationOverride?: string): Promise<typeof CoreInitializer> {
    const pascalCaseName = pascalCase(name)
    const paramCaseName = paramCase(name)
    const inDevelopmentInitializers = await loadModules(locationOverride || './src', { conventionPrefix: 'universal-core-initializer' })
    const thirdPartyInitializers = await loadModules('./node_modules', { conventionPrefix: 'universal-core-initializer' })
    const finalInitializers = [...inDevelopmentInitializers, ...thirdPartyInitializers]

    const initializerModuleRegistry = finalInitializers.find((module: ModuleRegistry): boolean => {
      const fileMatches = !!module.location
        .split('/')
        .pop()
        .match(new RegExp(`(${pascalCaseName}|${paramCaseName}).universal-core-initializer\..*$`))

      return module.exports ? module.exports.initializerName === name || module.exports.name === name || fileMatches : fileMatches
    })

    if (!initializerModuleRegistry) {
      throw new Error(`Initializers "${name}" can't be found anywhere in node modules.`)
    } else if (initializerModuleRegistry.error) {
      throw initializerModuleRegistry.error
    }

    return initializerModuleRegistry.exports
  }

  public async run(): Promise<void> {
    await this.beforeTemplatePopulate()
    await this.populateTemplate()
    await this.afterTemplatePopulate()

    core.developer.terminalPresenter.setProgressPercentage(100)
  }

  public abort(): Promise<void> | void {}

  protected beforeTemplatePopulate(): Promise<void> | void {}
  protected afterTemplatePopulate(): Promise<void> | void {}

  private async populateTemplate(): Promise<void> {
    let templateLocation = quickCheckDirectory(`${this.templatesLocation}/default`)

    if (this.typescript) {
      const typescriptTemplateLocation = quickCheckDirectory(`${this.templatesLocation}/typescript`)

      if (!typescriptTemplateLocation) {
        this.logger.log({
          level: 'WARNING',
          title: 'Typescript template not available',
          message: 'The typescript template was requested but the initializer does not provide it',
          category: 'CORE'
        })
      } else {
        templateLocation = typescriptTemplateLocation
      }
    }

    if (templateLocation) {
      const sourceTemplateLocation = quickCheckDirectory(`${templateLocation}/source`)
      const rootTemplateLocation = quickCheckDirectory(`${templateLocation}/root`)

      if (sourceTemplateLocation) {
        await populateTemplates(sourceTemplateLocation, this.sourceLocation, { replacementVariables: { ...this.templateVariables } })
      }

      if (rootTemplateLocation) {
        await populateTemplates(rootTemplateLocation, this.operationLocation, { replacementVariables: { ...this.templateVariables } })
      }
    }
  }
}
