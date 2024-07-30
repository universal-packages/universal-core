import { sleep } from '@universal-packages/time-measurer'

import CoreTask from '../../../src/CoreTask'

export default class NotAllowTask extends CoreTask {
  public static iWasExecuted = false
  public static iWasAborted = false
  public static readonly taskName = 'not-allow-task'
  public static readonly allowLoadEnvironments: boolean = false
  public static readonly allowLoadModules: boolean = false

  public async exec(): Promise<void> {
    await sleep(50)
    NotAllowTask.iWasExecuted = true
  }

  public abort(): Promise<void> | void {
    NotAllowTask.iWasAborted = true
  }
}
