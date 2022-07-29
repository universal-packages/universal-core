import Logger, { LogLevel } from '@universal-packages/logger'
import CoreApp from './CoreApp'
import CoreModule from './CoreModule'
import CoreTask from './CoreTask'

export type ProjectConfig = Record<any, any>

export interface CoreConfig {
  appsDirectory?: string
  appWatcher?: {
    enabled?: boolean
    ignore?: string[]
  }
  configDirectory?: string
  modulesDirectory?: string
  modulesAsGlobals?: boolean
  tasksDirectory?: string
  logger?: {
    transportsDirectory?: string
    level?: LogLevel
    silence?: boolean
    terminal?: {
      clear?: boolean
      enable?: boolean
      withHeader?: boolean
    }
    localFile?: {
      asJson?: boolean
      location?: string
      enable?: boolean
    }
  }
}

export interface CoreModules {
  [name: string]: CoreModule
}

export interface CoreModuleWarning {
  title: string
  message: string
}

export interface CoreGlobal {
  App: typeof CoreApp
  appConfig: Record<string, any>
  appInstance: CoreApp
  coreConfig: CoreConfig
  coreModules: CoreModules
  logger: Logger
  projectConfig: ProjectConfig
  stopping: boolean
  Task: typeof CoreTask
  taskConfig: Record<string, any>
  taskInstance: CoreTask
}
