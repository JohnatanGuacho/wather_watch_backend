import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NasaPowerController } from './nasa-power.controller';
import { NasaPowerService } from './nasa-power.service';

@Module({
  imports: [HttpModule.register({ timeout: 15000 })],
  controllers: [NasaPowerController],
  providers: [NasaPowerService],
})
export class NasaPowerModule {}
