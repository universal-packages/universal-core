import { TerminalPresenter } from '@universal-packages/terminal-presenter'

export function setCoreGlobal(forked: boolean = false): void {
  global.core = {
    App: null,
    appConfig: null,
    appInstance: null,
    coreConfig: null,
    coreModules: null,
    environments: null,
    forked: forked,
    logger: null,
    projectConfig: null,
    stoppable: false,
    stopping: false,
    Task: null,
    taskInstance: null,
    TerminalPresenter: TerminalPresenter
  }
}
