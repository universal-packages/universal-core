import { execTask } from '../../src/execTask'

jest.mock('../../src/execTask')

describe('cli', (): void => {
  it('execs a task', async (): Promise<void> => {
    process.argv = ['node', 'uca', 'exec', 'migrate', 'users', 'all', '--fast']
    await import('../../src/cli')

    expect(execTask).toHaveBeenCalledWith('migrate', 'users', ['all'], { fast: true })
  })
})
