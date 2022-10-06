import { ProcessType } from '../../../src'
import BaseEnvironment from './BaseEnvironment'

export default class AppEnvironment extends BaseEnvironment {
  public static readonly onlyFor: ProcessType = 'apps'
}
