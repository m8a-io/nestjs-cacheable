import { ModuleMetadata } from '@nestjs/common/interfaces'
import  Keyv from 'keyv'
import Store from 'keyv'

export type KeyvStoreAdapter = Store<any>

export interface CacheableOptions {
  primary?: Keyv | KeyvStoreAdapter
  secondary?: Keyv | KeyvStoreAdapter
  stats?: boolean
  nonBlocking?: boolean
  ttl?: number | string
  namespace?: string | (() => string)
  cacheId?: string
}

export interface CacheableOptionsFactory {
  createCacheableOptions(): Promise<CacheableOptions> | CacheableOptions
}

export interface CacheableAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: any
  useClass?: any
  useFactory?: (...args: any[]) => Promise<CacheableOptions> | CacheableOptions
  inject?: any[]
}
