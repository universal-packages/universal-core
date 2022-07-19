import { LogLevel } from '@universal-packages/logger'

export interface CoreAppConfig {
  appsDirectory: string
  tasksDirectory: string
  configDirectory: string
  logger: {
    transportsDirectory?: string
    level: LogLevel
    logsDirectory?: string
    silence?: boolean
  }
}
