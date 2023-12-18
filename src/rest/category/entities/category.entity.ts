import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  name: string
}
