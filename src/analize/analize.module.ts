import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AnalyzeController } from './analize.controller';
import { AnalyzeService } from './analize.service';

@Module({
  imports: [HttpModule], // 👈 necesario para HttpService
  controllers: [AnalyzeController],
  providers: [AnalyzeService],
})
export class AnalyzeModule {}
