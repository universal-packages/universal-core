import { startMeasurement } from '@universal-packages/time-measurer'

import Core from '../Core'

export async function abortCoreTaskInstance(throwError?: boolean): Promise<boolean> {
  const measurer = startMeasurement()

  if (core.taskInstance.abort) {
    try {
      await core.taskInstance.abort()
      core.logger.publish('DEBUG', 'Task aborted', null, 'CORE', { measurement: measurer.finish().toString() })
    } catch (error) {
      core.logger.publish('ERROR', core.Task.taskName || core.Task.name, 'There was an error while aborting task', 'CORE', { error })

      try {
        await Core.releaseInternalModules(core.coreModules)
      } catch (err) {
        // We prioritize higher error
      }

      await core.logger.await

      if (throwError) throw error
      return true
    }
  }

  return false
}
