import { EnvironmentTagBlock } from '@universal-packages/logger-terminal-presenter'
import { BlueColor, Color, GrayColor, GreenColor, OrangeColor, WhiteColor } from '@universal-packages/terminal-document'
import { LoadingBlock, PresenterRowDescriptor, ProgressBarBlock, ProgressBarController, TimeWatchBlock } from '@universal-packages/terminal-presenter'
import os from 'os'

import { CpuUsageBlock } from './terminal-presenter/components/CpuUsageBlock'
import { ProcessMemoryUsageBlock } from './terminal-presenter/components/ProcessMemoryUsageBlock'

const TIME_WATCH_COMPONENT = TimeWatchBlock()

const PROCESSES_COLORS: Record<string, { primary: Color; secondary: Color }> = {
  app: { primary: BlueColor.DodgerBlue, secondary: WhiteColor.White },
  task: { primary: OrangeColor.OrangeRed, secondary: WhiteColor.White },
  initializer: { primary: GreenColor.DarkGreen, secondary: WhiteColor.White }
}

const PROGRESS_COMPONENT: ProgressBarController = ProgressBarBlock({ color: 'light-slate-gray' })
let PROGRESS_WAS_UPDATED = false

let SCRIPT_OUTPUT = null

export function updateCoreDoc() {
  if (!core.terminalPresenter.OPTIONS.enabled) return

  const appPrimaryColor = core.App ? PROCESSES_COLORS.app.primary : null
  const taskPrimaryColor = core.Task ? PROCESSES_COLORS.task.primary : null
  const initializerPrimaryColor = core.Initializer ? PROCESSES_COLORS.initializer.primary : null
  const primaryColor = appPrimaryColor || taskPrimaryColor || initializerPrimaryColor || GrayColor.Gray

  const appSecondaryColor = core.App ? PROCESSES_COLORS.app.secondary : null
  const taskSecondaryColor = core.Task ? PROCESSES_COLORS.task.secondary : null
  const initializerSecondaryColor = core.Initializer ? PROCESSES_COLORS.initializer.secondary : null
  const secondaryColor = appSecondaryColor || taskSecondaryColor || initializerSecondaryColor || WhiteColor.White

  const appProcessName = core.App ? ' APP ' : ''
  const taskProcessName = core.Task ? ' TASK ' : ''
  const initializerProcessName = core.Initializer ? ' INITIALIZER ' : ''
  const processName = appProcessName || taskProcessName || initializerProcessName || ' CORE '

  const appSubjectName = core.App ? core.App.appName || core.App.name : ''
  const taskSubjectName = core.Task ? core.Task.taskName || core.Task.name : ''
  const initializerSubjectName = core.Initializer ? core.Initializer.initializerName || core.Initializer.name : ''
  const subjectName = appSubjectName || taskSubjectName || initializerSubjectName || 'New Project'

  const documentRows: PresenterRowDescriptor[] = []

  const headerRow: PresenterRowDescriptor = {
    border: [true, false, false, false],
    borderStyle: 'double',
    borderColor: primaryColor,
    blocks: []
  }

  if (core.App) {
    headerRow.blocks.push(LoadingBlock({ style: 'star' }))
  } else {
    headerRow.blocks.push(LoadingBlock())
  }

  headerRow.blocks.push({ text: ' ', width: 'fit' })
  headerRow.blocks.push({
    backgroundColor: primaryColor,
    color: secondaryColor,
    style: 'bold',
    text: processName,
    width: 'fit'
  })
  headerRow.blocks.push({ text: ' ', width: 'fit' })
  headerRow.blocks.push({
    color: primaryColor,
    style: 'bold',
    text: subjectName,
    width: 'fit'
  })
  headerRow.blocks.push({ text: ' ', width: 'fit' })

  headerRow.blocks.push({ text: ' ' })

  headerRow.blocks.push({ backgroundColor: 'black', style: 'bold', text: ' CORE ', width: 'fit' })
  headerRow.blocks.push({ text: ' ', width: 'fit' })
  headerRow.blocks.push(EnvironmentTagBlock())
  headerRow.blocks.push({ text: ' ', width: 'fit' })
  headerRow.blocks.push(TIME_WATCH_COMPONENT)

  documentRows.push(headerRow)

  // SCRIPT OUTPUT ROW ===============================================================

  if (SCRIPT_OUTPUT) {
    const scriptOutputRow: PresenterRowDescriptor = { blocks: [] }
    scriptOutputRow.blocks.push({ free: true, text: SCRIPT_OUTPUT })
    documentRows.push(scriptOutputRow)
  }

  // MIDDLE ROW ===============================================================
  documentRows.push({ blocks: [{ text: ' ' }] })

  const middleRow: PresenterRowDescriptor = { blocks: [] }

  if (PROGRESS_WAS_UPDATED) {
    middleRow.blocks.push(PROGRESS_COMPONENT)

    documentRows.push(middleRow)
  }

  // STATS ===============================================================

  const statsRow: PresenterRowDescriptor = {
    border: [true, false, true, false],
    borderStyle: ['dash-4', 'double', 'double', 'double'],
    borderColor: primaryColor,
    blocks: []
  }

  statsRow.blocks.push({
    border: [false, true, false, false],
    borderStyle: ['dash-4', 'dash-4', 'double', 'dash-4'],
    borderColor: primaryColor,
    text: ` PID ${process.pid} `,
    width: 'fit'
  })

  const userInfo = os.userInfo()

  statsRow.blocks.push({
    border: [false, true, false, false],
    borderStyle: ['dash-4', 'dash-4', 'double', 'dash-4'],
    borderColor: primaryColor,
    text: ` ${userInfo.username} `,
    width: 'fit'
  })

  const cpu = os.cpus()

  statsRow.blocks.push({
    border: [false, true, false, false],
    borderStyle: ['dash-4', 'dash-4', 'double', 'dash-4'],
    borderColor: primaryColor,
    text: ` ${cpu[0].model} ${cpu.length} Cores `,
    width: 'fit'
  })

  statsRow.blocks.push({ text: ' ' })

  statsRow.blocks.push(CpuUsageBlock())
  statsRow.blocks.push({ text: ' ', width: 'fit' })

  statsRow.blocks.push(ProcessMemoryUsageBlock())

  documentRows.push(statsRow)

  core.terminalPresenter.updateRealTimeDocument('CORE-DOC', { rows: documentRows })
}

export function setCoreDocProgressPercentage(progress: number) {
  if (!core.terminalPresenter.OPTIONS.enabled) return

  if (!PROGRESS_WAS_UPDATED) {
    PROGRESS_WAS_UPDATED = true
    updateCoreDoc()
  }

  PROGRESS_COMPONENT.setProgress(progress)
}

export function setCoreDocScriptOutput(output: string) {
  if (SCRIPT_OUTPUT === output) return
  SCRIPT_OUTPUT = output
  updateCoreDoc()
}
