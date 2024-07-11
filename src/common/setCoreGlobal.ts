import { EmittedEvent } from '@universal-packages/event-emitter'
import { SubProcess, SubProcessOptions } from '@universal-packages/sub-process'
import * as TP from '@universal-packages/terminal-presenter'
import stripAnsi from 'strip-ansi'

import { setCoreDocProgressPercentage, setCoreDocScriptOutput } from './updateCoreDoc'

export function setCoreGlobal(): void {
  let currentProgressPercentage: number = 0
  let progressIncreaseSimulationInterval: NodeJS.Timeout | null = null
  let targetProgressPercentage: number = 0

  global.core = {
    App: null,
    appConfig: null,
    appInstance: null,
    coreConfig: null,
    coreModules: null,
    developer: {
      bucket: {},
      terminalPresenter: {
        setProgressPercentage: (percentage: number) => {
          currentProgressPercentage = percentage
          setCoreDocProgressPercentage(currentProgressPercentage)
        },
        increaseProgressPercentageBy: (percentage: number) => {
          currentProgressPercentage += percentage
          setCoreDocProgressPercentage(currentProgressPercentage)
        },
        startProgressIncreaseSimulation: (amount: number, simulatedTime: number, refreshRate = 200) => {
          const progressIncreaseAmount = amount / (simulatedTime / refreshRate)
          targetProgressPercentage = currentProgressPercentage + amount

          progressIncreaseSimulationInterval = setInterval(() => {
            if (currentProgressPercentage < targetProgressPercentage) {
              currentProgressPercentage += progressIncreaseAmount
              setCoreDocProgressPercentage(currentProgressPercentage)
            } else {
              clearInterval(progressIncreaseSimulationInterval as NodeJS.Timeout)
              setCoreDocProgressPercentage(targetProgressPercentage)
            }
          }, refreshRate)
        },
        finishProgressIncreaseSimulation: () => {
          clearInterval(progressIncreaseSimulationInterval as NodeJS.Timeout)
          setCoreDocProgressPercentage(targetProgressPercentage)
        },
        setScriptOutput: (script: string) => {
          setCoreDocScriptOutput(script)
        },
        setSubProcess: (options: SubProcessOptions): SubProcess => {
          const subProcess = new SubProcess(options)

          subProcess.on('stdout', (event: EmittedEvent) => {
            if (event.payload.data) core.developer.terminalPresenter.setScriptOutput(stripAnsi(event.payload.data))
          })

          subProcess.on('stderr', (event: EmittedEvent) => {
            if (event.payload.data) core.developer.terminalPresenter.setScriptOutput(stripAnsi(event.payload.data))
          })

          // We don't care about stopped event (It throws if not listened to and we do not to use try/catch here)
          subProcess.on('stopped', () => {})

          return subProcess
        },
        runSubProcess: async (options: SubProcessOptions): Promise<SubProcess> => {
          const subProcess = core.developer.terminalPresenter.setSubProcess(options)

          await subProcess.run()

          return subProcess
        }
      }
    },
    environments: null,
    Initializer: null,
    initializerInstance: null,
    logger: null,
    projectConfig: null,
    stoppable: false,
    stopping: false,
    Task: null,
    taskInstance: null,
    terminalPresenter: {
      configure: TP.configure,
      appendRealTimeDocument: TP.appendRealTimeDocument,
      clearRealTimeDocuments: TP.clearRealTimeDocuments,
      clearScreen: TP.clearScreen,
      captureConsole: TP.captureConsole,
      prependRealTimeDocument: TP.prependRealTimeDocument,
      present: TP.present,
      printString: TP.printString,
      printDocument: TP.printDocument,
      releaseConsole: TP.releaseConsole,
      removeRealTimeDocument: TP.removeRealTimeDocument,
      restore: TP.restore,
      updateRealTimeDocument: TP.updateRealTimeDocument,
      OPTIONS: TP.OPTIONS
    }
  }

  Object.defineProperty(global, 'core', { value: global.core })
  Object.defineProperty(global.core, 'developer', { value: global.core.developer })
  Object.defineProperty(global.core.developer, 'bucket', { value: global.core.developer.bucket })
  Object.defineProperty(global.core.developer, 'terminalPresenter', { value: global.core.developer.terminalPresenter })
  Object.defineProperty(global.core, 'terminalPresenter', { value: global.core.terminalPresenter })
}
