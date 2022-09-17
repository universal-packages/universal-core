import { Logger, LogLevel } from '@universal-packages/logger'
import CoreApp from './CoreApp'
import CoreModule from './CoreModule'
import CoreTask from './CoreTask'

export type ProjectConfig = Record<any, any>

export interface CoreConfig {
  appsLocation?: string
  appWatcher?: {
    enabled?: boolean
    ignore?: string[]
  }
  configLocation?: string
  modulesLocation?: string
  modulesAsGlobals?: boolean
  tasksLocation?: string
  logger?: {
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
  loaded: boolean
  logger: Logger
  projectConfig: ProjectConfig
  running: boolean
  stopping: boolean
  Task: typeof CoreTask
  taskInstance: CoreTask
}
