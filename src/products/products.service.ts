import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private repo: Repository<Product>,
  ) {}

  async findOrCreate(keyword: string, category: string) {
    let product = await this.repo.findOne({ where: { keyword } });

    if (!product) {
      product = this.repo.create({ keyword, category });
      product = await this.repo.save(product);
    }

    return product;
  }
}