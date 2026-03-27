import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductSignal } from "./product-signal.entity";
import { Product } from "./product.entity";
import { ProductSignalService } from "./products-signal.service";
import { ProductsService } from "./products.service";
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductSignal])],
  providers: [ProductsService, ProductSignalService],
  exports: [ProductsService, ProductSignalService],
})
export class ProductsModule {}