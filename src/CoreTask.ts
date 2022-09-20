import { Logger } from '@universal-packages/logger'
import { loadModules, ModuleRegistry } from '@universal-packages/module-loader'
import { paramCase, pascalCase } from 'change-case'
import Core from './Core'
import { CoreConfig, CoreModules } from './Core.types'

export default class CoreTask<A = any> extends Core {
  public static readonly appName: string
  public static readonly description: string

  public readonly directive: string
  public readonly directiveOptions: string[]
  public readonly args: A

  public constructor(directive: string, directiveOptions: string[], args: A, logger: Logger, coreModules: CoreModules) {
    super(logger, coreModules)
    this.directive = directive
    this.directiveOptions = directiveOptions
    this.args = args
  }

  public static async find(name: string, coreConfigOverride?: CoreConfig): Promise<typeof CoreTask> {
    const coreConfig = await this.getCoreConfig(coreConfigOverride)
    const pascalCaseName = pascalCase(name)
    const paramCaseName = paramCase(name)
    const localTasks = await loadModules(coreConfig.tasksLocation, { conventionPrefix: 'task' })
    const thirdPartyTasks = await loadModules('./node_modules', { conventionPrefix: 'universal-core-task' })
    const finalTasks = [...localTasks, ...thirdPartyTasks]
    const taskModuleRegistry = finalTasks.find((module: ModuleRegistry): boolean => {
      const fileMatches = !!module.location.match(new RegExp(`(${pascalCaseName}|${paramCaseName}).(task|universal-core-task)\..*$`))

      return module.exports ? module.exports.taskName === name || module.exports.name === name || fileMatches : fileMatches
    })

    if (!taskModuleRegistry) {
      throw new Error(`Task "${name}" can't be found anywhere in\n${coreConfig.tasksLocation}`)
    } else if (taskModuleRegistry.error) {
      throw taskModuleRegistry.error
    }

    return taskModuleRegistry.exports
  }

  public prepare(): Promise<void> | void {}

  public exec(): Promise<void> | void {
    throw 'Implement me: Tasks should implement the exec method'
  }

  public abort(): Promise<void> | void {}
}
