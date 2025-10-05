import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrecipitacionModule } from './precipitacion/precipitacion.module';
import { WaterModule } from './water/water.module';
import { NasaPowerModule } from './nasa-power/nasa-power.module';
import { PopulationModule } from './population/population.module';
import { GibsModule } from './gibs/gibs.module';
// (agregaremos el PrecipitationModule luego)

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrecipitacionModule,
    WaterModule,
    NasaPowerModule,
    PopulationModule,
    GibsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
