import BaseEnvironment from './BaseEnvironment'

export default class NotProductionEnvironment extends BaseEnvironment {
  public static readonly environment = ['!production', '!development']
}
