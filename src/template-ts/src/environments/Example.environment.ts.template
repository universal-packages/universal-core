import {
  CoreEnvironment,
  EnvironmentName,
  ProcessType,
} from "@universal-packages/core";

export default class ExampleEnvironment extends CoreEnvironment {
  public static readonly environment: EnvironmentName | EnvironmentName[] = 'development'
  public static readonly onlyFor: ProcessType = 'apps'
  public static readonly tideTo: string | string[] = 'example-app'

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
