import { Logger } from '@universal-packages/logger'
import { EnvironmentInterface, EnvironmentName, ProcessType } from './Core.types'

export default class CoreEnvironment implements EnvironmentInterface {
  public static readonly environment: EnvironmentName | EnvironmentName[]
  public static readonly onlyFor: ProcessType
  public static readonly tideTo: string | string[]

  public readonly logger: Logger

  public constructor(logger: Logger) {
    this.logger = logger
  }

  public beforeModulesLoad(): Promise<void> | void {}
  public afterModulesLoad(): Promise<void> | void {}

  public beforeAppPrepare(): Promise<void> | void {}
  public afterAppPrepare(): Promise<void> | void {}

  public beforeAppRuns(): Promise<void> | void {}
  public afterAppRuns(): Promise<void> | void {}

  public beforeTaskExec(): Promise<void> | void {}
  public afterTaskExec(): Promise<void> | void {}

  public beforeConsoleRuns(): Promise<void> | void {}
  public afterConsoleRuns(): Promise<void> | void {}

  public beforeAppStops(): Promise<void> | void {}
  public afterAppStops(): Promise<void> | void {}

  public beforeTaskAborts(): Promise<void> | void {}
  public afterTaskAborts(): Promise<void> | void {}

  public afterConsoleStops(): Promise<void> | void {}

  public beforeAppRelease(): Promise<void> | void {}
  public afterAppRelease(): Promise<void> | void {}

  public beforeModulesRelease(): Promise<void> | void {}
  public afterModulesRelease(): Promise<void> | void {}
}
