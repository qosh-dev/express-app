import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"

export class BaseEntity<T = any> {

  @PrimaryGeneratedColumn()
  id!: number

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date

  // ---------------------------------------------------------------------
  //                              Methods
  // ---------------------------------------------------------------------

  updateByKeys<O extends Partial<T>>(object: O): O {
    const keys = Object.keys(object) as Array<keyof T>
    const model = (this as any)
    keys.forEach(key => {
      const value = object[key]
      model[key] = value
    });
    return model
  }
}