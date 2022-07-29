import Logger from '@universal-packages/logger'
import { loadModules, ModuleRegistry } from '@universal-packages/module-loader'
import { paramCase, pascalCase } from 'change-case'
import Core from './Core'
import { CoreConfig, CoreModules } from './Core.types'

export default class CoreTask<C = any, A = any> extends Core {
  public static readonly appName: string
  public static readonly description: string

  public readonly config: C
  public readonly directive: string
  public readonly directiveOptions: string[]
  public readonly args: A

  public constructor(config: C, directive: string, directiveOptions: string[], args: A, logger: Logger, coreModules: CoreModules) {
    super(logger, coreModules)
    this.directive = directive
    this.directiveOptions = directiveOptions
    this.config = config
    this.args = args
  }

  public static async find(name: string, coreConfigverride?: CoreConfig): Promise<typeof CoreTask> {
    const coreConfig = await this.getCoreConfig(coreConfigverride)
    const pascalCaseName = pascalCase(name)
    const paramCaseName = paramCase(name)
    const localTasks = await loadModules(coreConfig.tasksDirectory, { conventionPrefix: 'task' })
    const thirdPartyTasks = await loadModules('./node_modules', { conventionPrefix: 'universal-core-task' })
    const finalTasks = [...localTasks, ...thirdPartyTasks]
    const taskModuleRegistry = finalTasks.find((module: ModuleRegistry): boolean => {
      const fileMatches = !!module.location.match(new RegExp(`(${pascalCaseName}|${paramCaseName}).(task|universal-core-task)\..*$`))

      return module.exports ? module.exports.taskName === name || module.exports.name === name || fileMatches : fileMatches
    })

    if (!taskModuleRegistry) {
      return
    } else if (taskModuleRegistry.error) {
      throw taskModuleRegistry.error
    } else if (!(taskModuleRegistry.exports.prototype instanceof CoreTask)) {
      throw new Error(`Module does not implements CoreTask\n${taskModuleRegistry.location}`)
    }

    return taskModuleRegistry.exports
  }

  public async prepare(): Promise<void> {}

  public async exec(): Promise<void> {
    throw 'Implement me: Tasks should implement the exec method'
  }

  public async abort(): Promise<void> {}
}
