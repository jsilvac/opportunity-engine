import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Opportunity } from './opportunity.entity';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { ScoringConfig } from './scoring-config.entity';
import { ProductsModule } from 'src/products/products.module';
import { DataSourcesModule } from 'src/data-sources/data-sources.module';
import { OpportunityGeneratorService } from './opportunity-generator.service';
import { GoogleTrendsModule } from 'src/data-sources/google-trends/google-trends.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Opportunity, ScoringConfig]),
    ProductsModule,
    DataSourcesModule,
    GoogleTrendsModule,
  ],
  exports: [TypeOrmModule],
  controllers: [OpportunitiesController],
  providers: [
    OpportunitiesService,
    OpportunityGeneratorService,
  ],
})
export class OpportunitiesModule {}