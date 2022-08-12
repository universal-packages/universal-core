import { sleep } from '@universal-packages/time-measurer'
import { runApp } from '../../src/runApp'

jest.mock('../../src/runApp')

describe('cli', (): void => {
  it('runs an app', async (): Promise<void> => {
    process.argv = ['node', 'uca', 'run', 'web-server', '-p', '3000']
    await import('../../src/cli')

    sleep(1000)

    expect(runApp).toHaveBeenCalledWith('web-server', { p: 3000 })
  })
})
