import { sleep } from '@universal-packages/time-measurer'

import { abortCoreInitializerInstance } from './common/abortCoreInitializerInstance'
import { initCoreLogger } from './common/initCoreLogger'
import { loadAndSetCoreConfig } from './common/loadAndSetCoreConfig'
import { loadAndSetCoreInitializer } from './common/loadAndSetCoreInitializer'
import { loadAndSetProjectConfig } from './common/loadAndSetProjectConfig'
import { releaseLoggerAndPresenter } from './common/releaseLoggerAndPresenter'
import { runCoreInitializerInstance } from './common/runCoreInitializerInstance'
import { setCoreGlobal } from './common/setCoreGlobal'
import { startPresenting } from './common/startPresenting'
import { LOG_CONFIGURATION } from './common/terminal-presenter/LOG_CONFIGURATION'
import { RunInitializerOptions } from './runInitializer.types'

export async function runInitializer(name: string, options: RunInitializerOptions = {}): Promise<void> {
  const { args = {}, locationOverride, coreConfigOverride, exitType }: RunInitializerOptions = options
  const throwError = exitType === 'throw'

  setCoreGlobal()
  await initCoreLogger()

  // Common functions return true if something went wrong and we should exit
  if (await loadAndSetCoreConfig(coreConfigOverride, throwError)) return process.exit(1)

  if (await loadAndSetProjectConfig(throwError)) return process.exit(1)
  if (await loadAndSetCoreInitializer(name, args, locationOverride, throwError)) return process.exit(1)

  startPresenting()

  const abortInitialization = async (): Promise<void> => {
    if (process.stdout.clearLine) process.stdout.clearLine(0)
    if (process.stdout.cursorTo) process.stdout.cursorTo(0)

    if (core.stopping) return process.exit(0)
    core.stopping = true

    core.logger.log(
      {
        level: 'INFO',
        title: 'Aborting initialization gracefully',
        message: 'press CTRL+C again to kill',
        category: 'CORE'
      },
      LOG_CONFIGURATION
    )

    while (!core.stoppable) await sleep(100)

    // Common functions return true if something went wrong and we should exit
    if (await abortCoreInitializerInstance(throwError)) return process.exit(1)
  }

  process.addListener('SIGINT', abortInitialization)
  process.addListener('SIGTERM', abortInitialization)

  core.stoppable = true

  if (await runCoreInitializerInstance(throwError)) return process.exit(1)

  await releaseLoggerAndPresenter()
}
