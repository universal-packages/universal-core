import { sleep } from '@universal-packages/time-measurer'

import AppWatcher from './AppWatcher'
import { emitEnvironmentEvent } from './common/emitEnvironmentEvent'
import { initCoreLogger } from './common/initCoreLogger'
import { loadAndSetCoreApp } from './common/loadAndSetCoreApp'
import { loadAndSetCoreConfig } from './common/loadAndSetCoreConfig'
import { loadAndSetCoreModules } from './common/loadAndSetCoreModules'
import { loadAndSetEnvironments } from './common/loadAndSetEnvironments'
import { loadAndSetProjectConfig } from './common/loadAndSetProjectConfig'
import { prepareCoreAppInstance } from './common/prepareCoreAppInstance'
import { releaseCoreAppInstance } from './common/releaseCoreAppInstance'
import { releaseCoreModules } from './common/releaseCoreModules'
import { runCoreAppInstance } from './common/runCoreAppInstance'
import { setCoreGlobal } from './common/setCoreGlobal'
import { stopCoreAppInstance } from './common/stopCoreAppInstance'
import { debounce } from './debounce'
import { RunAppOptions, StopAppFunction } from './runApp.types'

export async function runApp(name: string, options: RunAppOptions = {}): Promise<StopAppFunction> {
  const { args = {}, demon = false, coreConfigOverride, exitType = 'process' } = options
  const throwError = exitType === 'throw'

  setCoreGlobal()
  initCoreLogger()

  // Common functions return true if something went wrong and we should exit
  if (await loadAndSetCoreConfig(coreConfigOverride, throwError)) return process.exit(1)

  if (!demon && core.coreConfig.apps.watcher?.enabled) {
    core.logger.publish('INFO', 'App Watcher enabled', 'App will be ran in a sub process', 'CORE')

    if (process.env['NODE_ENV'] !== 'development') {
      core.logger.publish('WARNING', 'Watch and reload is meant only for development', 'Consider deactivating it for not development environments', 'CORE')
    }

    const appWatcher = new AppWatcher(name, args, core.coreConfig.apps.watcher?.ignore)

    appWatcher.run()

    appWatcher.on('restart', (files: string[]): void => {
      core.logger.publish('QUERY', 'Reloading..', files.join('\n'), 'CORE')
    })

    const stopWatcher = async (): Promise<void> => {
      if (process.stdout.clearLine) process.stdout.clearLine(0)
      if (process.stdout.cursorTo) process.stdout.cursorTo(0)
      if (core.stopping) return appWatcher.kill()

      core.stopping = true
      appWatcher.stop()
    }

    // We debounce signals in case ucore is being executed through npm run
    // that for some reason is duplicating the signal.
    process.addListener('SIGINT', debounce(stopWatcher))
    process.addListener('SIGTERM', debounce(stopWatcher))

    return stopWatcher
  } else {
    // Common functions return true if something went wrong and we should exit
    if (await loadAndSetProjectConfig(throwError)) return process.exit(1)
    if (await loadAndSetCoreApp(name, args, throwError)) return process.exit(1)
    if (await loadAndSetEnvironments('apps', core.App.appName || core.App.name, throwError)) return process.exit(1)

    const stopApp = async (restarting: boolean = false): Promise<void> => {
      // We are already restating-stopping
      // we only exit the process at ctrl+c (SIGABRT)
      if (restarting && core.stopping) return

      if (process.stdout.clearLine) process.stdout.clearLine(0)
      if (process.stdout.cursorTo) process.stdout.cursorTo(0)

      if (core.stopping) return process.exit(0)

      if (!restarting) {
        core.logger.publish('INFO', 'Stopping app gracefully', 'press CTRL+C again to kill', 'CORE')
      }

      core.stopping = true

      // To truly stop the app gracefully we need to wait for it be running and the start releasing everything
      // Im just thinking about the children and DB connections and stuff like that will end dirty if we just exit the process
      // but who knows, I am going safe for now, if this is too much we can change later
      while (!core.stoppable) await sleep(100)

      // Common functions return true if something went wrong and we should exit
      if (await emitEnvironmentEvent('beforeAppStops', throwError)) return process.exit(1)
      if (await stopCoreAppInstance(throwError)) return process.exit(1)
      if (await emitEnvironmentEvent('afterAppStops', throwError)) return process.exit(1)

      if (await emitEnvironmentEvent('beforeAppRelease', throwError)) return process.exit(1)
      if (await releaseCoreAppInstance(throwError)) return process.exit(1)
      if (await emitEnvironmentEvent('afterAppRelease', throwError)) return process.exit(1)

      if (await emitEnvironmentEvent('beforeModulesRelease', throwError)) return process.exit(1)
      if (await releaseCoreModules(throwError)) return process.exit(1)
      if (await emitEnvironmentEvent('afterModulesRelease', throwError)) return process.exit(1)
    }

    if (demon) {
      process.addListener('SIGALRM', stopApp.bind(null, true))
      process.addListener('SIGABRT', stopApp.bind(null, false))
      process.addListener('SIGINT', () => {})
      process.addListener('SIGTERM', () => {})
    } else {
      // We debounce signals in case ucore is being executed through npm run
      // that for some reason is duplicating the signal.
      process.addListener('SIGINT', debounce(stopApp.bind(null, false)))
      process.addListener('SIGTERM', debounce(stopApp.bind(null, false)))
    }

    // Common functions return true if something went wrong and we should exit
    if (await emitEnvironmentEvent('beforeModulesLoad', throwError)) return process.exit(1)
    if (await loadAndSetCoreModules('apps', core.App.appName || core.App.name, throwError)) return process.exit(1)
    if (await emitEnvironmentEvent('afterModulesLoad', throwError)) return process.exit(1)

    if (await emitEnvironmentEvent('beforeAppPrepare', throwError)) return process.exit(1)
    if (await prepareCoreAppInstance(throwError)) return process.exit(1)
    if (await emitEnvironmentEvent('afterAppPrepare', throwError)) return process.exit(1)

    if (await emitEnvironmentEvent('beforeAppRuns', throwError)) return process.exit(1)
    if (await runCoreAppInstance(throwError)) return process.exit(1)
    if (await emitEnvironmentEvent('afterAppRuns', throwError)) return process.exit(1)

    core.stoppable = true

    return stopApp
  }
}
