import * as TP from '@universal-packages/terminal-presenter'

import { updateCoreDocProgress } from './updateCoreDoc'

export function setCoreGlobal(): void {
  global.core = {
    App: null,
    appConfig: null,
    appInstance: null,
    coreConfig: null,
    coreModules: null,
    developer: {
      updateProgress: (progress: number) => {
        updateCoreDocProgress(progress)
      },
      bucket: {}
    },
    environments: null,
    Initializer: null,
    initializerInstance: null,
    logger: null,
    projectConfig: null,
    stoppable: false,
    stopping: false,
    Task: null,
    taskInstance: null,
    terminalPresenter: {
      configure: TP.configure,
      appendRealTimeDocument: TP.appendRealTimeDocument,
      clearRealTimeDocuments: TP.clearRealTimeDocuments,
      clearScreen: TP.clearScreen,
      captureConsole: TP.captureConsole,
      prependRealTimeDocument: TP.prependRealTimeDocument,
      present: TP.present,
      printString: TP.printString,
      printDocument: TP.printDocument,
      releaseConsole: TP.releaseConsole,
      removeRealTimeDocument: TP.removeRealTimeDocument,
      restore: TP.restore,
      updateRealTimeDocument: TP.updateRealTimeDocument,
      OPTIONS: TP.OPTIONS
    }
  }

  Object.defineProperty(global, 'core', { value: global.core })
  Object.defineProperty(global.core, 'developer', { value: global.core.developer })
  Object.defineProperty(global.core.developer, 'bucket', { value: global.core.developer.bucket })
  Object.defineProperty(global.core, 'terminalPresenter', { value: global.core.terminalPresenter })
}
