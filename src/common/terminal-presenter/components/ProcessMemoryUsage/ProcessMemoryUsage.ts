import { BlockControllerConfiguration } from '@universal-packages/terminal-presenter'

import { ProcessMemoryUsageController } from './ProcessMemoryUsage.types'

let ID = 0

export function ProcessMemoryUsage(): ProcessMemoryUsageController {
  let lastCalculatedMemoryUsage = ''

  const id = `time-process-memory-usage-${ID++}`

  let configuration: BlockControllerConfiguration

  return {
    descriptor: { id, text: 'Mem 0 MB', style: 'bold', width: 'fit' },
    requestUpdate: () => {
      const memoryData = process.memoryUsage()
      const memoryUsage = formatMemoryUsage(memoryData.heapTotal)

      if (memoryUsage !== lastCalculatedMemoryUsage) {
        configuration.update(id, { text: memoryUsage })
        lastCalculatedMemoryUsage = memoryUsage
      }
    },
    configure: (config: BlockControllerConfiguration) => (configuration = config)
  }
}

function formatMemoryUsage(usage: number): string {
  const usageInMB = Math.round((usage / 1024 / 1024) * 100) / 100
  const usageInGB = Math.round((usageInMB / 1024) * 100) / 100

  if (usageInGB > 1) return ` Mem ${usageInGB} GB `

  return ` Mem ${Math.round((usage / 1024 / 1024) * 100) / 100} MB `
}
