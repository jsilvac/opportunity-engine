import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Opportunity } from './opportunity.entity';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { ScoringConfig } from './scoring-config.entity';
import { ProductsModule } from 'src/products/products.module';
import { DataSourcesModule } from 'src/data-sources/data-sources.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Opportunity, ScoringConfig]),
    ProductsModule,
    DataSourcesModule, //
  ],
  exports: [TypeOrmModule],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
})
export class OpportunitiesModule {}