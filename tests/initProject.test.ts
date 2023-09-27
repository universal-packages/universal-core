import { populateTemplates } from '@universal-packages/template-populator'
import { exec } from 'child_process'

import { initProject } from '../src/initProject'

jest.mock('@universal-packages/template-populator')
jest.mock('child_process')

beforeEach((): void => {
  const execMock = exec as unknown as jest.Mock
  execMock.mockImplementation((_: string, callback: Function): void => callback())

  jest.clearAllMocks()
})

describe(initProject, (): void => {
  it('transfer templates and prepares the app', async (): Promise<void> => {
    await initProject('app', {})

    expect(populateTemplates).toHaveBeenCalledWith(expect.stringMatching(/universal-core\/src\/template/), './app', {
      replacementVariables: { coreVersion: expect.stringMatching(/\d+.\d+.\d+/), projectName: 'app' }
    })
    expect(exec).toHaveBeenCalledWith('cd app && npm install', expect.any(Function))
    expect(exec).toHaveBeenCalledWith("cd app && git init && git add . && git commit -m 'init core'", expect.any(Function))
  })

  it('transfer typescript templates and prepares the app', async (): Promise<void> => {
    await initProject('app', { ts: true })

    expect(populateTemplates).toHaveBeenCalledWith(expect.stringMatching(/universal-core\/src\/template-ts/), './app', {
      replacementVariables: { coreVersion: expect.stringMatching(/\d+.\d+.\d+/), projectName: 'app' }
    })
    expect(exec).toHaveBeenCalledWith('cd app && npm install', expect.any(Function))
    expect(exec).toHaveBeenCalledWith("cd app && git init && git add . && git commit -m 'init core'", expect.any(Function))
  })
})
