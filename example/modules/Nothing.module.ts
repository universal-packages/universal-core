import { sleep } from '@universal-packages/time-measurer'

import CoreModule from '../../src/CoreModule'

export default class NotingModule extends CoreModule {
  public static readonly moduleName = 'nothing'
  public static readonly description = 'This module does nothing'

  public async prepare(): Promise<void> {
    await sleep(1000)
  }

  public async release(): Promise<void> {
    await sleep(1000)
  }
}
