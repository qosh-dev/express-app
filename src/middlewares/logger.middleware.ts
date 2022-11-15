import { NextFunction, Request, Response } from "express"
import { logger } from "../utils/logger.util"
const uuid = require("uuid")

/**
 * Will save request data on each request
 */
export default (req: Request, res: Response, next: NextFunction) => {
  const started_at = new Date()
  logger.child({ req_id: uuid.v4() }, true)
  logger.info({
    url: req.originalUrl,
    hostname: req.hostname,
    method: req.method,
    headers: req.headers,
    params: req.params,
    query: req.query,
    body: req.body,
  })

  res.on("error", (err) => {
    const error_at = new Date()
    const taked_time = error_at.getTime() - started_at.getTime()
    logger.error(``)
    logger.error(`Error after :${taked_time} ms`)
    logger.error(`Error: ${err.message}`)
    logger.error(``)
  })

  res.on("finish", () => {
    const finished_at = new Date()
    const taked_time = finished_at.getTime() - started_at.getTime()
    logger.info(`Request take :${taked_time} ms`)
  })



  // To log response body
  if (process.env.NODE_ENV !== "production") {
    const buffers: Uint8Array[] = []
    const proxyHandler = {
      apply(target: any, thisArg: any, argumentsList: any) {
        const contentType = res.getHeader('content-type')
        if (
          typeof contentType === 'string' && contentType.includes('json') && argumentsList[0]
        ) {
          buffers.push(argumentsList[0])
        }
        return target.call(thisArg, ...argumentsList)
      }
    }
    res.write = new Proxy(res.write, proxyHandler)
    res.end = new Proxy(res.end, proxyHandler)
    res.on('finish', () => {
      const jsonString = Buffer.concat(buffers).toString('utf8')
      if (jsonString) { // if not void
        const responseBody = JSON.parse(jsonString)
        logger.info()
        logger.info({ "responseBody": responseBody })
      }
    })
  }
  next()
}