import { startMeasurement } from '@universal-packages/time-measurer'
import { camelCase, paramCase, pascalCase } from 'change-case'

import { releaseLoggerAndPresenter } from './releaseLoggerAndPresenter'
import { LOG_CONFIGURATION } from './terminal-presenter/LOG_CONFIGURATION'

export async function setCoreApp(name: string, args: Record<string, any>, throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    const camelCaseNameWithForcedApp = camelCase(name).replace(/Module$/, '') + 'App'
    const paramCaseNameWithForcedApp = paramCase(name).replace(/-module$/, '') + '-app'
    const pascalCaseNameWithForcedApp = pascalCase(name).replace(/Module$/, '') + 'App'

    core.appConfig =
      core.projectConfig[camelCaseNameWithForcedApp] ||
      core.projectConfig[paramCaseNameWithForcedApp] ||
      core.projectConfig[pascalCaseNameWithForcedApp] ||
      core.projectConfig[core.App.appName]
    core.appInstance = new core.App({ ...core.App.defaultConfig, ...core.appConfig }, args, core.logger)
  } catch (error) {
    core.logger.log(
      {
        level: 'ERROR',
        title: 'There was an error setting the app',
        category: 'CORE',
        error,
        measurement: measurer.finish()
      },
      LOG_CONFIGURATION
    )

    await releaseLoggerAndPresenter()

    if (throwError) throw error
    return true
  }

  return false
}
