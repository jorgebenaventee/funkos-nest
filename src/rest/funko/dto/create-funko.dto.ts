import type { Funko } from '@/rest/funko/entities/funko.entity'
import { CATEGORIES } from '@/rest/funko/entities/funko.entity'
import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator'

const validCategories = Object.values(CATEGORIES)

export class CreateFunkoDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number' })
  @IsNotEmpty({ message: 'Price is required' })
  price: number
  @IsNumber({}, { message: 'Stock must be a number' })
  @IsNotEmpty({ message: 'Stock is required' })
  stock: number
  @IsIn(validCategories, {
    message: `Category must be ${validCategories.join(', ')}`,
  })
  category: Funko['category']
}
