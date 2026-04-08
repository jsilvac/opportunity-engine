import { Module } from '@nestjs/common';
import { MercadoLibreService } from './mercadolibre/ml.service';
import { MercadoLibreController } from './mercadolibre/ml.controller';

@Module({
  controllers: [MercadoLibreController],
  providers: [MercadoLibreService],
  exports: [MercadoLibreService],
})
export class DataSourcesModule {}