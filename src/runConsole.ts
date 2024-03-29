import repl from 'repl'

import Core from './Core'
import { emitEnvironmentEvent } from './common/emitEnvironmentEvent'
import { initCoreLogger } from './common/initCoreLogger'
import { loadAndSetCoreConfig } from './common/loadAndSetCoreConfig'
import { loadAndSetCoreModules } from './common/loadAndSetCoreModules'
import { loadAndSetEnvironments } from './common/loadAndSetEnvironments'
import { loadAndSetProjectConfig } from './common/loadAndSetProjectConfig'
import { releaseCoreModules } from './common/releaseCoreModules'
import { releaseLoggerAndPresenter } from './common/releaseLoggerAndPresenter'
import { setCoreGlobal } from './common/setCoreGlobal'
import { LOG_CONFIGURATION } from './common/terminal-presenter/LOG_CONFIGURATION'
import { RunConsoleOptions } from './runConsole.types'

export async function runConsole(options: RunConsoleOptions = {}): Promise<void> {
  const { coreConfigOverride, exitType }: RunConsoleOptions = options
  const throwError: boolean = exitType === 'throw'

  setCoreGlobal()
  await initCoreLogger()

  // Common functions return true if something went wrong and we should exit
  if (await loadAndSetCoreConfig(coreConfigOverride, throwError)) return process.exit(1)

  if (await loadAndSetProjectConfig(throwError)) return process.exit(1)
  if (await loadAndSetEnvironments('console', 'console', throwError)) return process.exit(1)

  // Avoid terminating without unlading properly
  process.addListener('SIGINT', (): void => {})
  process.addListener('SIGTERM', (): void => {})

  if (await emitEnvironmentEvent('beforeModulesLoad', throwError)) return process.exit(1)
  if (await loadAndSetCoreModules('console', 'console', throwError)) return process.exit(1)
  if (await emitEnvironmentEvent('afterModulesLoad', throwError)) return process.exit(1)

  try {
    await core.logger.waitForLoggingActivity()

    // Common functions return true if something went wrong and we should exit
    if (await emitEnvironmentEvent('beforeConsoleRuns', throwError)) return process.exit(1)

    await core.logger.waitForLoggingActivity()

    // We just start a repl server it even has its own termination CTRL+C
    const replServer = repl.start({ prompt: 'core > ' })
    replServer.setupHistory('./.console_history', (error: Error): void => {
      if (error) throw error
    })

    // Common functions return true if something went wrong and we should exit
    if (await emitEnvironmentEvent('afterConsoleRuns', throwError)) return process.exit(1)

    // We emit this so the Core knows the user basically sent those signals
    replServer.on('exit', async (): Promise<void> => {
      // Common functions return true if something went wrong and we should exit
      if (await emitEnvironmentEvent('afterConsoleStops', throwError)) return process.exit(1)

      if (await emitEnvironmentEvent('beforeModulesRelease', throwError)) return process.exit(1)
      if (await releaseCoreModules(throwError)) return process.exit(1)
      if (await emitEnvironmentEvent('afterModulesRelease', throwError)) return process.exit(1)
    })
  } catch (error) {
    core.logger.log(
      {
        level: 'ERROR',
        title: 'There was an error while running the console',
        category: 'CORE',
        error
      },
      LOG_CONFIGURATION
    )

    try {
      await Core.releaseInternalModules(core.coreModules)
    } catch (err) {
      // We prioritize higher error
    }

    await releaseLoggerAndPresenter()
    return process.exit(1)
  }
}
