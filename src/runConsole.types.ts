import { CoreConfig } from './Core.types'

export interface RunConsoleOptions {
  coreConfigOverride?: CoreConfig
  exitType?: 'process' | 'throw'
}
