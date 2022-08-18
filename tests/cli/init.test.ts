import { initProyect } from '../../src/initProject'

jest.mock('../../src/initProject')

describe('cli', (): void => {
  it('inits a project', async (): Promise<void> => {
    process.argv = ['node', 'ucore', 'init', 'core-name', '--ts']
    await import('../../src/cli')

    expect(initProyect).toHaveBeenCalledWith('core-name', { ts: true, typescript: true })
  })
})
