import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { CacheableInterceptor, CacheTTL } from '@m8a-io/nestjs-cacheable';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseInterceptors(CacheableInterceptor)
  @CacheTTL(10000) // Cache for 10 seconds
  getHello(): string {
    return this.appService.getHello();
  }
}
