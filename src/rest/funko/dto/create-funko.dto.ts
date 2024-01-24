import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateFunkoDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @ApiProperty({
    example: 'Capitán América',
    description: 'El nombre del funko',
    type: String,
    minLength: 1,
  })
  name: string
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number' })
  @IsNotEmpty({ message: 'Price is required' })
  @ApiProperty({
    example: 12.99,
    description: 'El precio del funko',
    type: Number,
    minimum: 0,
  })
  price: number
  @IsInt({ message: 'Stock must be an integer' })
  @IsNotEmpty({ message: 'Stock is required' })
  @ApiProperty({
    example: 10,
    description: 'El stock del funko',
    type: Number,
    minimum: 0,
  })
  stock: number
  @IsString({ message: 'Category name must be a string' })
  @IsNotEmpty({ message: 'Category name is required' })
  @ApiProperty({
    example: 'Marvel',
    description: 'El nombre de la categoría del funko',
    type: String,
    minLength: 1,
  })
  categoryName: string
}
