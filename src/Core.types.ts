import { Logger, LoggerOptions } from '@universal-packages/logger'
import { SubProcess, SubProcessOptions } from '@universal-packages/sub-process'
import { DocumentDescriptor } from '@universal-packages/terminal-document'
import { PresenterDocumentDescriptor, TerminalPresenterOptions } from '@universal-packages/terminal-presenter'

import CoreApp from './CoreApp'
import CoreEnvironment from './CoreEnvironment'
import CoreInitializer from './CoreInitializer'
import CoreModule from './CoreModule'
import CoreTask from './CoreTask'

export type ProjectConfig = Record<any, any>
export type EnvironmentName = 'production' | 'development' | 'test' | '!production' | '!development' | '!test' | string
export type ProcessType = 'apps' | 'tasks' | 'console' | 'bare'
export type EnvironmentEvent =
  // Module load events
  | 'beforeModulesLoad'
  | 'afterModulesLoad'
  // App prepare events
  | 'beforeAppPrepare'
  | 'afterAppPrepare'
  // App run events
  | 'beforeAppRuns'
  | 'afterAppRuns'
  // Task exec events
  | 'beforeTaskExec'
  | 'afterTaskExec'
  // Console events
  | 'beforeConsoleRuns'
  | 'afterConsoleRuns'
  // App stop events
  | 'beforeAppStops'
  | 'afterAppStops'
  // Task abort events
  | 'beforeTaskAborts'
  | 'afterTaskAborts'
  // Console stop events
  | 'afterConsoleStops'
  // App release events
  | 'beforeAppRelease'
  | 'afterAppRelease'
  // Module release events
  | 'beforeModulesRelease'
  | 'afterModulesRelease'
export type EnvironmentInterface = { [event in EnvironmentEvent]: () => Promise<void> | void }

export interface CoreConfig {
  apps?: {
    location?: string
    watcher?: {
      enabled?: boolean
      ignore?: string[]
    }
  }
  config?: {
    location?: string
  }
  environments?: {
    location?: string
  }
  modules?: {
    asGlobals?: boolean
    location?: string
  }
  tasks?: {
    location?: string
  }
  terminalPresenter?: TerminalPresenterOptions
  logger?: LoggerOptions
}

export interface CoreModules {
  [name: string]: CoreModule
}

export interface CoreModuleWarning {
  title: string
  message: string
}

export interface CoreDeveloperSpace {
  bucket: Record<string, any>
  terminalPresenter: {
    setProgressPercentage: (progressPercentage: number) => void
    increaseProgressPercentageBy: (percentage: number) => void

    startProgressIncreaseSimulation: (amount: number, simulatedTime: number, refreshRate?: number) => void
    finishProgressIncreaseSimulation: () => void

    setScriptOutput: (scriptOutput: string) => void

    setSubProcess: (options: SubProcessOptions) => SubProcess
    runSubProcess: (options: SubProcessOptions) => Promise<SubProcess>
  }
}

export interface TerminalPresenterCoreAnalog {
  configure: (options: TerminalPresenterOptions) => void
  appendRealTimeDocument: (id: string, presenterDocument: PresenterDocumentDescriptor) => void
  clearRealTimeDocuments: () => void
  clearScreen: () => void
  captureConsole: () => void
  prependRealTimeDocument: (id: string, presenterDocument: PresenterDocumentDescriptor) => void
  present: () => void
  printDocument: (documentDescriptor: DocumentDescriptor) => void
  printString: (subject: string) => void
  releaseConsole: () => void
  removeRealTimeDocument: (id: string) => void
  restore: () => void
  updateRealTimeDocument: (id: string, presenterDocument: PresenterDocumentDescriptor) => void
  OPTIONS: TerminalPresenterOptions
}

export interface CoreGlobal {
  App: typeof CoreApp
  appConfig: Record<string, any>
  appInstance: CoreApp
  coreConfig: CoreConfig
  coreModules: CoreModules
  developer: CoreDeveloperSpace
  environments: CoreEnvironment[]
  Initializer: typeof CoreInitializer
  initializerInstance: CoreInitializer
  logger: Logger
  projectConfig: ProjectConfig
  stoppable: boolean
  stopping: boolean
  Task: typeof CoreTask
  taskInstance: CoreTask
  terminalPresenter: TerminalPresenterCoreAnalog
}
