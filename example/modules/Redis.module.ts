import { sleep } from '@universal-packages/time-measurer'
import CoreModule from '../../src/CoreModule'

export default class RedisModule extends CoreModule {
  public static readonly moduleName = 'redis'
  public static readonly description = 'Redis interface'

  public async prepare(): Promise<void> {
    await sleep(1000)
  }

  public async release(): Promise<void> {
    await sleep(1000)
  }
}
