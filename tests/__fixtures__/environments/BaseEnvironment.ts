import { CoreEnvironment } from '../../../src'

export default class BaseEnvironment extends CoreEnvironment {
  public static calls: string[] = []

  public beforeModulesLoad(): Promise<void> | void {
    const Class = this.constructor as typeof BaseEnvironment
    Class.calls.push('beforeModulesLoad')
  }
  public afterModulesLoad(): Promise<void> | void {
    const Class = this.constructor as typeof BaseEnvironment
    Class.calls.push('afterModulesLoad')
  }

  public beforeAppPrepare(): Promise<void> | void {
    const Class = this.constructor as typeof BaseEnvironment
    Class.calls.push('beforeAppPrepare')
  }
  public afterAppPrepare(): Promise<void> | void {
    const Class = this.constructor as typeof BaseEnvironment
    Class.calls.push('afterAppPrepare')
  }

  public beforeAppRuns(): Promise<void> | void {
    const Class = this.constructor as typeof BaseEnvironment
    Class.calls.push('beforeAppRuns')
  }
  public afterAppRuns(): Promise<void> | void {
    const Class = this.constructor as typeof BaseEnvironment
    Class.calls.push('afterAppRuns')
  }

  public beforeTaskExec(): Promise<void> | void {
    const Class = this.constructor as typeof BaseEnvironment
    Class.calls.push('beforeTaskExec')
  }
  public afterTaskExec(): Promise<void> | void {
    const Class = this.constructor as typeof BaseEnvironment
    Class.calls.push('afterTaskExec')
  }

  public beforeConsoleRuns(): Promise<void> | void {
    const Class = this.constructor as typeof BaseEnvironment
    Class.calls.push('beforeConsoleRuns')
  }
  public afterConsoleRuns(): Promise<void> | void {
    const Class = this.constructor as typeof BaseEnvironment
    Class.calls.push('afterConsoleRuns')
  }

  public beforeAppStops(): Promise<void> | void {
    const Class = this.constructor as typeof BaseEnvironment
    Class.calls.push('beforeAppStops')
  }
  public afterAppStops(): Promise<void> | void {
    const Class = this.constructor as typeof BaseEnvironment
    Class.calls.push('afterAppStops')
  }

  public beforeTaskAborts(): Promise<void> | void {
    const Class = this.constructor as typeof BaseEnvironment
    Class.calls.push('beforeTaskAborts')
  }
  public afterTaskAborts(): Promise<void> | void {
    const Class = this.constructor as typeof BaseEnvironment
    Class.calls.push('afterTaskAborts')
  }

  public afterConsoleStops(): Promise<void> | void {
    const Class = this.constructor as typeof BaseEnvironment
    Class.calls.push('afterConsoleStops')
  }

  public beforeAppRelease(): Promise<void> | void {
    const Class = this.constructor as typeof BaseEnvironment
    Class.calls.push('beforeAppRelease')
  }
  public afterAppRelease(): Promise<void> | void {
    const Class = this.constructor as typeof BaseEnvironment
    Class.calls.push('afterAppRelease')
  }

  public beforeModulesRelease(): Promise<void> | void {
    const Class = this.constructor as typeof BaseEnvironment
    Class.calls.push('beforeModulesRelease')
  }
  public afterModulesRelease(): Promise<void> | void {
    const Class = this.constructor as typeof BaseEnvironment
    Class.calls.push('afterModulesRelease')
  }
}
