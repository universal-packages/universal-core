import { sleep } from '@universal-packages/time-measurer'
import { runConsole } from '../../src/runConsole'

jest.mock('../../src/runConsole')

describe('cli', (): void => {
  it('runs an app', async (): Promise<void> => {
    process.argv = ['node', 'uca', 'console']
    await import('../../src/cli')

    sleep(1000)

    expect(runConsole).toHaveBeenCalled()
  })
})
