import { NextFunction, Request, RequestHandler, Response } from "express";
import { ValidationError, validationResult } from 'express-validator';
import { logger } from "../utils/logger.util";

export function validate<T>() {
  return (req: Request<any, any, T>, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    } else {
      next()
    }
  }
}

export const buildErrorMessage = (response: Response, error: Partial<ValidationError>, statusCode: number | undefined = 409) => {
  console.log("error", error);

  let defaultError: Partial<ValidationError> = {
    param: '_error',
    msg: "Ошибка",
    location: "body",
    value: "Не указано"
  }
  const keys = Object.keys(defaultError) as Array<keyof ValidationError>

  keys.forEach(key => {
    if (!error[key]) {
      error[key] = defaultError[key]
    }
  })
  // logger.error({ statusCode, error })
  return response
    .status(statusCode)
    .json([error])
}


export const handler = (
  handler: RequestHandler
) => {
  try {
    return (req: Request, res: Response, next: NextFunction) => {
      handler(req, res, next)
    }
  } catch (e) {
    return (req: Request, res: Response) => {
      logger.error({ "errorHandlerMiddleware": e })
      return buildErrorMessage(res, { msg: "Ошибка обратитесь в службу поддержки" }, 409)
    }
  }
}