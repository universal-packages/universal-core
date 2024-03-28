import { startMeasurement } from '@universal-packages/time-measurer'
import { paramCase, pascalCase } from 'change-case'

import CoreApp from '../CoreApp'
import { LOG_CONFIGURATION } from './terminal-presenter/LOG_CONFIGURATION'
import { releaseLogger } from './releaseLogger'

export async function loadAndSetCoreApp(name: string, args: Record<string, any>, throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    const pascalCaseName = pascalCase(name)
    const paramCaseName = paramCase(name)

    core.App = await CoreApp.find(name, core.coreConfig)
    core.appConfig = core.projectConfig[pascalCaseName] || core.projectConfig[paramCaseName] || core.projectConfig[core.App.appName]
    core.appInstance = new core.App({ ...core.App.defaultConfig, ...core.appConfig }, args, core.logger)
  } catch (error) {
    core.logger.log(
      {
        level: 'ERROR',
        title: 'There was an error loading the app',
        category: 'CORE',
        error,
        measurement: measurer.finish()
      },
      LOG_CONFIGURATION
    )

    await releaseLogger()

    if (throwError) throw error
    return true
  }

  return false
}
