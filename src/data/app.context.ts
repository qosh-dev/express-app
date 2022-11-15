import { NextFunction, Request, Response } from "express"
import { UserEntity } from "../entities"
import { UserRepository } from "../repositories/user.repository"
import { AuthUtil, AUTH_SECRETS } from "../utils/auth.util"

declare global {
  namespace Express {
    interface Application {
      context: { [key in string]: any }
      refreshToken: string
      currentUser: UserEntity
    }
  }
}