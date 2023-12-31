import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'

let id = 1

@Entity('funkos')
export class Funko {
  @PrimaryColumn('int')
  id: number
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  name: string
  @Column({ type: 'decimal', nullable: false })
  price: number
  @Column({ type: 'int', nullable: false })
  stock: number
  @Column({ type: 'varchar', length: 255, nullable: false })
  category: (typeof CATEGORIES)[keyof typeof CATEGORIES]
  @Column({ type: 'varchar', length: 255, nullable: false })
  image: string
  @UpdateDateColumn()
  updatedAt: Date
  @CreateDateColumn()
  createdAt: Date

  constructor() {
    this.id = id++
  }
}

export const CATEGORIES = {
  DISNEY: 'Disney',
  OTHERS: 'Others',
  MARVEL: 'Marvel',
  DC: 'DC',
} as const
