import { Category } from '@/rest/category/entities/category.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('funkos')
export class Funko {
  @PrimaryGeneratedColumn()
  id: number
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  name: string
  @Column({ type: 'decimal', nullable: false })
  price: number
  @Column({ type: 'int', nullable: false })
  stock: number
  @ManyToOne(() => Category, (object) => object.funkos, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category
  @Column({ type: 'varchar', length: 255, nullable: false })
  image: string
  @UpdateDateColumn()
  updatedAt: Date
  @CreateDateColumn()
  createdAt: Date
}
