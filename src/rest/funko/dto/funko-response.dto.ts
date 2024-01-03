import { Funko } from '@/rest/funko/entities/funko.entity'
import { OmitType } from '@nestjs/mapped-types'

export class FunkoResponseDto extends OmitType(Funko, ['category']) {
  categoryName: string
}
