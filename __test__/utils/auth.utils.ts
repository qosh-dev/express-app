import { Response } from "supertest"
import { describe, expect, test, beforeAll, afterAll } from "@jest/globals"
import request from "supertest"
import app from "../../src"

export const AuthUtils = {
  randomUserCredentials: () => {
    const randomEmail = require("crypto").randomBytes(20).toString("hex")
    const randomPassword = require("crypto").randomBytes(20).toString("hex")
    const role = Math.random() < 0.5 ? "admin" : "employee"
    return {
      email: `test-${randomEmail}@gmail.com`,
      password: `test-${randomPassword}-password`,
      role: role,
    }
  },
  extractCookies(res: Response) {
    const cookieChunks = res.headers["set-cookie"][0].split(
      ",",
    ) as Array<string>
    const cookies = cookieChunks.map((item) => item.split(";")[0])
    return cookies.join(";")
  },
}