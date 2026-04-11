import { Module } from '@nestjs/common';
import { GoogleTrendsService } from './google-trends.service';
import { GoogleTrendsController } from './google-trends.controller';

@Module({
  providers: [GoogleTrendsService],
  controllers: [GoogleTrendsController],
  exports: [GoogleTrendsService],
})
export class GoogleTrendsModule {}