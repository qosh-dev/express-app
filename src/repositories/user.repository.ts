import { AppDataSource } from "../data/app.data"
import { UserEntity } from "../entities"

export const UserRepository = AppDataSource.getRepository(UserEntity).extend({
  //...
})
