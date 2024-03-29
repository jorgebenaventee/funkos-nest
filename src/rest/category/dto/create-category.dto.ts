import { Transform } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateCategoryDto {
  @IsNotEmpty({ message: "Name can't be empty" })
  @IsString({ message: 'Name must be a string' })
  @Transform(({ value }) => value?.trim())
  name: string
}
