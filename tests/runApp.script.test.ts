import { runApp } from '../src/runApp'

jest.mock('../src/runApp')

describe('runApp.script', (): void => {
  it('do all the preparations funds an app and runs it (sets core)', async (): Promise<void> => {
    const appName = 'super-app'
    const args = { fast: true }
    const demon = true

    process.env['CORE_APP_NAME'] = appName
    process.env['CORE_APP_ARGS'] = JSON.stringify(args)
    process.env['CORE_FORK'] = 'true'

    require('../src/runApp.script')

    expect(runApp).toHaveBeenCalledWith(appName, { args, demon })
  })
})
