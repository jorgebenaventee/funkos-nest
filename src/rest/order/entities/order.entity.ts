import { ObjectId } from 'mongodb'
import { Column, Entity, ObjectIdColumn } from 'typeorm'

export class Address {
  @Column()
  street: string

  @Column()
  city: string

  @Column()
  zip: string
}

export class Client {
  @Column()
  name: string

  @Column()
  email: string

  @Column()
  phone: string

  @Column(() => Address)
  address: Address
}

export class OrderLine {
  @Column()
  funkoId: number

  @Column()
  quantity: number

  @Column()
  price: number

  @Column()
  total: number
}

@Entity({ name: 'orders' })
export class Order {
  @ObjectIdColumn()
  id: ObjectId

  @Column()
  userId: number
  @Column(() => Client)
  client: Client
  @Column(() => OrderLine)
  orderLines: OrderLine[]
  @Column()
  totalItems: number
  @Column()
  total: number
}
