import { Logger } from '@universal-packages/logger'

import { EnvironmentName, ProcessType } from './Core.types'

export default class CoreModule<C = any, S = any> {
  public static readonly moduleName: string
  public static readonly description: string
  public static readonly defaultConfig: Record<string, any>
  public static readonly environment: EnvironmentName | EnvironmentName[]
  public static readonly onlyFor: ProcessType
  public static readonly tideTo: string | string[]

  public readonly config: C
  public readonly logger: Logger

  public subject: S

  public constructor(config: C, logger: Logger) {
    this.config = config
    this.logger = logger
  }

  public prepare(): Promise<void> | void {
    throw 'Implement me: Modules should implement the prepare method'
  }

  public release(): Promise<void> | void {
    throw 'Implement me: Modules should implement the release method'
  }
}
