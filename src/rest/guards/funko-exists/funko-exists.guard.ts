import { Funko } from '@/rest/funko/entities/funko.entity'
import { Injectable, NotFoundException } from '@nestjs/common'
import type { CanActivate, ExecutionContext } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class FunkoExistsGuard implements CanActivate {
  constructor(
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
  ) {}

  canActivate(context: ExecutionContext) {
    const { id } = context.switchToHttp().getRequest().params
    if (!this.funkoRepository.exist({ where: { id } })) {
      throw new NotFoundException(`Funko ${id} not found`)
    }

    return true
  }
}
