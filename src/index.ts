import cors from "cors"
import express from "express"
import { AppDataSource } from "./data/app.data"
import AuthRouter from "./routes/auth.route"


import dotenv from "dotenv"
import loggerMiddleware from "./middlewares/logger.middleware"
import { initializeLogger, logger } from "./utils/logger.util"

// ---------------------------------------------------------------------
//                              Variables
// ---------------------------------------------------------------------
const config = {
  PORT: process.env.NODE_DOCKER_PORT ?? 3000,
}

const app = express()

// ---------------------------------------------------------------------
//                              Middlewares
// ---------------------------------------------------------------------
app.use(express.json())

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true")
  next()
})

app.use(
  cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
  }),
)

app.use(loggerMiddleware)

// ---------------------------------------------------------------------
//                              Routes
// ---------------------------------------------------------------------
app.get("/testttt", (req, res) => {
  res.json({ "work": 13123 })
})

app.use(AuthRouter)

//  404 page
app.use((req, res) => {
  res.status(404).end();
});

// ---------------------------------------------------------------------
//                              Initialization
// ---------------------------------------------------------------------

if (process.env.NODE_ENV !== "test") {
  app.listen(config.PORT, async () => {
    dotenv.config()
    await initializeLogger()
    AppDataSource.initialize()
    logger.info(`App listening on port ${config.PORT}`)
  })
}

export default app
