import { sleep } from '@universal-packages/time-measurer'

import CoreInitializer from '../../../src/CoreInitializer'

export default class AbortErrorInitializer extends CoreInitializer {
  public static readonly initializerName = 'abort-error-initializer'

  public readonly templatesLocation: string = `${__dirname}/templates`

  protected async afterTemplatePopulate(): Promise<void> {
    await sleep(500)
  }

  public abort(): Promise<void> | void {
    throw 'Error'
  }
}
