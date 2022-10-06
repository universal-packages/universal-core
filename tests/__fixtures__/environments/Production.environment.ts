import BaseEnvironment from './BaseEnvironment'

export default class ProductionEnvironment extends BaseEnvironment {
  public static readonly environment: string | string[] = 'production'
}
