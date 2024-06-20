import { Logger } from '@universal-packages/logger'
import { populateTemplates } from '@universal-packages/template-populator'
import { exec } from 'child_process'
import path from 'path'

import { initCoreLogger } from './common/initCoreLogger'
import { releaseLoggerAndPresenter } from './common/releaseLoggerAndPresenter'
import { setCoreGlobal } from './common/setCoreGlobal'
import { LOG_CONFIGURATION } from './common/terminal-presenter/LOG_CONFIGURATION'

export async function initProject(name: string, args: Record<string, any>): Promise<void> {
  setCoreGlobal()
  await initCoreLogger()

  let coreVersion = '1.0.0'

  try {
    coreVersion = (await import(path.resolve(__dirname, 'package.json'))).version
  } catch (_) {
    coreVersion = (await import(path.resolve(__dirname, '..', 'package.json'))).version
  }

  core.logger.log(
    {
      level: 'INFO',
      title: 'Initializing project',
      message: `./${name}`,
      category: 'CORE'
    },
    LOG_CONFIGURATION
  )

  if (args.ts) {
    await populateTemplates(path.resolve(__dirname, 'template-ts'), `./${name}`, { replacementVariables: { projectName: name, coreVersion } })
  } else {
    await populateTemplates(path.resolve(__dirname, 'template'), `./${name}`, { replacementVariables: { projectName: name, coreVersion } })
  }

  core.logger.log(
    {
      level: 'INFO',
      title: 'Finishing'
    },
    LOG_CONFIGURATION
  )

  await installPackages(name)
  await initGit(name)

  core.logger.log(
    {
      level: 'INFO',
      title: 'New project created',
      message: `Navigate to:\n  cd ${name}`,
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
