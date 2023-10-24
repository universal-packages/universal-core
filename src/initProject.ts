import { Logger } from '@universal-packages/logger'
import { populateTemplates } from '@universal-packages/template-populator'
import { exec } from 'child_process'
import path from 'path'

export async function initProject(name: string, args: Record<string, any>): Promise<void> {
  const logger = new Logger({ silence: process.env.NODE_ENV === 'test' })

  let coreVersion = '1.0.0'

  try {
    coreVersion = (await import(path.resolve(__dirname, 'package.json'))).version
  } catch (_) {
    coreVersion = (await import(path.resolve(__dirname, '..', 'package.json'))).version
  }

  logger.publish('INFO', 'initializing project', `./${name}`)

  if (args.ts) {
    await populateTemplates(path.resolve(__dirname, 'template-ts'), `./${name}`, { replacementVariables: { projectName: name, coreVersion } })
  } else {
    await populateTemplates(path.resolve(__dirname, 'template'), `./${name}`, { replacementVariables: { projectName: name, coreVersion } })
  }

  logger.publish('INFO', 'Finishing')

  await installPackages(name)
  await initGit(name)

  logger.publish('INFO', 'New project created', `Navigate to:\n  cd ${name}`)
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
