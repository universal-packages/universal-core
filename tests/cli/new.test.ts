import { createProject } from '../../src/createProject'

jest.mock('../../src/createProject')

describe('cli', (): void => {
  it('inits a project', async (): Promise<void> => {
    process.argv = ['node', 'ucore', 'new', 'core-name', '--ts']
    await import('../../src/cli')

    expect(createProject).toHaveBeenCalledWith('core-name', { ts: true, typescript: true })
  })
})
