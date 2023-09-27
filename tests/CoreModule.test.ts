import { CoreModule } from '../src'

describe(CoreModule, (): void => {
  it('requires configuration and logger to be set', async (): Promise<void> => {
    const module = new CoreModule({}, {} as any)

    expect(module).toMatchObject({ config: {}, logger: {} })
  })

  describe('#prepare', (): void => {
    it('throws if not implemented', async (): Promise<void> => {
      const module = new CoreModule({}, {} as any)

      expect((): unknown => module.prepare()).toThrow('Implement me: Modules should implement the prepare method')
    })
  })

  describe('#release', (): void => {
    it('throws if not implemented', async (): Promise<void> => {
      const module = new CoreModule({}, {} as any)

      expect((): unknown => module.release()).toThrow('Implement me: Modules should implement the release method')
    })
  })
})
