import { Server } from "http"
import request from "supertest"
import { AppDataSource } from "../../src/data/app.data"
import server from "../../src/index"
import { initializeLogger } from "../../src/utils/logger.util"
import { AuthUtils } from "../utils/auth.utils"
import { describe, expect, test, beforeAll, afterAll } from "@jest/globals"

require("dotenv").config()
// ---------------------------------------------------------------------
//                              Variables
// ---------------------------------------------------------------------

let app!: Server
export const baseRoute = process.env.BASE_URL
let accessToken = ""
let cookie = ""
let userCredentials!: { email: string; password: string, role: string }

describe("Auth routess", () => {
  // ---------------------------------------------------------------------
  //                              HOOKS
  // ---------------------------------------------------------------------

  beforeAll(async () => {
    userCredentials = AuthUtils.randomUserCredentials()
    app = server.listen(3000, async () => {
      await AppDataSource.initialize()
      await initializeLogger()
    })

    // Sleep 1 second to establish connection with database
    await new Promise((resolve) => setTimeout(resolve, 1000))
  })

  afterAll(async () => {
    app.close()
    if (AppDataSource.isInitialized) {
      await AppDataSource.dropDatabase()
      await AppDataSource.destroy()
    }
  })

  // ---------------------------------------------------------------------
  //                              TESTS
  // ---------------------------------------------------------------------

  describe("/signup", () => {
    test("Will return status code 400(Bad request) because we not specified proper credentials", async () => {
      await request(app)
        .post("/signup")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(400)
    })

    test("Will create new user && return tokens", async () => {
      const response = await request(app)
        .post("/signup")
        .send(userCredentials)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
      expect(response.body).toHaveProperty("accessToken")
      expect(response.body).toHaveProperty("refreshToken")
      cookie = AuthUtils.extractCookies(response)
      accessToken = response.body.accessToken
    })

    test("Will return status code 409(Confict), because we use already used email", async () => {
      await request(app)
        .post("/signup")
        .send(userCredentials)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(409)
    })
  })

  describe("/signin", () => {
    test("/signin will get access token by credentials", async () => {
      const response = await request(app)
        .post("/signin")
        .send(userCredentials)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)

      expect(response.body).toHaveProperty("accessToken")
    })

    test("/signin will return status code 400(Bad request) because we not specified proper credentials", async () => {
      await request(app)
        .post("/signin")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(400)
    })

    test("/signin/new_token will return accessToken from refreshToken", async () => {
      const response = await request(app)
        .post("/signin/new_token")
        .set("Accept", "application/json")
        .set("Cookie", cookie)
        .set("authorization", `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toHaveProperty("accessToken")
      accessToken = response.body.accessToken
    })
  })

  describe("/logout", () => {
    test("Will logout and clear refresh token", async () => {
      const response = await request(app)
        .get("/logout")
        .set("Cookie", cookie)
        .set("authorization", `Bearer ${accessToken}`)
        .set("Accept", "application/json")
        .expect(200)

      expect(response.body).toHaveProperty("accessToken")
    })
  })

  describe("Check credentials access", () => {
    test("/signin/new_token check is refresh token invalidated", async () => {
      await request(app)
        .post("/signin/new_token")
        .set("Accept", "application/json")
        .set("Cookie", cookie)
        .set("authorization", `Bearer ${accessToken}`)
        .expect(403)
    })

    test("Will create new user && return tokens", async () => {
      const response = await request(app)
        .post("/signup")
        .send({
          email: "new-" + userCredentials.email,
          password: "new-" + userCredentials.password,
          role: "employee",
        })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)

      expect(response.body).toHaveProperty("accessToken")
      expect(response.body).toHaveProperty("refreshToken")
      cookie = AuthUtils.extractCookies(response)
      accessToken = response.body.accessToken
    })
  })
})
