import { LOG_CONFIGURATION } from './terminal-presenter/LOG_CONFIGURATION'
import { updateCoreDoc } from './updateCoreDoc'

export async function initTerminalPresenter(): Promise<void> {
  core.TerminalPresenter.configure(core.coreConfig.terminalPresenter)
  core.TerminalPresenter.start()

  if (core.coreConfig.terminalPresenter?.enable && process.env.NODE_ENV !== 'development') {
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

  core.TerminalPresenter.appendDocument('CORE-DOC', { rows: [{ blocks: [{ text: ' ' }] }] })

  updateCoreDoc()
}
