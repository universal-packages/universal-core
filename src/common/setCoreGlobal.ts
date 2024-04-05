export function setCoreGlobal(): void {
  global.core = {
    App: null,
    appConfig: null,
    appInstance: null,
    coreConfig: null,
    coreModules: null,
    environments: null,
    logger: null,
    projectConfig: null,
    stoppable: false,
    stopping: false,
    Task: null,
    taskInstance: null
  }
}
