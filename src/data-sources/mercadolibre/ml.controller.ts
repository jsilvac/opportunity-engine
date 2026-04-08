import { Controller, Get, Query, Param } from '@nestjs/common';
import { MercadoLibreService } from './ml.service';

@Controller('ml')
export class MercadoLibreController {

  constructor(private readonly mlService: MercadoLibreService) {}

  // GET /ml/search?q=zapatillas
  @Get('search')
  search(@Query('q') keyword: string) {
    return this.mlService.searchProducts(keyword);
  }

  // GET /ml/analyze?q=zapatillas
  @Get('analyze')
  analyze(@Query('q') keyword: string) {
    return this.mlService.analyzeKeyword(keyword);
  }

  // GET /ml/categories
  @Get('categories')
  categories() {
    return this.mlService.getTopCategories();
  }

  // GET /ml/trending
  // GET /ml/trending?category=MLC1051
  @Get('trending')
  trending(@Query('category') categoryId?: string) {
    return this.mlService.getTrendingItems(categoryId);
  }
}