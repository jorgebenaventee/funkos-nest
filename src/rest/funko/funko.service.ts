import { HttpException, Injectable } from '@nestjs/common'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { Funko } from './entities/funko.entity'

@Injectable()
export class FunkoService {
  private funkos: Funko[]

  private nextId = 1
  private defaultImage = 'https://placehold.co/600x400'

  create(createFunkoDto: CreateFunkoDto) {
    const newFunko: Funko = {
      ...createFunkoDto,
      id: this.nextId++,
      image: this.defaultImage,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.funkos.push(newFunko)
    return newFunko
  }

  findAll() {
    return this.funkos
  }

  findOne(id: number) {
    return (
      this.funkos.find((funko) => funko.id === id) ?? this.throwNotFound(id)
    )
  }

  update(id: number, updateFunkoDto: UpdateFunkoDto) {
    const existingFunko = this.funkos.find((funko) => funko.id === id)
    if (!existingFunko) {
      this.throwNotFound(id)
    }

    const updatedFunko: Funko = {
      ...existingFunko,
      ...updateFunkoDto,
      updatedAt: new Date(),
    }

    this.funkos = this.funkos.map((funko) =>
      funko.id === id ? updatedFunko : funko,
    )

    return updatedFunko
  }

  remove(id: number) {
    const existingFunko = this.funkos.find((funko) => funko.id === id)
    if (!existingFunko) {
      this.throwNotFound(id)
    }

    this.funkos = this.funkos.filter((funko) => funko.id !== id)

    return existingFunko
  }

  private throwNotFound(id: Funko['id']) {
    throw new HttpException(`Funko with id ${id} not found`, 404)
  }
}
