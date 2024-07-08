import { populateTemplates } from '@universal-packages/template-populator'
import { paramCase } from 'change-case'
import { exec } from 'child_process'
import path from 'path'

import { initCoreLogger } from './common/initCoreLogger'
import { releaseLoggerAndPresenter } from './common/releaseLoggerAndPresenter'
import { setCoreGlobal } from './common/setCoreGlobal'
import { startPresenting } from './common/startPresenting'
import { LOG_CONFIGURATION } from './common/terminal-presenter/LOG_CONFIGURATION'
import { updateCoreDocProgress } from './common/updateCoreDoc'

export async function createProject(name: string, args: Record<string, any>): Promise<void> {
  const paramCaseName = paramCase(name)

  setCoreGlobal()
  await initCoreLogger()

  startPresenting()

  let coreVersion = '1.0.0'

  try {
    coreVersion = (await import(path.resolve(__dirname, 'package.json'))).version
  } catch (_) {
    coreVersion = (await import(path.resolve(__dirname, '..', 'package.json'))).version
  }

  core.logger.log(
    {
      level: 'INFO',
      title: 'Initializing new core project',
      message: `./${paramCaseName}`,
      category: 'CORE'
    },
    LOG_CONFIGURATION
  )

  if (args.ts) {
    await populateTemplates(path.resolve(__dirname, 'template-ts'), `./${paramCaseName}`, { replacementVariables: { projectName: paramCaseName, coreVersion } })
  } else {
    await populateTemplates(path.resolve(__dirname, 'template'), `./${paramCaseName}`, { replacementVariables: { projectName: paramCaseName, coreVersion } })
  }

  let initProgress = 20

  updateCoreDocProgress(20)

  core.logger.log(
    {
      level: 'INFO',
      title: 'Finishing'
    },
    LOG_CONFIGURATION
  )

  let estimationProgressInterval = setInterval(() => {
    if (initProgress < 80) {
      updateCoreDocProgress(initProgress++)
    }
  }, 500)

  await installPackages(paramCaseName)

  clearInterval(estimationProgressInterval)
  updateCoreDocProgress(80)

  estimationProgressInterval = setInterval(() => {
    if (initProgress < 100) {
      updateCoreDocProgress(initProgress++)
    }
  }, 500)

  await initGit(paramCaseName)

  clearInterval(estimationProgressInterval)
  updateCoreDocProgress(100)

  core.logger.log(
    {
      level: 'INFO',
      title: 'New project created',
      message: `Navigate to:\n  cd ${paramCaseName}`,
      category: 'CORE'
    },
    LOG_CONFIGURATION
  )

  await releaseLoggerAndPresenter()
}

async function installPackages(name: string): Promise<void> {
  return new Promise((resolve): void => {
    exec(`cd ${name} && npm install`, (error: Error): void => {
      if (error) console.log(error)
      resolve()
    })
  })
}

async function initGit(name: string): Promise<void> {
  return new Promise((resolve): void => {
    exec(`cd ${name} && git init && git add . && git commit -m 'init core'`, (error: Error): void => {
      if (error) console.log(error)
      resolve()
    })
  })
}
