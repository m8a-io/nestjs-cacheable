import { Test } from '@nestjs/testing'
import { NestjsCacheableModule } from './nestjs-cacheable.module'
import { NestjsCacheableService } from './nestjs-cacheable.service'
import { CACHEABLE_OPTIONS } from './constants'
import {
  CacheableOptions,
  CacheableOptionsFactory,
} from './interfaces/cacheable-options.interface'
import { Injectable, Module } from '@nestjs/common'

describe('NestjsCacheableModule', () => {
  describe('register', () => {
    it('should provide the NestjsCacheableService', async () => {
      const module = await Test.createTestingModule({
        imports: [NestjsCacheableModule.register({})],
      }).compile()

      const service = module.get<NestjsCacheableService>(NestjsCacheableService)
      expect(service).toBeDefined()
    })

    it('should provide the options', async () => {
      const options: CacheableOptions = {}
      const module = await Test.createTestingModule({
        imports: [NestjsCacheableModule.register(options)],
      }).compile()

      const passedOptions = module.get<CacheableOptions>(CACHEABLE_OPTIONS)
      expect(passedOptions).toBe(options)
    })
  })

  describe('registerAsync', () => {
    @Injectable()
    class ConfigService {
      public get() {
        return {}
      }
    }

    it('should provide the NestjsCacheableService', async () => {
      const module = await Test.createTestingModule({
        imports: [
          NestjsCacheableModule.registerAsync({
            useFactory: () => ({}),
          }),
        ],
      }).compile()

      const service = module.get<NestjsCacheableService>(NestjsCacheableService)
      expect(service).toBeDefined()
    })

    it('should provide the options from a factory', async () => {
      const options: CacheableOptions = {}
      const module = await Test.createTestingModule({
        imports: [
          NestjsCacheableModule.registerAsync({
            useFactory: () => options,
          }),
        ],
      }).compile()

      const passedOptions = module.get<CacheableOptions>(CACHEABLE_OPTIONS)
      expect(passedOptions).toBe(options)
    })

    it('should provide the options from a factory with inject', async () => {
      @Module({
        providers: [ConfigService],
        exports: [ConfigService],
      })
      class ConfigModule {}

      const module = await Test.createTestingModule({
        imports: [
          NestjsCacheableModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => config.get(),
            inject: [ConfigService],
          }),
        ],
      }).compile()

      const passedOptions = module.get<CacheableOptions>(CACHEABLE_OPTIONS)
      expect(passedOptions).toEqual({})
    })

    it('should provide the options from a class', async () => {
      @Injectable()
      class OptionsService implements CacheableOptionsFactory {
        createCacheableOptions() {
          return {}
        }
      }

      const module = await Test.createTestingModule({
        imports: [
          NestjsCacheableModule.registerAsync({
            useClass: OptionsService,
          }),
        ],
      }).compile()

      const passedOptions = module.get<CacheableOptions>(CACHEABLE_OPTIONS)
      expect(passedOptions).toEqual({})
    })

    it('should provide the options from an existing provider', async () => {
      @Injectable()
      class OptionsService implements CacheableOptionsFactory {
        createCacheableOptions() {
          return {}
        }
      }

      @Module({
        providers: [OptionsService],
        exports: [OptionsService],
      })
      class MyOptionsModule {}

      const module = await Test.createTestingModule({
        imports: [
          NestjsCacheableModule.registerAsync({
            imports: [MyOptionsModule],
            useExisting: OptionsService,
          }),
        ],
      }).compile()

      const passedOptions = module.get<CacheableOptions>(CACHEABLE_OPTIONS)
      expect(passedOptions).toEqual({})
    })
  })
})