import type { CreateFunkoDto } from '@/rest/funko/dto/create-funko.dto'
import type { FunkoResponseDto } from '@/rest/funko/dto/funko-response.dto'
import type { UpdateFunkoDto } from '@/rest/funko/dto/update-funko.dto'
import { defaultImage, type Funko } from '@/rest/funko/entities/funko.entity'
import { Inject, Injectable, Scope } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { Request } from 'express'

@Injectable({ scope: Scope.REQUEST })
export class FunkoMapper {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  fromCreate(funkoCreate: CreateFunkoDto): Omit<Funko, 'id'> {
    const { categoryName: _, ...funkoWithoutCategory } = funkoCreate
    return {
      ...funkoWithoutCategory,
      category: null,
      image: defaultImage,
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
    const { category, image, ...restFunko } = funko
    let funkoImage = image
    if (image !== defaultImage) {
      funkoImage = `${this.request.protocol}://${this.request.get(
        'host',
      )}/api/funko/${funko.id}/image`
    }
    return {
      ...restFunko,
      image: funkoImage,
      categoryName: category.name,
    }
  }
}
