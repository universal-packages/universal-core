import { sleep } from '@universal-packages/time-measurer'
import { execTask } from '../../src/execTask'

jest.mock('../../src/execTask')

describe('cli', (): void => {
  it('execs a task', async (): Promise<void> => {
    process.argv = ['node', 'uca', 'exec', 'migrate', 'users', 'all', '--fast']
    await import('../../src/cli')

    sleep(1000)

    expect(execTask).toHaveBeenCalledWith('migrate', 'users', ['all'], { fast: true })
  })
})
