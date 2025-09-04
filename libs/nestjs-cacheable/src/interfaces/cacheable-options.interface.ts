import { ModuleMetadata } from '@nestjs/common/interfaces'
import  Keyv from 'keyv'
import type { KeyvStoreAdapter } from 'keyv'

export type AnyFunction = (...args: any[]) => any

export type CreateWrapKey = (
    function_: AnyFunction,
    arguments_: any[],
    options?: WrapFunctionOptions,
) => string

export type WrapFunctionOptions = {
    ttl?: number | string;
    keyPrefix?: string;
    createKey?: CreateWrapKey;
    cacheErrors?: boolean;
    cacheId?: string;
};

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