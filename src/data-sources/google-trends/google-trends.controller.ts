import { Controller, Get, Query } from '@nestjs/common';
import { GoogleTrendsService } from './google-trends.service';

@Controller('trends')
export class GoogleTrendsController {
  constructor(private readonly trendsService: GoogleTrendsService) {}

  @Get('related')
  async getRelated(@Query('q') keyword: string) {
    return this.trendsService.getRelatedKeywords(keyword);
  }
}