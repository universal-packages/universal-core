import { startMeasurement } from '@universal-packages/time-measurer'

import Core from '../Core'

export async function execCoreTaskInstance(throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    core.logger.publish('INFO', `${core.Task.taskName || core.Task.name} executing...`, core.Task.description, 'CORE')
    await core.taskInstance.exec()
    core.logger.publish('DEBUG', `${core.Task.taskName || core.Task.name} executed`, core.Task.description, 'CORE', { measurement: measurer.finish().toString() })
  } catch (error) {
    core.logger.publish('ERROR', core.Task.taskName || core.Task.name, 'There was an error while executing task', 'CORE', { error, measurement: measurer.finish().toString() })

    try {
      await Core.releaseInternalModules(core.coreModules)
    } catch (err) {
      // We prioritize higher error
    }

    await core.logger.await

    if (throwError) throw error
    return true
  }

  return false
}
