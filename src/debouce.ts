export function debounce(original: () => Promise<void>, muteTime: number = 500): () => Promise<void> {
  let canExecute = true

  return async (): Promise<void> => {
    if (canExecute) await original()
    canExecute = false
    setTimeout(() => (canExecute = true), muteTime)
  }
}
