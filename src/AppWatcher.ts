import { ChildProcessWithoutNullStreams, fork } from 'child_process'
import chokidar, { FSWatcher } from 'chokidar'
import EventEmitter from 'events'
import fs from 'fs'
import path from 'path'
import readline from 'readline'

export default class AppWatcher extends EventEmitter {
  private appName: string
  private args: Record<string, any>
  private ignore: string[]

  private watcher: FSWatcher
  private currentChildProcess: ChildProcessWithoutNullStreams
  private stopping: boolean = false
  private fileEventsBuffer: string[] = []
  private restartTimeout: NodeJS.Timeout
  private ready: boolean
  private readlineInterface: readline.Interface

  public constructor(appName: string, args: Record<string, any>, ignore: string[] = []) {
    super()
    this.appName = appName
    this.args = args
    this.ignore = ignore
  }

  public run(): void {
    this.watcher = chokidar
      .watch('.', {
        ignored: [
          ...this.ignore,
          '**/node_modules/**/*',
          '**/.git/**/*',
          '**/coverage/**/*',
          '**/.tests/**/*',
          '**/test/**/*',
          '**/storage/**/*',
          '**/logs/**/*',
          '**/tmp/**/*',
          '.console_history',
          (entry) => {
            const extension = path.extname(entry)
            return !(!extension || ['.ts', '.js', '.json', '.yaml', '.yml'].includes(extension))
          }
        ]
      })
      .on('all', (event: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir', path: string): void => {
        if (this.ready) {
          this.fileEventsBuffer.push(`${event} ${path}`)

          this.restart()
        }
      })
      .on('ready', (): void => {
        this.ready = true
        this.spawnSubProcess()
        this.emit('ready')
      })

    if (process.stdin.isTTY) {
      this.readlineInterface = readline.createInterface({ input: process.stdin, escapeCodeTimeout: 50 })
      process.stdin.setRawMode(true)
      readline.emitKeypressEvents(process.stdin, this.readlineInterface)

      process.stdin.on('keypress', (ch, key) => {
        if (key.ctrl && key.name === 'c') {
          if (this.stopping) {
            this.kill()
          } else {
            this.stop()
          }
        }
        if (ch === 'r' || key.name === 'return') {
          this.restart()
        }
      })
    }
  }

  public stop(): void {
    this.stopping = true

    this.watcher.close()
    if (this.readlineInterface) this.readlineInterface.close()
    clearTimeout(this.restartTimeout)

    if (this.currentChildProcess) {
      this.currentChildProcess.kill('SIGTERM')
      this.currentChildProcess.kill('SIGABRT')
    }
  }

  public kill(): void {
    if (this.currentChildProcess) {
      this.currentChildProcess.kill('SIGTERM')
      this.currentChildProcess.kill('SIGABRT')
    }
  }

  public restart(): void {
    clearTimeout(this.restartTimeout)

    this.restartTimeout = setTimeout((): void => {
      if (!this.stopping) {
        if (this.currentChildProcess) {
          // if the forked app is still in a state that can be terminated send the signal that do so
          this.currentChildProcess.kill('SIGTERM')

          // Internally ALRM will recognize we try to reload
          this.currentChildProcess.kill('SIGALRM')
        } else {
          this.spawnSubProcess()
        }

        this.emit('restart', this.fileEventsBuffer)
        this.fileEventsBuffer = []
      }
    }, 1000)
  }

  private async spawnSubProcess(): Promise<void> {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      CORE_APP_NAME: this.appName,
      CORE_APP_ARGS: JSON.stringify(this.args),
      CORE_FORK: 'true'
    }
    const tsScriptExists = fs.existsSync(path.resolve(__dirname, 'runApp.script.ts'))
    const extension = tsScriptExists ? 'ts' : 'js'

    this.currentChildProcess = fork(path.resolve(__dirname, `runApp.script.${extension}`), { env, stdio: ['ipc', 'inherit', 'inherit'] })

    this.currentChildProcess.on('exit', (code: number): void => {
      this.currentChildProcess = null
      // Only restart if not failed
      if (!this.stopping && code === 0) {
        this.spawnSubProcess()
      }
    })
  }
}
