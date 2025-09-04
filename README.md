# @m8a/nestjs-cacheable

A flexible and powerful caching module for NestJS that provides an easy-to-use API for tiered caching (in-memory and Redis).

## Installation

```bash
pnpm add @m8a-io/nestjs-cacheable cacheable ioredis keyv @keyv/redis
```

## Motivation

Nestjs' own cache-manager is good for getting the basics for caching going, but it leaves it up to you as a devland dev to use it properly throughout your application. This means, every devland dev using cache-manager will be doing the same things, like creating a caching interceptor for REST routes or creating a wrap function to for database call caching, creating two level caching  i.e. LRU memory caching as the L1 caching and a Redis store as L2 or secondary cache, etc. etc. 

This package has it all "built in", hopefully saving devland devs all of this effort. 

If you like and/ or are using the library/module, we'd love to get a star from you, if you could. 

## Usage

### Module Registration

Import the `NestjsCacheableModule` into your application's root module.

#### Static Registration

For static configuration, use the `register()` method.

```typescript
// app.module.ts
import { Module } from '@nestjs/common'
import { NestjsCacheableModule } from '@m8a-io/nestjs-cacheable'
import KeyvRedis from '@keyv/redis'

@Module({
  imports: [
    NestjsCacheableModule.register({
      secondary: new KeyvRedis('redis://user:pass@localhost:6379'),
    }),
  ],
})
export class AppModule {}
```

#### Asynchronous Registration

For asynchronous configuration, use the `registerAsync()` method. This is useful if you need to inject other services (like a `ConfigService`) to get your cache configuration.

```typescript
// app.module.ts
import { Module } from '@nestjs/common'
import { NestjsCacheableModule } from '@m8a-io/nestjs-cacheable'
import { ConfigModule, ConfigService } from '@nestjs/config'
import KeyvRedis from '@keyv/redis'

@Module({
  imports: [
    NestjsCacheableModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secondary: new KeyvRedis(configService.get('REDIS_URL')),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Declarative Caching with Interceptor

The easiest way to use the cache is with the `CacheableInterceptor`. You can apply it to any controller or method.

```typescript
// app.controller.ts
import { Controller, Get, UseInterceptors } from '@nestjs/common'
import { CacheableInterceptor, CacheTTL } from '@m8a-io/nestjs-cacheable'

@Controller()
export class AppController {
  @Get()
  @UseInterceptors(CacheableInterceptor)
  @CacheTTL(5000) // Cache this response for 5 seconds
  getData() {
    // This method will be cached.
    // The first request will execute it, and subsequent requests
    // within 5 seconds will receive the cached response.
    return { message: 'This is some data from a slow source.' }
  }
}
```

### Using the Service Directly

You can also inject the `NestjsCacheableService` to interact with the cache programmatically.

```typescript
// my.service.ts
import { Injectable } from '@nestjs/common'
import { NestjsCacheableService } from '@m8a-io/nestjs-cacheable'

@Injectable()
export class MyService {
  constructor(private readonly cache: NestjsCacheableService) {}

  async getSomeData(id: string) {
    const key = `my-data:${id}`
    const cachedData = await this.cache.get(key)

    if (cachedData) {
      return cachedData
    }

    const freshData = await this.fetchDataFromDb(id)
    await this.cache.set(key, freshData, 30000) // Cache for 30 seconds
    return freshData
  }

  private async fetchDataFromDb(id: string) {
    // ... slow database call
  }
}
```

Here is a full example of the module being set up in a devland cache.service.ts file.
NOTE: It has some debugging logging going on, so just for example only!

```typescript
import { NestjsCacheableService, WrapFunctionOptions } from '@m8a/nestjs-cacheable'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'

@Injectable()
export class CacheService implements OnModuleInit {
  private readonly logger = new Logger(CacheService.name)

  constructor (private readonly cache: NestjsCacheableService) {
    this.logger.log('CacheService instantiated.')
  }

  async onModuleInit () {

    const keyv = this.cache.secondary

    if (keyv) {
      const redisClient = keyv.store.client

      if (redisClient) {
        this.logger.log('Subscribing to Redis client events')
        redisClient.on('error', (error: Error) => {
          this.logger.error('Redis client error:', error)
        })
        redisClient.on('connect', () => {
          this.logger.log('Redis client connected')
        })
        redisClient.on('ready', () => {
          this.logger.log('Redis client ready')
          // NOTE: Automatic self-test removed due to lazy connection behavior.
          // Use the runCacheTest GraphQL query to trigger the test manually.
        })
        redisClient.on('end', () => {
          this.logger.log('Redis client connection ended')
        })
      } else {
        this.logger.error('Could not get redisClient from keyv.store.client')
      }
    } else {
      this.logger.error('Could not get keyv instance from this.cache.stores[0]')
    }
  }

  async get (type: string, key: string): Promise<string | null> {
    const cacheKey = this.getKey(type, key)
    this.logger.log(`Attempting to get from cache: ${cacheKey}`)
    try {
      const value = await this.cache.get<string>(cacheKey)
      this.logger.log(`Cache get result for ${cacheKey}: ${value ? value.substring(0, 10) + '...' : 'null'}`)
      return value || null // Ensure null is returned if value is undefined/empty string
    } catch (e) {
      this.logger.error(`Oops. Getting something from the cache failed for key ${cacheKey}:`, e)
      throw e
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async set (type: string, key: string, value: any, ttl: number): Promise<void> {
    const cacheKey = this.getKey(type, key)
    // The TTL is now expected in milliseconds.
    this.logger.log(`Attempting to set to cache: ${cacheKey}, TTL: ${ttl}ms, Value: ${value}`)
    try {
      await this.cache.set(cacheKey, value, ttl)
      this.logger.log(
        `Cache saved: ${cacheKey}, Value: ${value ? value.substring(0, 10) + '...' : 'null'}, TTL: ${ttl}ms`
      )
    } catch (e) {
      this.logger.error(`Oops. Setting something to the cache failed for key ${cacheKey}:`, e)
      throw e
    }
  }

  async revoke (type: string | null, key: string): Promise<void> {
    if (!type) {
      console.error(`CacheService.revoke called with invalid type: '${type}' for key: '${key}'`)
      return
    }
    const cacheKey = this.getKey(type, key) // type is guaranteed to be a non-empty string here
    this.logger.log(`Attempting to revoke from cache: ${cacheKey}`)
    await this.cache.del(cacheKey)
  }

  private getKey (type: string, initialKey: string): string {
    return `${type}:${initialKey}`
  }

  wrap<T, Arguments extends unknown[]> (
    fn: (...args: Arguments) => Promise<T>,
    options: WrapFunctionOptions
  ): (...args: Arguments) => Promise<T> {
    return this.cache.wrap(fn, options)
  }
```

We hope you enjoy using nestjs-cacheable!
