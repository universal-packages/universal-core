import { startMeasurement } from '@universal-packages/time-measurer'

import CoreTask from '../CoreTask'

export async function loadAndSetCoreTask(name: string, directive: string, directiveOptions: string[], args: Record<string, any>): Promise<boolean> {
  const measurer = startMeasurement()

  try {
    core.Task = await CoreTask.find(name, core.coreConfig)
    core.taskInstance = new core.Task(directive, directiveOptions, args, core.logger)
  } catch (error) {
    core.logger.publish('ERROR', 'There was an error loading the task', null, 'CORE', {
      error: error,
      measurement: measurer.finish().toString()
    })

    try {
      await CoreTask.releaseInternalModules(core.coreModules)
    } catch (err) {
      // We prioritize higher error
    }

    await core.logger.await()
    return true
  }

  return false
}
