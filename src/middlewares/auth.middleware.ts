import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import app from ".."
import { UserRepository } from "../repositories/user.repository"
import { AuthUtil, AUTH_SECRETS, JWTPayload } from "../utils/auth.util"
import { logger } from "../utils/logger.util"
import { buildErrorMessage } from "./validator.middleware"

export default (req: Request, res: Response, next: NextFunction) => {
  const token = AuthUtil.authorizationToken(req)

  if (!token) return buildErrorMessage(res, { msg: "Не авторизован" }, 401)

  jwt.verify(token, AUTH_SECRETS.accessToken, async (err, data) => {

    if (err) return buildErrorMessage(res, { msg: "Не авторизован" }, 403)

    const { id } = data as JWTPayload
    const user = await UserRepository.findOneBy({ id })

    if (!user || user === null) return buildErrorMessage(res, { msg: "Не авторизован" }, 403)

    // Specify globalCurrentUser
    app.currentUser = user
    next()
  })
}

export const validatorRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const cookies = AuthUtil.getRequstCookies(req)
  if (!cookies || !cookies?.jwt)
    return buildErrorMessage(res, { msg: "refreshToken not provided" }, 401)
  req.app.refreshToken = cookies?.jwt
  const refreshToken: string = cookies!.jwt

  const data = AuthUtil.extractJWTPayload(
    refreshToken,
    AUTH_SECRETS.refreshToken,
  )

  const { id } = data as JWTPayload
  const user = await UserRepository.findOneBy({ id })
  if (!user || user === null) return buildErrorMessage(res, { msg: "Не авторизован" }, 403)
  app.currentUser = user
  next()
}
