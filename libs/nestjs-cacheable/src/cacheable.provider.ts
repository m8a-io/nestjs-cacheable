import { Provider } from '@nestjs/common'
import { Cacheable } from 'cacheable'
import { CACHEABLE_OPTIONS, CACHEABLE } from './constants'
import { CacheableOptions } from './interfaces/cacheable-options.interface'

export const cacheableProvider: Provider = {
  provide: CACHEABLE,
  useFactory: (options: CacheableOptions): Cacheable => {
    return new Cacheable(options)
  },
  inject: [CACHEABLE_OPTIONS]
}
