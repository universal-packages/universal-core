import { sleep } from '@universal-packages/time-measurer'

import { abortCoreTaskInstance } from './common/abortCoreTaskInstance'
import { adjustCoreLogger } from './common/adjustCoreLogger'
import { emitEnvironmentEvent } from './common/emitEnvironmentEvent'
import { execCoreTaskInstance } from './common/execCoreTaskInstance'
import { initCoreLogger } from './common/initCoreLogger'
import { loadAndSetCoreConfig } from './common/loadAndSetCoreConfig'
import { loadAndSetCoreModules } from './common/loadAndSetCoreModules'
import { loadAndSetCoreTask } from './common/loadAndSetCoreTask'
import { loadAndSetEnvironments } from './common/loadAndSetEnvironments'
import { loadAndSetProjectConfig } from './common/loadAndSetProjectConfig'
import { releaseCoreModules } from './common/releaseCoreModules'
import { setCoreGlobal } from './common/setCoreGlobal'
import { ExecTaskOptions } from './execTask.types'

export async function execTask(name: string, options: ExecTaskOptions = {}): Promise<void> {
  const { args = {}, coreConfigOverride, directive = '', directiveOptions = [], exitType }: ExecTaskOptions = options
  const throwError = exitType === 'throw'

  setCoreGlobal()
  initCoreLogger()

  // Common functions return true if something went wrong and we should exit
  if (await loadAndSetCoreConfig(coreConfigOverride, throwError)) return process.exit(1)

  if (await loadAndSetProjectConfig(throwError)) return process.exit(1)
  if (await loadAndSetCoreTask(name, directive, directiveOptions, args, throwError)) return process.exit(1)
  if (await loadAndSetEnvironments('tasks', core.Task.taskName || core.Task.name, throwError)) return process.exit(1)

  const abortTask = async (): Promise<void> => {
    if (process.stdout.clearLine) process.stdout.clearLine(0)
    if (process.stdout.cursorTo) process.stdout.cursorTo(0)

    if (core.stopping) return process.exit(0)
    core.stopping = true

    core.logger.publish('INFO', 'Aborting task gracefully', 'press CTRL+C again to kill', 'CORE')

    while (!core.stoppable) await sleep(100)

    // Common functions return true if something went wrong and we should exit
    if (await emitEnvironmentEvent('beforeTaskAborts', throwError)) return process.exit(1)
    if (await abortCoreTaskInstance(throwError)) return process.exit(1)
    if (await emitEnvironmentEvent('afterTaskAborts', throwError)) return process.exit(1)
  }

  process.addListener('SIGINT', abortTask)
  process.addListener('SIGTERM', abortTask)

  // Common functions return true if something went wrong and we should exit
  if (await emitEnvironmentEvent('beforeModulesLoad', throwError)) return process.exit(1)
  if (await loadAndSetCoreModules('tasks', core.Task.taskName || core.Task.name, throwError)) return process.exit(1)
  if (await emitEnvironmentEvent('afterModulesLoad', throwError)) return process.exit(1)

  core.stoppable = true

  if (await emitEnvironmentEvent('beforeTaskExec', throwError)) return process.exit(1)
  if (await execCoreTaskInstance(throwError)) return process.exit(1)
  if (await emitEnvironmentEvent('afterTaskExec', throwError)) return process.exit(1)

  if (await emitEnvironmentEvent('beforeModulesRelease', throwError)) return process.exit(1)
  if (await releaseCoreModules(throwError)) return process.exit(1)
  if (await emitEnvironmentEvent('afterModulesRelease', throwError)) return process.exit(1)
}
