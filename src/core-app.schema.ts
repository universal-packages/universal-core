import Schema from 'validate'
import { ensureDirectory, checkDirectory } from '@universal-packages/fs-utils'

const directoryCheck = (value: any): boolean => {
  try {
    checkDirectory(value)
    return true
  } catch {
    return false
  }
}

const directoryCheckOptional = (value: any): boolean => {
  if (!value) return true
  return directoryCheck(value)
}

const directoryEnsure = (value: any): boolean => {
  try {
    ensureDirectory(value)
    return true
  } catch {
    return false
  }
}

const directoryEnsureOptional = (value: any): boolean => {
  if (!value) return true
  return directoryEnsure(value)
}

export const coreConfigSchema = new Schema(
  {
    appsDirectory: {
      type: String,
      use: { directoryCheck },
      message: 'Directory is not accesible'
    },
    configDirectory: {
      type: String,
      use: { directoryCheck },
      message: 'Directory is not accesible'
    },
    modulesDirectory: {
      type: String,
      use: { directoryCheckOptional },
      message: 'Directory is not accesible'
    },
    tasksDirectory: {
      type: String,
      use: { directoryCheck },
      message: 'Directory is not accesible'
    },
    logger: {
      transportsDirectory: {
        type: String,
        use: { directoryCheckOptional },
        message: 'Directory is not accesible'
      },
      level: {
        type: String,
        enum: ['FATAL', 'ERROR', 'WARNING', 'QUERY', 'INFO', 'DEBUG', 'TRACE'],
        message: 'Must be one of: FATAL | ERROR | WARNING | QUERY | INFO | DEBUG | TRACE'
      },
      silence: {
        type: Boolean
      },
      terminal: {
        enable: {
          type: Boolean
        },
        clear: {
          type: Boolean
        },
        withHeader: {
          type: Boolean
        }
      },
      localFile: {
        enable: {
          type: Boolean
        },
        asJson: {
          type: Boolean
        },
        location: {
          type: String,
          use: { directoryEnsureOptional },
          message: 'Directory is not accesible'
        }
      }
    }
  },
  { strict: true }
)
