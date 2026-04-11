import { Injectable, Logger } from '@nestjs/common';
import googleTrends from 'google-trends-api';

@Injectable()
export class GoogleTrendsService {
  private readonly logger = new Logger(GoogleTrendsService.name);

  async getRelatedKeywords(keyword: string): Promise<string[]> {
    try {
      const results = await googleTrends.relatedQueries({
        keyword,
        geo: 'CL',
      });

      const parsed = JSON.parse(results);

      const rising =
        parsed.default?.rankedList?.[0]?.rankedKeyword || [];

      return rising.map((k: any) => k.query);
    } catch (error) {
      this.logger.warn(`⚠️ Google Trends falló para "${keyword}"`);

      // 🔥 fallback dinámico según keyword
      return [
        `comprar ${keyword}`,
        `${keyword} precio`,
        `${keyword} oferta`,
        `${keyword} chile`,
        `${keyword} online`,
        `${keyword} barato`,
      ];
    }
  }
};
