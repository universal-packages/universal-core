import { startMeasurement } from '@universal-packages/time-measurer'
import { paramCase, pascalCase } from 'change-case'
import CoreApp from '../CoreApp'

export async function loadAndSetCoreApp(name: string, args: Record<string, any>): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    const pascalCaseName = pascalCase(name)
    const paramCaseName = paramCase(name)

    core.App = await CoreApp.find(name, core.coreConfig)
    core.appConfig = core.projectConfig[pascalCaseName] || core.projectConfig[paramCaseName] || core.projectConfig[core.App.appName]
    core.appInstance = new core.App({ ...core.App.defaultConfig, ...core.appConfig }, args, core.logger)
  } catch (error) {
    core.logger.publish('ERROR', 'There was an error loading the app', null, 'CORE', {
      error: error,
      measurement: measurer.finish().toString()
    })

    await core.logger.await()
    return true
  }

  return false
}
