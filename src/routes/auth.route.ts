import bcrypt from "bcryptjs"
import express from "express"
import { body } from 'express-validator'
import app from ".."
import authMiddleware, {
  validatorRefreshToken
} from "../middlewares/auth.middleware"
import {
  buildErrorMessage,
  validate
} from "../middlewares/validator.middleware"
import { UserRepository } from "../repositories/user.repository"
import { AuthUtil } from "../utils/auth.util"
import { logger } from "../utils/logger.util"

// ---------------------------------------------------------------------
//                              Variables
// ---------------------------------------------------------------------

const router = express.Router()

// ---------------------------------------------------------------------
//                              Route methods
// ---------------------------------------------------------------------

// REGISTRATION
router.post(
  "/signup",
  body("email", "Не верное значение электронной почты").isEmail(),
  body("password", "Не верное значение пароля").isString(),
  body("password", "Пароль должен быть длинной более 8 символов").isLength({ min: 8 }),
  validate(),
  async (req, res) => {
    const { email, password } = req.body
    const encryptedPassword = await AuthUtil.encryptPassword(password)
    try {
      const newUser = await UserRepository.save({
        email: email,
        password: encryptedPassword,
      })
      const tokenPayload = { id: newUser.id }
      const accessToken = AuthUtil.generateAccessToken(tokenPayload)
      const refreshToken = AuthUtil.generateRefreshToken(tokenPayload)
      newUser.refreshToken = refreshToken
      await UserRepository.save(newUser)

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      })
      return res
        .status(200)
        .json({ accessToken: accessToken, refreshToken: refreshToken })
    } catch (e: any) {
      if (e.code === "ER_DUP_ENTRY") {
        buildErrorMessage(res, { msg: "Email адрес уже занят" }, 409)
      } else {
        buildErrorMessage(res, { msg: e }, 409)
      }
    }
  },
)

router.post(
  "/signin",
  body("email", "Не верное значение электронной почты").isEmail(),
  body("password", "Не верное значение пароля").isString(),
  validate(),
  async (req, res) => {
    const { email, password } = req.body
    const user = await UserRepository.findOneBy({ email: email })
    if (!user)
      return buildErrorMessage(res, { msg: "Неверный email или пароль" }, 404)
    const match = await bcrypt.compare(password, user.password)
    if (!match)
      return buildErrorMessage(res, { msg: "Неверный email или пароль" }, 400)
    const tokenPayload = { id: user.id }
    const accessToken = AuthUtil.generateAccessToken(tokenPayload)
    if (!user.refreshToken || user.refreshToken === "") {
      const refreshToken = AuthUtil.generateRefreshToken(tokenPayload)
      user.refreshToken = refreshToken
      await UserRepository.save(user)
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      })
    }
    res.json({ accessToken: accessToken })
  },
)

router.post("/signin/new_token", validatorRefreshToken, async (req, res) => {
  const user = app.currentUser

  if (user.refreshToken !== app.refreshToken) {
    return buildErrorMessage(res, { msg: "Мы не знакомы" }, 403)
  }
  const tokenPayload = { id: user.id }
  const accessToken = AuthUtil.generateAccessToken(tokenPayload)
  res.json({ accessToken })
})

router.get("/logout", authMiddleware, async (req, res) => {
  let user = app.currentUser
  user.refreshToken = ""
  const tokenPayload = { id: user.id }
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true })
  const accessToken = AuthUtil.generateAccessToken(tokenPayload)
  await UserRepository.save(user)
  return res.json({ accessToken })
})

export default router
