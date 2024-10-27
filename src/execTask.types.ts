import { CoreConfig } from './Core.types'

export interface ExecTaskOptions {
  args?: Record<string, any>
  coreConfigOverride?: CoreConfig
  directive?: string
  directiveOptions?: string[]
  exitType?: 'process' | 'throw'
}

export type AbortTaskFunction = () => Promise<void>
