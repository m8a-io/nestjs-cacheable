import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NestjsCacheableModule } from '@m8a-io/nestjs-cacheable';

@Module({
  imports: [NestjsCacheableModule.register({})],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
