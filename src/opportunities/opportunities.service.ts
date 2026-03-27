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
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  // ===============================
  // 📌 CREAR CON SCORING AUTOMÁTICO
  // ===============================
  async create(data: any) {

    const { keyword, category } = data;

    // 1️⃣ PRODUCTO
    const product = await this.productsService.findOrCreate(keyword, category);

    // 2️⃣ SEÑALES (simulación por ahora)
    const trendScore = Math.random() * 100;
    const demandScore = Math.random() * 100;
    const competitionScore = Math.random() * 100;
    const marginScore = Math.random() * 100;

    // 3️⃣ GUARDAR SEÑALES
    await this.productSignalService.create({
      product,
      trendScore,
      demandScore,
      competitionScore,
      marginScore,
    });

    // 4️⃣ CREAR OPORTUNIDAD VACÍA
    let opportunity = this.opportunityRepository.create({
      product,
      overallScore:0,
      decision: 'PENDING',
    } as Partial<Opportunity>);

    // 5️⃣ CALCULAR SCORE (le pasamos los valores)
    opportunity = await this.calculateScores(opportunity, {
      trendScore,
      demandScore,
      competitionScore,
      marginScore,
    }
    );

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
  // 🧠 LÓGICA DE NEGOCIO (PRIVADA)
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

  // 1️⃣ Obtener configuración
  let config = await this.scoringConfigRepository.findOneBy({ id: 1 });

  // Si no existe, crear por defecto
  if (!config) {
    config = this.scoringConfigRepository.create({});
    config = await this.scoringConfigRepository.save(config);
  }

  // 2️⃣ Extraer scores desde parámetro (YA NO random aquí)
  const {
    trendScore,
    demandScore,
    competitionScore,
    marginScore,
  } = scores;

  // 3️⃣ Calcular peso total
  const totalWeight =
    config.trendWeight +
    config.demandWeight +
    config.marginWeight +
    config.competitionWeight;

  // 4️⃣ Calcular score final
  opportunity.overallScore =
    (
      trendScore * config.trendWeight +
      demandScore * config.demandWeight +
      marginScore * config.marginWeight -
      competitionScore * config.competitionWeight
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