import { appendRealTimeDocument, present } from '@universal-packages/terminal-presenter'

import { updateCoreDoc } from './updateCoreDoc'

export async function startPresenting(): Promise<void> {
  present()
  appendRealTimeDocument('CORE-DOC', { rows: [{ blocks: [{ text: ' ' }] }] })

  updateCoreDoc()
}
