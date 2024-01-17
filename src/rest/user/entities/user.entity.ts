import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number
  @Column({ unique: true, nullable: false })
  username: string
  @Column({ nullable: false })
  password: string
  @ManyToMany(() => Role, { eager: true })
  @JoinTable({ name: 'user_roles' })
  roles: Role[]
}

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number
  @Column({ unique: true, nullable: false })
  name: string
}
