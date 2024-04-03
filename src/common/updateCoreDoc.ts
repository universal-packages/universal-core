import { BlueColor, Color, GrayColor, OrangeColor, WhiteColor } from '@universal-packages/terminal-document'
import { LoadingBlock, PresenterRowDescriptor, ProgressBar, ProgressBarController, TimeWatch } from '@universal-packages/terminal-presenter'
import os from 'os'

import { CpuUsageBlock } from './terminal-presenter/components/CpuUsageBlock'
import { EnvironmentTagBlock } from './terminal-presenter/components/EnvironmentTagBlock'
import { ProcessMemoryUsageBlock } from './terminal-presenter/components/ProcessMemoryUsageBlock'

const TIME_WATCH_COMPONENT = TimeWatch()

const PROCESSES_COLORS: Record<string, { primary: Color; secondary: Color }> = {
  app: { primary: BlueColor.DodgerBlue, secondary: WhiteColor.White },
  task: { primary: OrangeColor.OrangeRed, secondary: WhiteColor.White }
}

const TASK_PROGRESS_COMPONENT: ProgressBarController = ProgressBar({ color: 'light-slate-gray' })
let PROGRESS_WAS_UPDATED = false

export function updateCoreDoc() {
  const primaryColor = core.App ? PROCESSES_COLORS.app.primary : core.Task ? PROCESSES_COLORS.task.primary : GrayColor.Gray
  const documentRows: PresenterRowDescriptor[] = []

  const headerRow: PresenterRowDescriptor = {
    border: [true, false, false, false],
    borderStyle: 'double',
    borderColor: primaryColor,
    blocks: []
  }

  if (core.App) {
    headerRow.blocks.push(LoadingBlock({ style: 'star' }))
    headerRow.blocks.push({ text: ' ', width: 'fit' })

    headerRow.blocks.push({
      backgroundColor: primaryColor,
      color: PROCESSES_COLORS.app.secondary,
      style: 'bold',
      text: ' APP ',
      width: 'fit'
    })
    headerRow.blocks.push({ text: ' ', width: 'fit' })
    headerRow.blocks.push({
      color: primaryColor,
      style: 'bold',
      text: core.App.appName || core.App.name,
      width: 'fit'
    })
    headerRow.blocks.push({ text: ' ', width: 'fit' })
  }

  if (core.Task) {
    headerRow.blocks.push(LoadingBlock())
    headerRow.blocks.push({ text: ' ', width: 'fit' })

    headerRow.blocks.push({
      backgroundColor: primaryColor,
      color: PROCESSES_COLORS.app.secondary,
      style: 'bold',
      text: ' TASK ',
      width: 'fit'
    })
    headerRow.blocks.push({ text: ' ', width: 'fit' })
    headerRow.blocks.push({
      color: primaryColor,
      style: 'bold',
      text: core.Task.taskName || core.Task.name,
      width: 'fit'
    })
    headerRow.blocks.push({ text: ' ', width: 'fit' })
  }

  headerRow.blocks.push({ text: ' ' })

  headerRow.blocks.push({ backgroundColor: 'black', style: 'bold', text: ' CORE ', width: 'fit' })
  headerRow.blocks.push({ text: ' ', width: 'fit' })
  headerRow.blocks.push(EnvironmentTagBlock())
  headerRow.blocks.push({ text: ' ', width: 'fit' })
  headerRow.blocks.push(TIME_WATCH_COMPONENT)

  documentRows.push(headerRow)

  // MIDDLE ROW ===============================================================
  documentRows.push({ blocks: [{ text: ' ' }] })

  const middleRow: PresenterRowDescriptor = { blocks: [] }

  if (core.Task && PROGRESS_WAS_UPDATED) {
    middleRow.blocks.push(TASK_PROGRESS_COMPONENT)

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

  core.TerminalPresenter.updateDocument('CORE-DOC', { rows: documentRows })
}

export function updateCoreDocTaskProgress(progress: number) {
  if (!PROGRESS_WAS_UPDATED) {
    PROGRESS_WAS_UPDATED = true
    updateCoreDoc()
  }

  TASK_PROGRESS_COMPONENT.setProgress(progress)
}
