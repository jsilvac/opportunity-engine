import { Injectable } from '@nestjs/common';
import { GoogleTrendsService } from '../data-sources/google-trends/google-trends.service';
import { OpportunitiesService } from './opportunities.service';

@Injectable()
export class OpportunityGeneratorService {

  constructor(
    private readonly trendsService: GoogleTrendsService,
    private readonly opportunitiesService: OpportunitiesService,
  ) {}

  // 🎯 MÉTODO PRINCIPAL
  async generateFromKeyword(baseKeyword: string) {

    const keywords = await this.trendsService.getRelatedKeywords(baseKeyword);

//    console.log('RAW KEYWORDS:', keywords);

    const filtered = keywords.filter(this.isValidKeyword);

    console.log('FILTERED:', filtered);

    for (const keyword of filtered) {

      const trendScore = this.calculateTrend(keyword);
      const demandScore = this.calculateDemand(keyword);
      const competitionScore = this.calculateCompetition(keyword);
      const marginScore = this.calculateMargin(keyword);

      const result = await this.opportunitiesService.create({
        keyword,
        category: baseKeyword,
        trendScore,
        demandScore,
        competitionScore,
        marginScore,
      });

      console.log('RAW KEYWORDS:', keywords);

      // 🔥 SOLO GUARDAR HIGH
      if (result.decision  === 'DISCARD') {
        await this.opportunitiesService.remove(result.id);
      }
    }

    return {
      total: keywords.length,
      filtered: filtered.length,
    };
  }

  // ===============================
  // 🧠 FILTRO
  // ===============================
  private isValidKeyword(keyword: string): boolean {

  const invalidWords = [
    'registro',
    'pelicula',
    'club',
    'bayer',
    'vida secreta',
    'cancer',
    'frases',
    'poemas',
    'dia',
  ];

  const lower = keyword.toLowerCase();

  // ❌ basura
  if (invalidWords.some(word => lower.includes(word))) {
      return false;
    }

    // 🔥 SOLO keywords con intención o producto
    const hasIntent =
      lower.includes('comprar') ||
      lower.includes('precio') ||
      lower.includes('oferta');

    const hasProduct =
      lower.includes('perro') ||
      lower.includes('mascota') ||
      lower.includes('juguete') ||
      lower.includes('cepillo') ||
      lower.includes('collar') ||
      lower.includes('arnes');

    return hasIntent || hasProduct;
  }

  // ===============================
  // 🧠 SCORING (MEJORADO)
  // ===============================

  private calculateTrend(keyword: string): number {
    let score = 50;

    if (keyword.length > 15) score += 10;
    if (keyword.split(' ').length >= 3) score += 10;

    return score;
  }

  private calculateDemand(keyword: string): number {
    let score = 50;

    const highIntent = ['comprar', 'precio', 'oferta', 'envio'];
    const productWords = ['alimento', 'juguete', 'cepillo', 'collar', 'arnes'];

    if (highIntent.some(w => keyword.includes(w))) score += 30;
    if (productWords.some(w => keyword.includes(w))) score += 20;

    return score;
  }

  private calculateCompetition(keyword: string): number {
    let score = 40;

    const highCompetition = ['tienda', 'mercado', 'online'];

    if (highCompetition.some(w => keyword.includes(w))) score += 30;

    return score;
  }

  private calculateMargin(keyword: string): number {
    let score = 50;

    if (keyword.includes('juguete')) score += 20;
    if (keyword.includes('accesorio')) score += 15;
    if (keyword.includes('alimento')) score -= 10;

    return score;
  }
}