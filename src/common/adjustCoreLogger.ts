import { LocalFileTransport, TerminalTransport } from '@universal-packages/logger'

export function adjustCoreLogger(): void {
  const terminalTransport = core.logger.getTransport('terminal') as TerminalTransport
  const localFileTransport = core.logger.getTransport('localFile') as LocalFileTransport

  if (core.coreConfig.logger?.level) core.logger.level = core.coreConfig.logger.level
  if (core.coreConfig.logger?.silence !== undefined) core.logger.silence = core.coreConfig.logger?.silence

  if (core.coreConfig.logger?.terminal) {
    terminalTransport.enabled = core.coreConfig.logger?.terminal?.enable !== false
    terminalTransport.options.clear = core.coreConfig.logger?.terminal?.clear !== false
    terminalTransport.options.withHeader = core.coreConfig.logger?.terminal?.withHeader !== false
  }

  if (core.coreConfig.logger?.localFile) {
    localFileTransport.enabled = core.coreConfig.logger?.localFile?.enable !== false
    localFileTransport.options.asJson = core.coreConfig.logger?.localFile?.asJson !== false
    localFileTransport.options.location = core.coreConfig.logger?.localFile.location || localFileTransport.options.location
  }
}
