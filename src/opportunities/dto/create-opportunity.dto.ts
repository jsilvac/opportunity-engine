import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateOpportunityDto {

  @IsString()
  @IsNotEmpty()
  keyword!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsOptional()
  @IsNumber()
  trendScore?: number;

  @IsOptional()
  @IsNumber()
  demandScore?: number;

  @IsOptional()
  @IsNumber()
  competitionScore?: number;

  @IsOptional()
  @IsNumber()
  marginScore?: number;

  @IsOptional()
  @IsNumber()
  overallScore?: number;

  @IsOptional()
  @IsString()
  decision?: string;
}
