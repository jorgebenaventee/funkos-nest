import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Funko } from '@/rest/funko/entities/funko.entity'

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  name: string
  @DeleteDateColumn()
  deletedAt: Date

  @OneToMany(() => Funko, (object) => object.category)
  funkos: Funko[]
}
