import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator'

export class AddressDto {
  @IsString({ message: 'Number should be a string' })
  @MaxLength(50, { message: 'Number should not exceed 50 characters' })
  @IsNotEmpty({ message: 'Number is required' })
  number: string

  @IsString({ message: 'Street should be a string' })
  @MaxLength(50, { message: 'Street should not exceed 50 characters' })
  @IsNotEmpty({ message: 'Street is required' })
  street: string

  @IsString({ message: 'City should be a string' })
  @MaxLength(50, { message: 'City should not exceed 50 characters' })
  @IsNotEmpty({ message: 'City is required' })
  city: string

  @IsString({ message: 'State should be a string' })
  @MaxLength(50, { message: 'State should not exceed 50 characters' })
  @IsNotEmpty({ message: 'State is required' })
  state: string

  @IsString({ message: 'Country should be a string' })
  @MaxLength(50, { message: 'Country should not exceed 50 characters' })
  @IsNotEmpty({ message: 'Country is required' })
  country: string

  @IsString({ message: 'Zip code should be a string' })
  @MaxLength(5, { message: 'Zip code should not exceed 5 characters' })
  @IsNotEmpty({ message: 'Zip code is required' })
  zipCode: string
}

export class ClientDto {
  @IsString({ message: 'Full name should be a string' })
  @MaxLength(50, { message: 'Full name should not exceed 50 characters' })
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string

  @IsString({ message: 'Email should be a string' })
  @MaxLength(50, { message: 'Email should not exceed 50 characters' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string

  @IsString({ message: 'Phone number should be a string' })
  @MaxLength(50, { message: 'Phone number should not exceed 50 characters' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phoneNumber: string

  @IsNotEmpty({ message: 'Address is required' })
  address: AddressDto
}

export class OrderLineDto {
  @IsString({ message: 'Quantity should be a string' })
  @MaxLength(50, { message: 'Quantity should not exceed 50 characters' })
  @IsNotEmpty({ message: 'Quantity is required' })
  quantity: number

  @IsNumber({}, { message: 'ID Funko should be a number' })
  @IsPositive({ message: 'ID Funko should be a positive number' })
  @IsNotEmpty({ message: 'ID Funko is required' })
  idFunko: number

  @IsString({ message: 'Price should be a string' })
  @MaxLength(50, { message: 'Price should not exceed 50 characters' })
  @IsNotEmpty({ message: 'Price is required' })
  price: number

  @IsString({ message: 'Total should be a string' })
  @MaxLength(50, { message: 'Total should not exceed 50 characters' })
  @IsNotEmpty({ message: 'Total is required' })
  total: number
}

export class CreateOrderDto {
  @IsInt({ message: 'User ID should be a number' })
  userId: number

  @IsNotEmpty({ message: 'Client is required' })
  client: ClientDto

  @IsNotEmpty({ message: 'Order lines are required' })
  orderLines: OrderLineDto[]

  @IsNumber({}, { message: 'Total items should be a number' })
  @IsPositive({ message: 'Total items should be a positive number' })
  @IsNotEmpty({ message: 'Total items is required' })
  totalItems: number

  @IsNumber({}, { message: 'Total should be a number' })
  @IsPositive({ message: 'Total should be a positive number' })
  @IsNotEmpty({ message: 'Total is required' })
  total: number
}
