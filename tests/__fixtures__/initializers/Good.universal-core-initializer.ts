import { sleep } from '@universal-packages/time-measurer'

import CoreInitializer from '../../../src/CoreInitializer'

export default class GoodInitializer extends CoreInitializer {
  public static iWasInitialized = false
  public static iWasAborted = false
  public static readonly initializerName = 'good-initializer'

  public readonly templatesLocation: string = `${__dirname}/templates`

  protected async initialize(): Promise<void> {
    await sleep(50)
    GoodInitializer.iWasInitialized = true
  }

  protected rollback(): Promise<void> | void {
    GoodInitializer.iWasAborted = true
  }
}
