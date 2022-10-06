import { EnvironmentEvent } from '../../../src'
import CoreEnvironment from '../../../src/CoreEnvironment'

export default class EventErrorEnvironment extends CoreEnvironment {
  public static toError: EnvironmentEvent

  public beforeModulesLoad(): Promise<void> | void {
    if (EventErrorEnvironment.toError === 'beforeModulesLoad') throw 'Event Error'
  }
  public afterModulesLoad(): Promise<void> | void {
    if (EventErrorEnvironment.toError === 'afterModulesLoad') throw 'Event Error'
  }

  public beforeAppPrepare(): Promise<void> | void {
    if (EventErrorEnvironment.toError === 'beforeAppPrepare') throw 'Event Error'
  }
  public afterAppPrepare(): Promise<void> | void {
    if (EventErrorEnvironment.toError === 'afterAppPrepare') throw 'Event Error'
  }

  public beforeAppRuns(): Promise<void> | void {
    if (EventErrorEnvironment.toError === 'beforeAppRuns') throw 'Event Error'
  }
  public afterAppRuns(): Promise<void> | void {
    if (EventErrorEnvironment.toError === 'afterAppRuns') throw 'Event Error'
  }

  public beforeTaskExec(): Promise<void> | void {
    if (EventErrorEnvironment.toError === 'beforeTaskExec') throw 'Event Error'
  }
  public afterTaskExec(): Promise<void> | void {
    if (EventErrorEnvironment.toError === 'afterTaskExec') throw 'Event Error'
  }

  public beforeConsoleRuns(): Promise<void> | void {
    if (EventErrorEnvironment.toError === 'beforeConsoleRuns') throw 'Event Error'
  }
  public afterConsoleRuns(): Promise<void> | void {
    if (EventErrorEnvironment.toError === 'afterConsoleRuns') throw 'Event Error'
  }

  public beforeAppStops(): Promise<void> | void {
    if (EventErrorEnvironment.toError === 'beforeAppStops') throw 'Event Error'
  }
  public afterAppStops(): Promise<void> | void {
    if (EventErrorEnvironment.toError === 'afterAppStops') throw 'Event Error'
  }

  public beforeTaskAborts(): Promise<void> | void {
    if (EventErrorEnvironment.toError === 'beforeTaskAborts') throw 'Event Error'
  }
  public afterTaskAborts(): Promise<void> | void {
    if (EventErrorEnvironment.toError === 'afterTaskAborts') throw 'Event Error'
  }

  public afterConsoleStops(): Promise<void> | void {
    if (EventErrorEnvironment.toError === 'afterConsoleStops') throw 'Event Error'
  }

  public beforeAppRelease(): Promise<void> | void {
    if (EventErrorEnvironment.toError === 'beforeAppRelease') throw 'Event Error'
  }
  public afterAppRelease(): Promise<void> | void {
    if (EventErrorEnvironment.toError === 'afterAppRelease') throw 'Event Error'
  }

  public beforeModulesRelease(): Promise<void> | void {
    if (EventErrorEnvironment.toError === 'beforeModulesRelease') throw 'Event Error'
  }
  public afterModulesRelease(): Promise<void> | void {
    if (EventErrorEnvironment.toError === 'afterModulesRelease') throw 'Event Error'
  }
}
