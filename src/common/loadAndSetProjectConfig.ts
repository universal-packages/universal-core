import { startMeasurement } from '@universal-packages/time-measurer'

import Core from '../Core'

export async function loadAndSetProjectConfig(): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    core.projectConfig = await Core.getProjectConfig(core.coreConfig)

    core.logger.publish('DEBUG', 'Project config loaded', null, 'CORE', { metadata: core.projectConfig, measurement: measurer.finish().toString() })
  } catch (error) {
    core.logger.publish('ERROR', 'There was an error loading the project config', null, 'CORE', {
      error: error,
      measurement: measurer.finish().toString()
    })

    await core.logger.await()
    return true
  }

  return false
}
