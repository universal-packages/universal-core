import { runInitializer } from '../../src/runInitializer'

jest.mock('../../src/runInitializer')

describe('cli', (): void => {
  it('inits a project', async (): Promise<void> => {
    process.argv = ['node', 'ucore', 'new', 'core-name', '--ts']
    await import('../../src/cli')

    expect(runInitializer).toHaveBeenCalledWith('universal-core-project', { args: { projectName: 'core-name', ts: true, typescript: true } })
  })
})
