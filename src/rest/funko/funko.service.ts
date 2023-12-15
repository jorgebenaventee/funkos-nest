import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { Funko } from './entities/funko.entity'
import { FunkoMapper } from '@/rest/funko/funko-mapper/funko-mapper'

@Injectable()
export class FunkoService {
  private funkos: Funko[]
  private readonly logger = new Logger(FunkoService.name)

  constructor(private readonly funkoMapper: FunkoMapper) {
    const funko = new Funko()
    funko.name = 'Mickey Mouse'
    funko.price = 10
    funko.stock = 10
    funko.category = 'Disney'
    funko.image = 'https://i.imgur.com/1oo1WfE.jpeg'

    const funko2 = new Funko()
    funko2.name = 'Minnie Mouse'
    funko2.price = 10
    funko2.stock = 10
    funko2.category = 'Disney'
    funko2.image = 'https://i.imgur.com/1oo1WfE.jpeg'

    this.funkos = [funko, funko2]
  }

  create(createFunkoDto: CreateFunkoDto) {
    this.logger.log(`Creating funko ${JSON.stringify(createFunkoDto)}`)
    const funko = this.funkoMapper.fromCreate(createFunkoDto)
    this.funkos.push(funko)
    return funko
  }

  findAll() {
    this.logger.log(`Finding all funkos`)
    return this.funkos
  }

  findOne(id: number) {
    this.logger.log(`Finding funko with id ${id}`)
    return (
      this.funkos.find((funko) => funko.id === id) ?? this.throwNotFound(id)
    )
  }

  update(id: number, updateFunkoDto: UpdateFunkoDto) {
    this.logger.log(`Updating funko with id ${id}`)
    const existingFunko = this.funkos.find((funko) => funko.id === id)
    if (!existingFunko) {
      this.throwNotFound(id)
    }
    const updatedFunko = this.funkoMapper.fromUpdate(
      updateFunkoDto,
      existingFunko,
    )

    this.funkos = this.funkos.map((funko) =>
      funko.id === id ? updatedFunko : funko,
    )

    return updatedFunko
  }

  remove(id: number) {
    this.logger.log(`Removing funko with id ${id}`)
    const existingFunko = this.funkos.find((funko) => funko.id === id)
    if (!existingFunko) {
      this.throwNotFound(id)
    }

    this.funkos = this.funkos.filter((funko) => funko.id !== id)

    return existingFunko
  }

  private throwNotFound(id: Funko['id']) {
    this.logger.error(`Funko with id ${id} not found`)
    throw new NotFoundException(`Funko with id ${id} not found`)
  }
}
