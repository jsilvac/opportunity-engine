import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSignal } from './product-signal.entity';

@Injectable()
export class ProductSignalService {
  constructor(
    @InjectRepository(ProductSignal)
    private repo: Repository<ProductSignal>,
  ) {}

  async create(signalData: Partial<ProductSignal>) {
    const signal = this.repo.create(signalData);
    return this.repo.save(signal);
  }
}