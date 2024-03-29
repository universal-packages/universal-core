import { sleep } from '@universal-packages/time-measurer'
import os from 'os'

import CoreApp from '../src/CoreApp'

export default class CpuIntenseApp extends CoreApp {
  public static readonly appName = 'cpu-intense-app'
  public static readonly description = 'This is an app that uses a lot of CPU'

  private timeout: NodeJS.Timeout
  private workTimeout: NodeJS.Timeout

  public async prepare(): Promise<void> {
    await sleep(500)
  }

  public async run(): Promise<void> {
    this.timeout = setTimeout((): void => {}, 999999999)

    this.workTimeout = setTimeout((): void => {
      this.putCpusToWork()
    }, 1000)
  }

  public async stop(): Promise<void> {
    clearTimeout(this.timeout)
    clearTimeout(this.workTimeout)
  }

  public async release(): Promise<void> {
    await sleep(500)
  }

  private async putCpusToWork(): Promise<void> {
    const calculationPromises: Promise<void>[] = []

    const numberOfCpus = os.cpus().length
    const numberOfCpusToUse = Math.round(Math.random() * numberOfCpus)

    this.logger.log({ level: 'QUERY', title: 'New batch of calculation', message: `Calculating primes on ${numberOfCpusToUse} promises` })

    for (let i = 0; i < numberOfCpusToUse; i++) {
      calculationPromises.push(this.calculatePrimesLotsOfTimes())
    }

    await Promise.all(calculationPromises)

    this.logger.log({ level: 'INFO', title: 'Batch of calculation done', message: 'All calculations done' })

    this.workTimeout = setTimeout((): void => {
      this.putCpusToWork()
    }, 1000)
  }

  private async calculatePrimesLotsOfTimes(): Promise<void> {
    for (let i = 0; i < Math.random() * 100; i++) {
      const primes = []
      for (let i = 0; i < 10000; i++) {
        let isPrime = true
        for (let j = 2; j < i; j++) {
          if (i % j === 0) {
            isPrime = false
          }
        }
        if (isPrime) {
          primes.push(i)
        }
      }
    }
  }
}
