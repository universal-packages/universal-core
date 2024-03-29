import { updateCoreDoc } from './updateCoreDoc'

export async function startPresenting(): Promise<void> {
  core.TerminalPresenter.start()
  core.TerminalPresenter.appendDocument('CORE-DOC', { rows: [{ blocks: [{ text: ' ' }] }] })

  updateCoreDoc()
}
