import { sleep } from '@universal-packages/time-measurer'

import { CoreConfig } from './Core.types'
import { emitEnvironmentEvent } from './common/emitEnvironmentEvent'
import { loadAndSetCoreConfig } from './common/loadAndSetCoreConfig'
import { loadAndSetCoreModules } from './common/loadAndSetCoreModules'
import { loadAndSetEnvironments } from './common/loadAndSetEnvironments'
import { loadAndSetProjectConfig } from './common/loadAndSetProjectConfig'
import { releaseCoreModules } from './common/releaseCoreModules'
import { setCoreGlobal } from './common/setCoreGlobal'
import { UnloadFunction } from './runBare.types'

export async function runBare(coreConfigOverride?: CoreConfig): Promise<UnloadFunction> {
  setCoreGlobal()

  // Common functions return true if something went wrong and we should exit
  if (await loadAndSetCoreConfig(coreConfigOverride)) return process.exit(1)

  // Common functions return true if something went wrong and we should exit
  if (await loadAndSetProjectConfig()) return process.exit(1)
  if (await loadAndSetEnvironments('bare', 'bare')) return process.exit(1)

  const unload = async (): Promise<void> => {
    // To truly unload gracefully we need to wait to a total load
    while (!core.stoppable) await sleep(100)

    core.stopping = true

    // Common functions return true if something went wrong and we should exit
    if (await emitEnvironmentEvent('beforeModulesRelease')) return process.exit(1)
    if (await releaseCoreModules()) return process.exit(1)
    if (await emitEnvironmentEvent('afterModulesRelease')) return process.exit(1)
  }

  // Common functions return true if something went wrong and we should exit
  if (await emitEnvironmentEvent('beforeModulesLoad')) return process.exit(1)
  if (await loadAndSetCoreModules('bare', 'bare')) return process.exit(1)
  if (await emitEnvironmentEvent('afterModulesLoad')) return process.exit(1)

  core.stoppable = true

  return unload
}
