import { adjustCoreLogger } from '../../src/common/adjustCoreLogger'
import { initCoreLogger } from '../../src/common/initCoreLogger'
import { setCoreGlobal } from '../../src/common/setCoreGlobal'

describe('adjustLogger', (): void => {
  it('refines logger transports base on core config', async (): Promise<void> => {
    setCoreGlobal()
    initCoreLogger()

    expect(core.logger).toMatchObject({
      level: 'ERROR',
      silence: true,
      transports: { terminal: { enabled: true, options: { clear: false, withHeader: false } }, localFile: { enabled: true, options: { asJson: false } } }
    })

    core.coreConfig = { logger: { level: 'DEBUG', silence: false, terminal: { enable: false, clear: false, withHeader: true }, localFile: { enable: false, asJson: true } } }

    adjustCoreLogger()

    expect(core.logger).toMatchObject({
      level: 'DEBUG',
      silence: false,
      transports: { terminal: { enabled: false, options: { clear: false, withHeader: true } }, localFile: { enabled: false, options: { asJson: true } } }
    })
  })
})
