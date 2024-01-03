import type { CreateFunkoDto } from '@/rest/funko/dto/create-funko.dto'
import type { FunkoResponseDto } from '@/rest/funko/dto/funko-response.dto'
import type { UpdateFunkoDto } from '@/rest/funko/dto/update-funko.dto'
import type { Funko } from '@/rest/funko/entities/funko.entity'
import { Injectable } from '@nestjs/common'

@Injectable()
export class FunkoMapper {
  private defaultImage = 'https://placehold.co/600x400'

  fromCreate(funkoCreate: CreateFunkoDto): Omit<Funko, 'id'> {
    const { categoryName: _, ...funkoWithoutCategory } = funkoCreate
    return {
      ...funkoWithoutCategory,
      category: null,
      image: this.defaultImage,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  fromUpdate(funkoUpdate: UpdateFunkoDto, funko: Funko): Funko {
    return {
      ...funko,
      ...funkoUpdate,
      updatedAt: new Date(),
    }
  }

  toResponse(funko: Funko): FunkoResponseDto {
    const { category, ...funkoWithoutCategory } = funko
    return {
      ...funkoWithoutCategory,
      categoryName: category.name,
    }
  }
}
