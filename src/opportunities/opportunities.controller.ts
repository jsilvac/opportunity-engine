import { Body, Controller, Get, Post, Patch, Param, ParseIntPipe, Delete, Query } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';

@Controller('opportunities')
export class OpportunitiesController {

  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Get()
findAll(
  @Query('page') page?: string,
  @Query('limit') limit?: string,
  @Query('active') active?: string,) {
    return this.opportunitiesService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      active !== undefined ? active === 'true' : undefined,
    );
  }

  @Post()
  create(@Body() body: CreateOpportunityDto){
    return this.opportunitiesService.create(body)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateOpportunityDto,) {
    return this.opportunitiesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.opportunitiesService.remove(id);
  }
}
