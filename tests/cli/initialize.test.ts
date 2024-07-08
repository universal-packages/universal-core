import { runInitializer } from '../../src/runInitializer'

jest.mock('../../src/runInitializer')

describe('cli', (): void => {
  it('inits a project', async (): Promise<void> => {
    process.argv = ['node', 'ucore', 'initialize', 'my-library', '--ts', '--src', './example']
    await import('../../src/cli')

    expect(runInitializer).toHaveBeenCalledWith('my-library', { args: { ts: true, typescript: true, src: './example', source: './example' } })
  })
})
