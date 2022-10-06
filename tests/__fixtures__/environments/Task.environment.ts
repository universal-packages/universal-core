import { ProcessType } from '../../../src'
import BaseEnvironment from './BaseEnvironment'

export default class TaskEnvironment extends BaseEnvironment {
  public static readonly onlyFor: ProcessType = 'tasks'
}
