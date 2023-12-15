let id = 1

export class Funko {
  id: number
  name: string
  price: number
  stock: number
  category: (typeof CATEGORIES)[keyof typeof CATEGORIES]
  image: string
  updatedAt: Date
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
