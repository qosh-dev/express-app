import bunyan from "bunyan"
import fs, { promises as fsPromise } from "fs"

// ---------------------------------------------------------------------
//                              Variables
// ---------------------------------------------------------------------
require("dotenv").config()

// @ts-ignore
export let logger: bunyan

let loggerConfig: Partial<bunyan.LoggerOptions> = {
  name: process.env.npm_package_name,
  serializers: bunyan.stdSerializers,
}
const logsDirPath = "/var/log/app/"
const logDirectories = ["info", "error", "fatal", "warn"]

// ---------------------------------------------------------------------
//                              Functions
// ---------------------------------------------------------------------

/**
 * Configure log directories on production
 */
function specifyLogDirectories() {
  loggerConfig.streams = logDirectories.map((logType) => {
    return {
      level: logType,
      path: logsDirPath + logType + ".log",
    }
  }) as bunyan.Stream[]
}

/**
 * Initialize logger
 *
 * After we can use {{logger}} method
 *
 * On production will save logs in {{logsDirPath}}
 */
export const initializeLogger = async () => {
  if (process.env.NODE_ENV === "production") {
    if (fs.existsSync(logsDirPath)) {
      specifyLogDirectories()
    } else {
      await fsPromise.mkdir(logsDirPath)
      const logFiles = logDirectories.map((logType) =>
        fsPromise.appendFile(logsDirPath + logType + ".log", ""),
      )
      await Promise.all(logFiles)
      specifyLogDirectories()
    }
  }

  logger = bunyan.createLogger(loggerConfig as bunyan.LoggerOptions)
}
