import { Inject, Injectable, Logger } from '@nestjs/common'
import { CACHEABLE } from './constants'
import { Cacheable } from 'cacheable'
import { EventEmitter } from 'events'

@Injectable()
export class HealthService extends EventEmitter {
  private readonly logger = new Logger(HealthService.name)
  private isHealthy = false

  constructor(@Inject(CACHEABLE) private readonly cache: Cacheable) {
    super()
    const secondaryStore = this.cache.secondary
    if (secondaryStore && secondaryStore.store instanceof EventEmitter) {
      const redisClient = secondaryStore.store
      redisClient.on('connect', () => {
        this.logger.log('Redis connection established')
        this.isHealthy = true
        this.emit('health', true)
      })
      redisClient.on('error', (error) => {
        this.logger.error('Redis connection error', error)
        this.isHealthy = false
        this.emit('health', false)
      })
      redisClient.on('reconnecting', () => {
        this.logger.log('Reconnecting to Redis...')
        this.isHealthy = false
        this.emit('health', false)
      })
      redisClient.on('end', () => {
        this.logger.log('Redis connection closed')
        this.isHealthy = false
        this.emit('health', false)
      })
    } else {
      // If no secondary store, or it's not an event emitter (i.e. not redis),
      // we assume the cache is healthy (i.e. primary in-memory only).
      this.isHealthy = true
    }
  }

  getHealth(): boolean {
    return this.isHealthy
  }
}
