import { runApp } from '../../src/runApp'

jest.mock('../../src/runApp')

describe('cli', (): void => {
  it('runs an app', async (): Promise<void> => {
    process.argv = ['node', 'ucore', 'run', 'web-server', '-p', '3000']
    await import('../../src/cli')

    expect(runApp).toHaveBeenCalledWith('web-server', { p: 3000 })
  })
})
