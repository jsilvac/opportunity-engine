import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Opportunity } from './opportunity.entity';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { ScoringConfig } from './scoring-config.entity';

import { ProductsService } from '../products/products.service';
import { ProductSignalService } from '../products/products-signal.service';

@Injectable()
export class OpportunitiesService {

  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,

    @InjectRepository(ScoringConfig)
    private readonly scoringConfigRepository: Repository<ScoringConfig>,

    private productsService: ProductsService,
    private productSignalService: ProductSignalService,
  ) {}

  // ===============================
  // 📌 LISTAR CON PAGINACIÓN
  // ===============================
  async findAll(page = 1, limit = 10, active?: boolean) {
    const skip = (page - 1) * limit;

    const where = active !== undefined ? { active } : {};

    const [data, total] = await this.opportunityRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['product'],
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  // ===============================
  // 📌 CREAR (SIN LÓGICA EXTERNA)
  // ===============================
  async create(data: any) {

    const {
      keyword,
      category,
      trendScore,
      demandScore,
      competitionScore,
      marginScore,
    } = data;

    // 1️⃣ Crear o buscar producto
    const product = await this.productsService.findOrCreate(keyword, category);

    // 2️⃣ Guardar señales (histórico)
    await this.productSignalService.create({
      product,
      trendScore,
      demandScore,
      competitionScore,
      marginScore,
    });

    // 3️⃣ Crear oportunidad base
    let opportunity = this.opportunityRepository.create({
      product,
      overallScore: 0,
      decision: 'PENDING',
    });

    // 4️⃣ Calcular score final
    opportunity = await this.calculateScores(opportunity, {
      trendScore,
      demandScore,
      competitionScore,
      marginScore,
    });

    // 5️⃣ Guardar
    return this.opportunityRepository.save(opportunity);
  }

  // ===============================
  // 📌 ACTUALIZAR
  // ===============================
  async update(id: number, data: UpdateOpportunityDto) {
    await this.opportunityRepository.update(id, data);
    return this.opportunityRepository.findOneBy({ id });
  }

  // ===============================
  // 📌 ELIMINAR
  // ===============================
  async remove(id: number) {
    await this.opportunityRepository.delete(id);
    return { deleted: true };
  }

  // ===============================
  // 🧠 SCORE FINAL (CORE DEL NEGOCIO)
  // ===============================
  private async calculateScores(
    opportunity: Opportunity,
    scores: {
      trendScore: number;
      demandScore: number;
      competitionScore: number;
      marginScore: number;
    }
  ): Promise<Opportunity> {

    // 1️⃣ Configuración dinámica
    let config = await this.scoringConfigRepository.findOneBy({ id: 1 });

    if (!config) {
      config = this.scoringConfigRepository.create({});
      config = await this.scoringConfigRepository.save(config);
    }

    // 2️⃣ Normalizar valores (0–100)
    const normalize = (value: number) =>
      Math.max(0, Math.min(100, value));

    const trend = normalize(scores.trendScore);
    const demand = normalize(scores.demandScore);
    const competition = normalize(scores.competitionScore);
    const margin = normalize(scores.marginScore);

    // 3️⃣ Peso total (evita división por 0)
    const totalWeight =
      config.trendWeight +
      config.demandWeight +
      config.marginWeight +
      config.competitionWeight || 1;

    // 4️⃣ Fórmula de negocio (MUY importante)
    opportunity.overallScore =
      (
        trend * config.trendWeight +
        demand * config.demandWeight +
        margin * config.marginWeight +
        (100 - competition) * config.competitionWeight
      ) / totalWeight;

    // 5️⃣ Decisión automática
    if (opportunity.overallScore > config.highThreshold) {
      opportunity.decision = 'HIGH';
    } else if (opportunity.overallScore > config.testThreshold) {
      opportunity.decision = 'TEST';
    } else {
      opportunity.decision = 'DISCARD';
    }

    return opportunity;
  }
}