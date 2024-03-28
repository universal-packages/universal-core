import { fork } from 'child_process'
import chokidar from 'chokidar'
import { EventEmitter } from 'stream'

import AppWatcher from '../src/AppWatcher'

jest.mock('chokidar')
jest.mock('child_process')
jest.useFakeTimers()
jest.spyOn(global, 'setTimeout')

beforeEach((): void => {
  jest.clearAllMocks()
})

describe(AppWatcher, (): void => {
  it('requires appName, args and optionally ignore files array, ', async (): Promise<void> => {
    const watcher = new AppWatcher('app', {}, [])

    expect(watcher).toMatchObject({ appName: 'app', args: {}, ignore: [] })
  })

  describe('.run', (): void => {
    it('starts a chokidar watcher', async (): Promise<void> => {
      const watcher = new AppWatcher('app', {}, ['somefile'])
      const watchMock = chokidar.watch as jest.Mock

      watchMock.mockImplementationOnce((): EventEmitter => new EventEmitter())

      watcher.run()

      expect(chokidar.watch).toHaveBeenCalledWith('.', {
        ignored: [
          'somefile',
          '**/node_modules/**/*',
          '**/.git/**/*',
          '**/coverage/**/*',
          '**/.tests/**/*',
          '**/test/**/*',
          '**/storage/**/*',
          '**/logs/**/*',
          '**/tmp/**/*',
          '.console_history',
          expect.any(Function)
        ]
      })
    })
  })

  describe('.watcher', (): void => {
    it('sets ready, forks a child process and emits once chokidar ready', async (): Promise<void> => {
      const watcher = new AppWatcher('app', {}, ['somefile'])
      const watchMock = chokidar.watch as jest.Mock
      const forkMock = fork as jest.Mock
      const readyMock = jest.fn()
      const chokidarEmitter = new EventEmitter()
      const forkEmitter = new EventEmitter()

      watchMock.mockImplementationOnce((): EventEmitter => chokidarEmitter)
      forkMock.mockImplementationOnce((): EventEmitter => forkEmitter)

      watcher.on('ready', readyMock)

      watcher.run()

      expect(readyMock).not.toHaveBeenCalled()
      expect(forkMock).not.toHaveBeenCalled()

      chokidarEmitter.emit('ready')

      expect(watcher).toMatchObject({ ready: true })
      expect(readyMock).toHaveBeenCalledTimes(1)
      expect(forkMock).toHaveBeenCalledTimes(1)
      expect(forkMock).toHaveBeenCalledWith(expect.stringMatching(/universal-core\/src\/runApp.script.ts/), {
        env: expect.objectContaining({ CORE_APP_NAME: 'app', CORE_APP_ARGS: '{}', CORE_FORK: 'true' }),
        stdio: ['ipc', 'inherit', 'inherit']
      })
    })

    describe('when restarting', (): void => {
      it('accumulates changes and only applies a restart if the timeout is called', async (): Promise<void> => {
        const watcher = new AppWatcher('app', {}, ['somefile'])
        const watchMock = chokidar.watch as jest.Mock
        const forkMock = fork as jest.Mock
        const restartMock = jest.fn()
        const chokidarEmitter = new EventEmitter()
        const forkEmitter = new EventEmitter()
        forkEmitter['kill'] = jest.fn()

        watchMock.mockImplementationOnce((): EventEmitter => chokidarEmitter)
        forkMock.mockImplementationOnce((): EventEmitter => forkEmitter)

        watcher.on('restart', restartMock)

        watcher.run()

        expect(restartMock).not.toHaveBeenCalled()
        expect(forkMock).not.toHaveBeenCalled()

        chokidarEmitter.emit('ready')

        expect(restartMock).not.toHaveBeenCalled()
        expect(forkMock).toHaveBeenCalledTimes(1)

        chokidarEmitter.emit('all', 'add', 'file.js')
        chokidarEmitter.emit('all', 'addDir', 'dir')
        chokidarEmitter.emit('all', 'change', 'test.js')
        chokidarEmitter.emit('all', 'unlink', 'file.js')
        chokidarEmitter.emit('all', 'unlinkDir', 'dir')

        expect(setTimeout).toHaveBeenCalledTimes(5)
        expect(restartMock).toHaveBeenCalledTimes(0)
        expect(forkMock).toHaveBeenCalledTimes(1)
        expect(forkEmitter['kill']).toHaveBeenCalledTimes(0)
        expect(watcher).toMatchObject({ fileEventsBuffer: ['add file.js', 'addDir dir', 'change test.js', 'unlink file.js', 'unlinkDir dir'] })

        jest.runAllTimers()

        expect(forkEmitter['kill']).toHaveBeenCalledTimes(2)
        expect(forkEmitter['kill']).toHaveBeenCalledWith('SIGTERM')
        expect(forkEmitter['kill']).toHaveBeenCalledWith('SIGALRM')
        expect(watcher).toMatchObject({ fileEventsBuffer: [] })
        expect(restartMock).toBeCalledTimes(1)
        expect(restartMock).toBeCalledWith(['add file.js', 'addDir dir', 'change test.js', 'unlink file.js', 'unlinkDir dir'])
      })

      it('restarts by spawning again if last time child failed', async (): Promise<void> => {
        const watcher = new AppWatcher('app', {}, ['somefile'])
        const watchMock = chokidar.watch as jest.Mock
        const forkMock = fork as jest.Mock
        const chokidarEmitter = new EventEmitter()
        const forkEmitter = new EventEmitter()
        forkEmitter['kill'] = jest.fn()

        watchMock.mockImplementationOnce((): EventEmitter => chokidarEmitter)
        forkMock.mockImplementation((): EventEmitter => forkEmitter)

        watcher.run()

        expect(forkMock).not.toHaveBeenCalled()

        chokidarEmitter.emit('ready')

        expect(forkMock).toHaveBeenCalledTimes(1)

        chokidarEmitter.emit('all', 'add', 'file.js')
        forkEmitter.emit('exit', 1)

        jest.runAllTimers()

        expect(forkEmitter['kill']).not.toHaveBeenCalled()
        expect(forkMock).toHaveBeenCalledTimes(2)
      })

      it('does not restart if stopping', async (): Promise<void> => {
        const watcher = new AppWatcher('app', {}, ['somefile'])
        const watchMock = chokidar.watch as jest.Mock
        const forkMock = fork as jest.Mock
        const chokidarEmitter = new EventEmitter()
        const forkEmitter = new EventEmitter()
        forkEmitter['kill'] = jest.fn()

        watchMock.mockImplementationOnce((): EventEmitter => chokidarEmitter)
        forkMock.mockImplementationOnce((): EventEmitter => forkEmitter)

        watcher.run()

        chokidarEmitter.emit('ready')
        chokidarEmitter.emit('all', 'add', 'file.js')
        watcher['stopping'] = true

        jest.runAllTimers()

        expect(forkEmitter['kill']).not.toHaveBeenCalled()
      })
    })
  })

  describe('.currentChildProcess', (): void => {
    it('forks the child process again on exit if not stopping flag has been set', async (): Promise<void> => {
      const watcher = new AppWatcher('app', {}, ['somefile'])
      const watchMock = chokidar.watch as jest.Mock
      const forkMock = fork as jest.Mock
      const chokidarEmitter = new EventEmitter()
      const forkEmitter = new EventEmitter()

      watchMock.mockImplementationOnce((): EventEmitter => chokidarEmitter)
      forkMock.mockImplementation((): EventEmitter => forkEmitter)

      watcher.run()

      chokidarEmitter.emit('ready')
      forkEmitter.emit('exit', 0)

      expect(forkMock).toHaveBeenCalledTimes(2)
      expect(forkMock).toHaveBeenLastCalledWith(expect.stringMatching(/universal-core\/src\/runApp.script.ts/), {
        env: expect.objectContaining({ CORE_APP_NAME: 'app', CORE_APP_ARGS: '{}', CORE_FORK: 'true' }),
        stdio: ['ipc', 'inherit', 'inherit']
      })
    })

    it('does not fork the child process again on exit if child exit code was not 0', async (): Promise<void> => {
      const watcher = new AppWatcher('app', {}, ['somefile'])
      const watchMock = chokidar.watch as jest.Mock
      const forkMock = fork as jest.Mock
      const chokidarEmitter = new EventEmitter()
      const forkEmitter = new EventEmitter()

      watchMock.mockImplementationOnce((): EventEmitter => chokidarEmitter)
      forkMock.mockImplementation((): EventEmitter => forkEmitter)

      watcher.run()

      chokidarEmitter.emit('ready')
      forkEmitter.emit('exit', 1)

      expect(forkMock).toHaveBeenCalledTimes(1)
    })

    it('does not fork the child process again on exit if stopping flag has been set', async (): Promise<void> => {
      const watcher = new AppWatcher('app', {}, ['somefile'])
      const watchMock = chokidar.watch as jest.Mock
      const forkMock = fork as jest.Mock
      const chokidarEmitter = new EventEmitter()
      const forkEmitter = new EventEmitter()

      watchMock.mockImplementationOnce((): EventEmitter => chokidarEmitter)
      forkMock.mockImplementation((): EventEmitter => forkEmitter)

      watcher.run()

      chokidarEmitter.emit('ready')

      watcher['stopping'] = true

      forkEmitter.emit('exit')

      expect(forkMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('.stop', (): void => {
    it('stops watcher and sends the ABRT signal', async (): Promise<void> => {
      const watcher = new AppWatcher('app', {}, ['somefile'])
      const watchMock = chokidar.watch as jest.Mock
      const forkMock = fork as jest.Mock
      const chokidarEmitter = new EventEmitter()
      const forkEmitter = new EventEmitter()
      chokidarEmitter['close'] = jest.fn()
      forkEmitter['kill'] = jest.fn()

      watchMock.mockImplementationOnce((): EventEmitter => chokidarEmitter)
      forkMock.mockImplementationOnce((): EventEmitter => forkEmitter)

      watcher.run()

      chokidarEmitter.emit('ready')

      watcher.stop()

      expect(watcher).toMatchObject({ stopping: true })
      expect(forkEmitter['kill']).toHaveBeenCalledTimes(2)
      expect(forkEmitter['kill']).toHaveBeenCalledWith('SIGTERM')
      expect(forkEmitter['kill']).toHaveBeenCalledWith('SIGABRT')
      expect(chokidarEmitter['close']).toHaveBeenCalled()
    })
  })

  describe('.kill', (): void => {
    it('just sends the kill signals', async (): Promise<void> => {
      const watcher = new AppWatcher('app', {}, ['somefile'])
      const watchMock = chokidar.watch as jest.Mock
      const forkMock = fork as jest.Mock
      const chokidarEmitter = new EventEmitter()
      const forkEmitter = new EventEmitter()
      chokidarEmitter['close'] = jest.fn()
      forkEmitter['kill'] = jest.fn()

      watchMock.mockImplementationOnce((): EventEmitter => chokidarEmitter)
      forkMock.mockImplementationOnce((): EventEmitter => forkEmitter)

      watcher.run()

      chokidarEmitter.emit('ready')

      watcher.kill()

      expect(watcher).toMatchObject({ stopping: false })
      expect(forkEmitter['kill']).toHaveBeenCalledTimes(2)
      expect(forkEmitter['kill']).toHaveBeenCalledWith('SIGTERM')
      expect(forkEmitter['kill']).toHaveBeenCalledWith('SIGABRT')
      expect(chokidarEmitter['close']).not.toHaveBeenCalled()
    })
  })
})
