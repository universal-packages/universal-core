import { CoreConfig } from './Core.types'

export interface RunBareOptions {
  coreConfigOverride?: CoreConfig
  exitType?: 'process' | 'throw'
}

export type UnloadFunction = () => Promise<void>
