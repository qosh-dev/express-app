import { DataSource } from "typeorm"
import * as entities from "../entities"

require("dotenv").config()

let AppDataSource!: DataSource

if (process.env.NODE_ENV === "test") {
  AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.TESTING_MYSQL_HOST,
    port: Number(process.env.TESTING_MYSQLDB_LOCAL_PORT) ?? 3307,
    username: process.env.TESTING_MYSQL_USER,
    password: process.env.TESTING_MYSQL_PASSWORD,
    database: process.env.TESTING_MYSQL_DATABASE,
    synchronize: true,
    // logging: true,
    typename: "__typename",
    entities: entities,
  })
}

if (process.env.NODE_ENV === "development") {
  AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQLDB_LOCAL_PORT) ?? 3306,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    synchronize: true,
    // logging: true,
    typename: "__typename",
    entities: entities,
  })
}

if (process.env.NODE_ENV === "production") {
  AppDataSource = new DataSource({
    type: "mysql",
    host: "db",
    port: Number(process.env.MYSQLDB_LOCAL_PORT) ?? 3306,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    synchronize: true,
    // logging: true,
    typename: "__typename",
    entities: entities,
  })
}

export { AppDataSource }
