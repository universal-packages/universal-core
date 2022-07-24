import { sleep } from '@universal-packages/time-measurer'
import BaseModule from '../../src/BaseModule'

export default class RedisModule extends BaseModule {
  public static readonly moduleName = 'redis'
  public static readonly description = 'Redis interface'

  public async prepare(): Promise<void> {
    await sleep(1000)
  }

  public async release(): Promise<void> {
    await sleep(1000)
  }
}
