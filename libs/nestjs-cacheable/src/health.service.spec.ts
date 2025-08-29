import { Test, TestingModule } from '@nestjs/testing'
import { HealthService } from './health.service'
import { CACHEABLE } from './constants'
import { Cacheable } from 'cacheable'
import { EventEmitter } from 'events'

describe('HealthService', () => {
  let service: HealthService
  let cacheable: Cacheable

  describe('with a secondary store', () => {
    let secondaryStore: EventEmitter

    beforeEach(async () => {
      secondaryStore = new EventEmitter()
      cacheable = {
        secondary: {
          store: secondaryStore,
        },
      } as any

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          HealthService,
          {
            provide: CACHEABLE,
            useValue: cacheable,
          },
        ],
      }).compile()

      service = module.get<HealthService>(HealthService)
    })

    it('should be defined', () => {
      expect(service).toBeDefined()
    })

    it('should be healthy on connect', () => {
      secondaryStore.emit('connect')
      expect(service.getHealth()).toBe(true)
    })

    it('should be unhealthy on error', () => {
      secondaryStore.emit('error', new Error('test error'))
      expect(service.getHealth()).toBe(false)
    })

    it('should be unhealthy on reconnecting', () => {
      secondaryStore.emit('reconnecting')
      expect(service.getHealth()).toBe(false)
    })

    it('should be unhealthy on end', () => {
      secondaryStore.emit('end')
      expect(service.getHealth()).toBe(false)
    })
  })

  describe('without a secondary store', () => {
    beforeEach(async () => {
      cacheable = {} as any

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          HealthService,
          {
            provide: CACHEABLE,
            useValue: cacheable,
          },
        ],
      }).compile()

      service = module.get<HealthService>(HealthService)
    })

    it('should be healthy', () => {
      expect(service.getHealth()).toBe(true)
    })
  })
})
