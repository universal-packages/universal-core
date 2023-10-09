import { checkDirectory, ensureDirectory } from '@universal-packages/fs-utils'
import Schema from 'validate'

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
    apps: {
      location: {
        type: String,
        use: { directoryCheck },
        message: 'Location is not accessible'
      },
      watcher: {
        enabled: {
          type: Boolean
        },
        ignore: {
          type: Array,
          each: { type: String }
        }
      }
    },
    config: {
      location: {
        type: String,
        use: { directoryCheck },
        message: 'Location is not accessible'
      }
    },
    environments: {
      location: {
        type: String,
        use: { directoryCheckOptional },
        message: 'Location is not accessible'
      }
    },
    modules: {
      asGlobals: {
        type: Boolean
      },
      location: {
        type: String,
        use: { directoryCheckOptional },
        message: 'Location is not accessible'
      }
    },
    tasks: {
      location: {
        type: String,
        use: { directoryCheck },
        message: 'Location is not accessible'
      }
    },
    logger: {
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
          message: 'Location is not accessible'
        }
      }
    }
  },
  { strict: true }
)
