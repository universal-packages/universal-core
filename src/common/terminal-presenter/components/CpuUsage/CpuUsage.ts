import { BlockControllerConfiguration } from '@universal-packages/terminal-presenter'
import os from 'os'

import { CpuUsageController } from './CpuUsage.types'

let ID = 0

export function CpuUsage(): CpuUsageController {
  let lastTimeCalculated = Date.now()
  let startingAverage = getAverageCpuUsage()

  const id = `time-cpu-usage-${ID++}`

  let configuration: BlockControllerConfiguration

  return {
    descriptor: { id, text: ' CPU 0% ', style: 'bold', width: 'fit' },
    requestUpdate: () => {
      const newTimeToCalculate = Date.now()

      if (newTimeToCalculate - lastTimeCalculated > 1000) {
        const currentAverage = getAverageCpuUsage()
        const totalTime = currentAverage[0] - startingAverage[0]
        const idleTime = currentAverage[1] - startingAverage[1]
        const cpuPercentage = (10000 - Math.round((10000 * idleTime) / totalTime)) / 100
        const cpuUsage = ` CPU ${cpuPercentage}% `

        configuration.update(id, { text: cpuUsage })

        lastTimeCalculated = newTimeToCalculate
        startingAverage = currentAverage
      }
    },
    configure: (config: BlockControllerConfiguration) => (configuration = config)
  }
}

function getAverageCpuUsage(): [number, number] {
  const cpus = os.cpus()

  let totalTime = 0
  let idleTime = 0

  for (var i = 0; i < cpus.length; i++) {
    const currentCpu = cpus[i]

    totalTime += currentCpu.times.user
    totalTime += currentCpu.times.nice
    totalTime += currentCpu.times.sys
    totalTime += currentCpu.times.idle
    totalTime += currentCpu.times.irq

    idleTime += currentCpu.times.idle
  }

  return [totalTime / cpus.length, idleTime / cpus.length]
}
