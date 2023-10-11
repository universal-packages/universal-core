import { sleep } from '@universal-packages/time-measurer'

import { CoreConfig } from './Core.types'
import { abortCoreTaskInstance } from './common/abortCoreTaskInstance'
import { emitEnvironmentEvent } from './common/emitEnvironmentEvent'
import { execCoreTaskInstance } from './common/execCoreTaskInstance'
import { loadAndSetCoreConfig } from './common/loadAndSetCoreConfig'
import { loadAndSetCoreModules } from './common/loadAndSetCoreModules'
import { loadAndSetCoreTask } from './common/loadAndSetCoreTask'
import { loadAndSetEnvironments } from './common/loadAndSetEnvironments'
import { loadAndSetProjectConfig } from './common/loadAndSetProjectConfig'
import { releaseCoreModules } from './common/releaseCoreModules'
import { setCoreGlobal } from './common/setCoreGlobal'

export async function execTask(name: string, directive?: string, directiveOptions?: string[], args?: Record<string, any>, coreConfigOverride?: CoreConfig): Promise<void> {
  setCoreGlobal()

  // Common functions return true if something went wrong and we should exit
  if (await loadAndSetCoreConfig(coreConfigOverride)) return process.exit(1)
  if (await loadAndSetProjectConfig()) return process.exit(1)
  if (await loadAndSetCoreTask(name, directive, directiveOptions, args)) return process.exit(1)
  if (await loadAndSetEnvironments('tasks', core.Task.taskName || core.Task.name)) return process.exit(1)

  const abortTask = async (): Promise<void> => {
    if (process.stdout.clearLine) process.stdout.clearLine(0)
    if (process.stdout.cursorTo) process.stdout.cursorTo(0)

    if (core.stopping) return process.exit(0)
    core.stopping = true

    core.logger.publish('INFO', 'Aborting task gracefully', 'press CTRL+C again to kill', 'CORE')

    while (!core.stoppable) await sleep(100)

    // Common functions return true if something went wrong and we should exit
    if (await emitEnvironmentEvent('beforeTaskAborts')) return process.exit(1)
    if (await abortCoreTaskInstance()) return process.exit(1)
    if (await emitEnvironmentEvent('afterTaskAborts')) return process.exit(1)
  }

  process.addListener('SIGINT', abortTask)
  process.addListener('SIGTERM', abortTask)

  // Common functions return true if something went wrong and we should exit
  if (await emitEnvironmentEvent('beforeModulesLoad')) return process.exit(1)
  if (await loadAndSetCoreModules('tasks', core.Task.taskName || core.Task.name)) return process.exit(1)
  if (await emitEnvironmentEvent('afterModulesLoad')) return process.exit(1)

  core.stoppable = true

  if (await emitEnvironmentEvent('beforeTaskExec')) return process.exit(1)
  if (await execCoreTaskInstance()) return process.exit(1)
  if (await emitEnvironmentEvent('afterTaskExec')) return process.exit(1)

  if (await emitEnvironmentEvent('beforeModulesRelease')) return process.exit(1)
  if (await releaseCoreModules()) return process.exit(1)
  if (await emitEnvironmentEvent('afterModulesRelease')) return process.exit(1)
}
