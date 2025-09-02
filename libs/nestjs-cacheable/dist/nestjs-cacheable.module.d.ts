import { DynamicModule } from '@nestjs/common';
import { CacheableAsyncOptions, CacheableOptions } from './interfaces/cacheable-options.interface';
export declare class NestjsCacheableModule {
    static register(options: CacheableOptions): DynamicModule;
    static registerAsync(options: CacheableAsyncOptions): DynamicModule;
    private static createAsyncProviders;
}
