import CoreInitializer from '../../../src/CoreInitializer'

export default class LoadErrorInitializer extends CoreInitializer {
  public static readonly initializerName = 'load-error-initializer'

  public readonly templatesLocation: string = `${__dirname}/templates`
}

throw new Error('Errored')
