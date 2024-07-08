import { CoreConfig } from './Core.types'

export interface RunInitializerOptions {
  args?: Record<string, any>
  locationOverride?: string
  coreConfigOverride?: CoreConfig
  exitType?: 'process' | 'throw'
}
