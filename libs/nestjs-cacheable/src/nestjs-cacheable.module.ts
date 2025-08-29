import { DynamicModule, Module, Provider } from '@nestjs/common'
import { NestjsCacheableService } from './nestjs-cacheable.service'
import { CACHEABLE_OPTIONS } from './constants'
import {
  CacheableAsyncOptions,
  CacheableOptions,
  CacheableOptionsFactory,
} from './interfaces/cacheable-options.interface'
import { cacheableProvider } from './cacheable.provider'
import { HealthService } from './health.service'

@Module({})
export class NestjsCacheableModule {
  static register(options: CacheableOptions): DynamicModule {
    return {
      module: NestjsCacheableModule,
      providers: [
        {
          provide: CACHEABLE_OPTIONS,
          useValue: options,
        },
        cacheableProvider,
        HealthService,
        NestjsCacheableService,
      ],
      exports: [HealthService, NestjsCacheableService],
    }
  }

  static registerAsync(options: CacheableAsyncOptions): DynamicModule {
    return {
      module: NestjsCacheableModule,
      imports: options.imports || [],
      providers: [
        ...this.createAsyncProviders(options),
        cacheableProvider,
        HealthService,
        NestjsCacheableService,
      ],
      exports: [HealthService, NestjsCacheableService],
    }
  }

  private static createAsyncProviders(
    options: CacheableAsyncOptions,
  ): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: CACHEABLE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ]
    }

    if (options.useClass) {
      return [
        {
          provide: CACHEABLE_OPTIONS,
          useFactory: async (optionsFactory: CacheableOptionsFactory) =>
            await optionsFactory.createCacheableOptions(),
          inject: [options.useClass],
        },
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
      ]
    }

    if (options.useExisting) {
      return [
        {
          provide: CACHEABLE_OPTIONS,
          useFactory: async (optionsFactory: CacheableOptionsFactory) =>
            await optionsFactory.createCacheableOptions(),
          inject: [options.useExisting],
        },
      ]
    }

    return []
  }
}
