import { CoreConfig } from './Core.types'

export interface RunAppOptions {
  args?: Record<string, any>
  forked?: boolean
  coreConfigOverride?: CoreConfig
  exitType?: 'process' | 'throw'
}

export type StopAppFunction = (restarting?: boolean) => Promise<void>
