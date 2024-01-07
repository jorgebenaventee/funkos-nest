import type { CategoryResponseDto } from '@/rest/category/dto/category-response.dto'
import type { CreateCategoryDto } from '@/rest/category/dto/create-category.dto'
import type { Category } from '@/rest/category/entities/category.entity'
import type { CreateFunkoDto } from '@/rest/funko/dto/create-funko.dto'
import type { FunkoResponseDto } from '@/rest/funko/dto/funko-response.dto'
import type { UpdateFunkoDto } from '@/rest/funko/dto/update-funko.dto'
import type { Funko } from '@/rest/funko/entities/funko.entity'
import * as crypto from 'crypto'

const uuid = crypto.randomUUID()
const date = new Date()
export const category: Category = {
  name: 'Category 1',
  id: uuid,
  deletedAt: null,
  funkos: [],
}

export const categoryResponseDto: CategoryResponseDto = {
  name: 'Category 1',
  id: uuid,
  funkos: [],
}

export const createCategoryDto: CreateCategoryDto = {
  name: 'Category 1',
}

export const updateCategoryDto: CreateCategoryDto = {
  name: 'Category 1',
}

export const mockedResponseFunko: FunkoResponseDto = {
  name: 'Funko 1',
  categoryName: 'Category 1',
  id: 1,
  createdAt: date,
  image: 'image',
  price: 10,
  stock: 10,
  updatedAt: date,
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

export const funko: Funko = {
  price: 10,
  stock: 10,
  category,
  id: 1,
  createdAt: date,
  image: 'image',
  name: 'Funko 1',
  updatedAt: date,
}
