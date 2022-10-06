import { ProcessType } from '../../../src'
import BaseEnvironment from './BaseEnvironment'

export default class ConsoleEnvironment extends BaseEnvironment {
  public static readonly onlyFor: ProcessType = 'console'
}
