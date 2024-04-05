import { captureConsole, clearScreen, configure } from '@universal-packages/terminal-presenter'

import { LOG_CONFIGURATION } from './terminal-presenter/LOG_CONFIGURATION'

export async function initTerminalPresenter(): Promise<void> {
  configure(core.coreConfig.terminalPresenter)
  clearScreen()
  captureConsole()

  if (core.coreConfig.terminalPresenter?.enabled && process.env.NODE_ENV !== 'development') {
    core.logger.log(
      {
        level: 'WARNING',
        title: 'Terminal Presenter is meant only for development',
        message: 'Consider deactivating it for not development environments',
        category: 'CORE'
      },
      LOG_CONFIGURATION
    )
  }
}
