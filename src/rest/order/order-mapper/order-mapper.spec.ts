import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { OrderMapper } from './order-mapper'

describe('OrderMapper', () => {
  let provider: OrderMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderMapper],
    }).compile()

    provider = module.get<OrderMapper>(OrderMapper)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })
})
