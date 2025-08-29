import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { CACHEABLE } from './constants'
import { Cacheable } from 'cacheable'
import { HealthService } from './health.service'

@Injectable()
export class NestjsCacheableService implements OnModuleDestroy {
  private readonly logger = new Logger(NestjsCacheableService.name)

  constructor(
    @Inject(CACHEABLE) private readonly cache: Cacheable,
    private readonly healthService: HealthService,
  ) {}

  async onModuleDestroy() {
    if (this.cache.secondary && typeof this.cache.secondary.disconnect === 'function') {
      await this.cache.secondary.disconnect()
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    if (!this.healthService.getHealth()) {
      this.logger.warn('Cache is unhealthy, skipping get operation.')
      return undefined
    }
    return this.cache.get(key)
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.healthService.getHealth()) {
      this.logger.warn('Cache is unhealthy, skipping set operation.')
      return false
    }
    if (ttl !== undefined) {
      await this.cache.set(key, value, ttl)
    } else {
      await this.cache.set(key, value)
    }
    return true
  }

  async del(key: string): Promise<boolean> {
    if (!this.healthService.getHealth()) {
      this.logger.warn('Cache is unhealthy, skipping del operation.')
      return false
    }
    return this.cache.delete(key)
  }

  wrap<T, Arguments extends any[]>(
    fn: (...args: Arguments) => Promise<T>,
    options?: any,
  ): (...args: Arguments) => Promise<T> {
    return (...args: Arguments): Promise<T> => {
      if (!this.healthService.getHealth()) {
        this.logger.warn(
          'Cache is unhealthy, skipping wrap operation and calling function directly.',
        )
        return fn(...args)
      }
      const wrappedFn = this.cache.wrap(fn, options)
      return wrappedFn(...args)
    }
  }
}
