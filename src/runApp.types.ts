import { CoreConfig } from './Core.types'

export interface RunAppOptions {
  args?: Record<string, any>
  coreConfigOverride?: CoreConfig
  demon?: boolean
  exitType?: 'process' | 'throw'
}

export type StopAppFunction = (restarting?: boolean) => Promise<void>
