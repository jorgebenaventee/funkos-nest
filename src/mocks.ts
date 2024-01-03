import type { CreateFunkoDto } from '@/rest/funko/dto/create-funko.dto'
import type { FunkoResponseDto } from '@/rest/funko/dto/funko-response.dto'
import type { UpdateFunkoDto } from '@/rest/funko/dto/update-funko.dto'

export const mockedResponseFunko: FunkoResponseDto = {
  name: 'Funko 1',
  categoryName: 'Category 1',
  id: 1,
  createdAt: new Date(),
  image: 'image',
  price: 10,
  stock: 10,
  updatedAt: new Date(),
}
export const updateFunkoDto: UpdateFunkoDto = {
  name: 'Funko 1',
  price: 10,
  stock: 10,
  categoryName: 'Category 1',
}

export const createFunkoDto: CreateFunkoDto = {
  price: 10,
  stock: 10,
  categoryName: 'Category 1',
  name: 'Funko 1',
}
