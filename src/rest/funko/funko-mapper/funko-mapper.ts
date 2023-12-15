import { Injectable } from '@nestjs/common'
import { CreateFunkoDto } from '@/rest/funko/dto/create-funko.dto'
import { Funko } from '@/rest/funko/entities/funko.entity'
import { UpdateFunkoDto } from '@/rest/funko/dto/update-funko.dto'

@Injectable()
export class FunkoMapper {
  private defaultImage = 'https://placehold.co/600x400'

  fromCreate(funkoCreate: CreateFunkoDto): Funko {
    const funko = new Funko()
    return {
      ...funkoCreate,
      ...funko,
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
}
