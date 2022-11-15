import jwt, { JwtPayload } from "jsonwebtoken"
import { Request } from "express"
import bcrypt from "bcryptjs"

// ---------------------------------------------------------------------
//                              Variables
// ---------------------------------------------------------------------

export const AUTH_SECRETS = {
  refreshToken: process.env.REFRESH_TOKEN_SECRET ?? "",
  accessToken: process.env.ACCESS_TOKEN_SECRET ?? "",
}

// ---------------------------------------------------------------------
//                              Utils
// ---------------------------------------------------------------------
export const AuthUtil = {
  authorizationToken: (req: Request) => {
    const authHeader = req.headers["authorization"]
    return authHeader && authHeader.split(" ")[1]
  },
  generateAccessToken: (payload: JWTPayload) => {
    return jwt.sign({ payload }, AUTH_SECRETS.accessToken, { expiresIn: "5h" })
  },
  generateRefreshToken: (payload: JWTPayload) => {
    return jwt.sign({ payload }, AUTH_SECRETS.refreshToken, { expiresIn: "1d" })
  },
  async encryptPassword(password: string) {
    return await bcrypt.hash(password, 10)
  },
  getRequstCookies(req: Request) {
    const headerCookies = req.headers["cookie"]
    if (!headerCookies) return
    const cookies = headerCookies.split(",").map((item) => {
      const splited = item.split("=").map((item) => item.split(";")[0])
      return [splited[0], splited[1]]
    })
    if (!cookies) return
    return Object.fromEntries(cookies)
  },

  extractJWTPayload(token: string, solt: string) {
    const jwtData = jwt.verify(token, solt) as { payload: JWTPayload }
    return jwtData.payload
  },
}

// ---------------------------------------------------------------------
//                              Types
// ---------------------------------------------------------------------

export type JWTPayload = {
  id: number
}
