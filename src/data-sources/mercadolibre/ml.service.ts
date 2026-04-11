import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  MLSearchResult,
  MLProduct,
  MLProductAnalysis,
  MLCategory,
} from './ml.types';

@Injectable()
export class MercadoLibreService {
  private readonly logger = new Logger(MercadoLibreService.name);
  private readonly BASE_URL = 'https://api.mercadolibre.com';
  private readonly SITE_ID = 'MLC'; // Chile

  private get headers() {
    return {
      Authorization: `Bearer ${process.env.ML_ACCESS_TOKEN}`,
    };
  }

  // ===============================
  // 🔍 BUSCAR PRODUCTOS
  // ===============================
  // async searchProducts(
  //   keyword: string,
  //   limit = 50,
  // ): Promise<MLSearchResult> {
  //   try {
  //     const response = await axios.get(`${this.BASE_URL}/sites/${this.SITE_ID}/search`, {
  //       headers: {
  //       'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  //       'Accept': 'application/json',
  //       'Accept-Language': 'es-CL,es;q=0.9',
  //       },
  //       params: {
  //         q: keyword,
  //         limit: 50,
  //       },
  //     });
  //     return response.data as MLSearchResult;
  //   } catch (error) {
  //     this.logger.error(`Error buscando "${keyword}" en MercadoLibre`, error);
  //     throw error;
  //   }
  // }

  async searchProducts(keyword: string, limit = 50): Promise<MLSearchResult> {
  try {
    const response = await axios.get(`${this.BASE_URL}/sites/${this.SITE_ID}/search`, {
      headers: this.headers,
      params: {
        q: keyword,
        limit,
      },
    });

    return response.data as MLSearchResult;

  } catch (error) {
    this.logger.warn(`⚠️ ML falló para "${keyword}"`);

    return {
      query: keyword,
      paging: { total: 0, offset: 0, limit: 0 },
      results: [],
    };
  }
  }

  // ===============================
  // 📊 ANALIZAR OPORTUNIDAD
  // ===============================
  async analyzeKeyword(keyword: string): Promise<MLProductAnalysis> {
    const searchResult = await this.searchProducts(keyword, 50);
    const products = searchResult.results;

    if (!products || products.length === 0) {
      return this.emptyAnalysis(keyword);
    }

    // — Precios —
    const prices = products.map((p) => p.price).filter((p) => p > 0);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // — Envío gratis —
    const freeShipping = products.filter((p) => p.shipping?.free_shipping).length;
    const freeShippingPercent = (freeShipping / products.length) * 100;

    // — Condición nuevo —
    const newCondition = products.filter((p) => p.condition === 'new').length;
    const newConditionPercent = (newCondition / products.length) * 100;

    // — Vendedores únicos —
    const uniqueSellers = new Set(products.map((p) => p.seller?.id)).size;

    // — Total listings —
    const totalListings = searchResult.paging.total;

    // ===============================
    // 🧠 CALCULAR SCORES (0-100)
    // ===============================

    // Demanda: más listings = más demanda, cap en 100
    const demandScore = Math.min((totalListings / 1000) * 100, 100);

    // Competencia: muchos vendedores únicos = más competencia (invertido)
    const competitionScore = Math.min((uniqueSellers / 50) * 100, 100);

    // Margen estimado: precio promedio alto + envío gratis disponible = mejor margen
    const priceScore = Math.min((avgPrice / 50000) * 100, 100);
    const marginScore = (priceScore + freeShippingPercent) / 2;

    // Demanda estimada (productos con sold_quantity > 0)
    const withSales = products.filter((p) => p.sold_quantity > 0).length;
    const estimatedDemand = (withSales / products.length) * 100;

    return {
      keyword,
      totalListings,
      avgPrice: Math.round(avgPrice),
      minPrice,
      maxPrice,
      freeShippingPercent: Math.round(freeShippingPercent),
      newConditionPercent: Math.round(newConditionPercent),
      topSellers: uniqueSellers,
      estimatedDemand: Math.round(estimatedDemand),
      competitionScore: Math.round(competitionScore),
      marginScore: Math.round(marginScore),
      demandScore: Math.round(demandScore),
      rawResults: products,
    };
  }

  // ===============================
  // 🔥 TOP CATEGORÍAS CHILE
  // ===============================
  async getTopCategories(): Promise<MLCategory[]> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/sites/${this.SITE_ID}/categories`,
        { headers: this.headers},
      );
      return response.data as MLCategory[];
    } catch (error) {
      this.logger.error('Error obteniendo categorías', error);
      throw error;
    }
  }

    // ===============================
    // 📈 TRENDING ITEMS (sin auth)
    // ===============================
    async getTrendingItems(categoryId?: string): Promise<any[]> {
        try {
            // Usamos búsquedas populares en lugar del endpoint trends
            const keywords = [
            'tecnologia', 'ropa', 'hogar', 
            'deportes', 'belleza', 'juguetes'
            ];

            const category = categoryId || keywords[Math.floor(Math.random() * keywords.length)];

            const response = await axios.get(
            `${this.BASE_URL}/sites/${this.SITE_ID}/search`,
            {
              headers: this.headers,
              params: {
              q: category,
              sort: 'relevance',
              limit: 20
              },
            }
            );

            // Retornamos los más relevantes formateados
            return response.data.results.map((p: MLProduct) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            sold_quantity: p.sold_quantity,
            free_shipping: p.shipping?.free_shipping,
            permalink: p.permalink,
            }));

        } catch (error) {
            this.logger.error('Error obteniendo trending items', error);
            throw error;
        }
    }
  // ===============================
  // 🛡️ ANÁLISIS VACÍO (fallback)
  // ===============================
  private emptyAnalysis(keyword: string): MLProductAnalysis {
    return {
      keyword,
      totalListings: 0,
      avgPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      freeShippingPercent: 0,
      newConditionPercent: 0,
      topSellers: 0,
      estimatedDemand: 0,
      competitionScore: 0,
      marginScore: 0,
      demandScore: 0,
      rawResults: [],
    };
  }
}