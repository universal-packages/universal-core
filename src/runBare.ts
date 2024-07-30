import { sleep } from '@universal-packages/time-measurer'

import { emitEnvironmentEvent } from './common/emitEnvironmentEvent'
import { initCoreLogger } from './common/initCoreLogger'
import { loadAndSetCoreConfig } from './common/loadAndSetCoreConfig'
import { loadAndSetCoreModules } from './common/loadAndSetCoreModules'
import { loadAndSetEnvironments } from './common/loadAndSetEnvironments'
import { loadAndSetProjectConfig } from './common/loadAndSetProjectConfig'
import { releaseCoreModules } from './common/releaseCoreModules'
import { setCoreGlobal } from './common/setCoreGlobal'
import { RunBareOptions, UnloadFunction } from './runBare.types'

export async function runBare(options: RunBareOptions = {}): Promise<UnloadFunction> {
  const { coreConfigOverride, exitType } = options
  const throwError = exitType === 'throw'

  setCoreGlobal()
  await initCoreLogger()

  // Common functions return true if something went wrong and we should exit
  if (await loadAndSetCoreConfig(coreConfigOverride, throwError)) return process.exit(1)

  // Common functions return true if something went wrong and we should exit
  if (await loadAndSetProjectConfig(throwError)) return process.exit(1)
  if (await loadAndSetEnvironments('bare', 'bare', true, throwError)) return process.exit(1)

  const unload = async (): Promise<void> => {
    // To truly unload gracefully we need to wait to a total load
    while (!core.stoppable) await sleep(100)

    core.stopping = true

    // Common functions return true if something went wrong and we should exit
    if (await emitEnvironmentEvent('beforeModulesRelease', throwError)) return process.exit(1)
    if (await releaseCoreModules(throwError)) return process.exit(1)
    if (await emitEnvironmentEvent('afterModulesRelease', throwError)) return process.exit(1)
  }

  // Common functions return true if something went wrong and we should exit
  if (await emitEnvironmentEvent('beforeModulesLoad', throwError)) return process.exit(1)
  if (await loadAndSetCoreModules('bare', 'bare', true, throwError)) return process.exit(1)
  if (await emitEnvironmentEvent('afterModulesLoad', throwError)) return process.exit(1)

  core.stoppable = true

  return unload
}
