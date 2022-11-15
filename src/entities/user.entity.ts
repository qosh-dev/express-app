import { Column, Entity, OneToMany } from "typeorm"
import { BaseEntity } from "./base.entity"


@Entity({
  name: "users",
})
export class UserEntity extends BaseEntity<UserEntity> {
  @Column({
    unique: true,
  })
  email!: string

  @Column({
    default: "User"
  })
  name!: string

  @Column()
  password!: string

  @Column({
    nullable: true,
  })
  refreshToken?: string

  // ---------------------------------------------------------------------
  //                             Methods
  // ---------------------------------------------------------------------

  serialized() {
    return {
      name: this.name,
      email: this.email
    }
  }
}
