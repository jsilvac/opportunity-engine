import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { ProductsModule } from './products/products.module';
import { DataSourcesModule } from './data-sources/data-sources.module';
import { GoogleTrendsModule } from './data-sources/google-trends/google-trends.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'opportunity-db',
      port: 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'opportunity',
      autoLoadEntities: true,
      synchronize: true,
          
      retryAttempts: 10,
      retryDelay: 3000,
    }),
    ProductsModule,
    OpportunitiesModule,
    DataSourcesModule,
    GoogleTrendsModule,
  ],
})
export class AppModule {}

