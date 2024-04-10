import { LocalFileTransport, TestTransport } from '@universal-packages/logger'
import { TerminalPresenterTransport } from '@universal-packages/logger-terminal-presenter'

import { adjustCoreLogger } from '../../src/common/adjustCoreLogger'
import { initCoreLogger } from '../../src/common/initCoreLogger'
import { setCoreGlobal } from '../../src/common/setCoreGlobal'

describe('adjustLogger', (): void => {
  it('refines logger transports base on core config', async (): Promise<void> => {
    setCoreGlobal()
    initCoreLogger()

    expect(core.logger).toMatchObject({
      level: 'TRACE',
      silence: false,
      transports: [expect.any(TestTransport)]
    })

    core.coreConfig = { logger: { level: 'DEBUG', silence: true, transports: ['terminal-presenter'] } }

    await adjustCoreLogger()

    expect(core.logger).toMatchObject({
      level: 'DEBUG',
      silence: true,
      transports: [expect.any(TerminalPresenterTransport)]
    })
  })
})
