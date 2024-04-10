import { updateCoreDocTaskProgress } from './updateCoreDoc'

export function setCoreGlobal(): void {
  global.core = {
    App: null,
    appConfig: null,
    appInstance: null,
    coreConfig: null,
    coreModules: null,
    developer: {
      updateTaskProgress: (progress: number) => {
        updateCoreDocTaskProgress(progress)
      },
      bucket: {}
    },
    environments: null,
    logger: null,
    projectConfig: null,
    stoppable: false,
    stopping: false,
    Task: null,
    taskInstance: null
  }

  Object.defineProperty(global, 'core', { value: global.core })
  Object.defineProperty(global.core, 'developer', { value: global.core.developer })
  Object.defineProperty(global.core.developer, 'bucket', { value: global.core.developer.bucket })
}
