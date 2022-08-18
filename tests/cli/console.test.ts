import { runConsole } from '../../src/runConsole'

jest.mock('../../src/runConsole')

describe('cli', (): void => {
  it('runs an app', async (): Promise<void> => {
    process.argv = ['node', 'ucore', 'console']
    await import('../../src/cli')

    expect(runConsole).toHaveBeenCalled()
  })
})
