import CoreInitializer from '../../../src/CoreInitializer'

export default class RunErrorInitializer extends CoreInitializer {
  public static readonly initializerName = 'run-error-initializer'

  protected async initialize(): Promise<void> {
    throw 'Error'
  }
}
