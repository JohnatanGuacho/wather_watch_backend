import { Module } from '@nestjs/common';
import { GibsService } from './gibs.service';
import { GibsController } from './gibs.controller';

@Module({
  controllers: [GibsController],
  providers: [GibsService],
})
export class GibsModule {}
