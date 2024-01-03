import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateFunkoDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number' })
  @IsNotEmpty({ message: 'Price is required' })
  price: number
  @IsInt({ message: 'Stock must be an integer' })
  @IsNotEmpty({ message: 'Stock is required' })
  stock: number
  @IsString({ message: 'Category name must be a string' })
  @IsNotEmpty({ message: 'Category name is required' })
  categoryName: string
}
