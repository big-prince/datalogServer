import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateDataLogDto {
  @IsNotEmpty()
  @IsUUID()
  simId: string;

  @IsNotEmpty()
  @IsString()
  source: string;

  @IsNotEmpty()
  @IsNumber()
  dataSize: number;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  validityDays: number;

  @IsNotEmpty()
  @IsDateString()
  purchaseDate: Date;

  @IsOptional()
  @IsDateString()
  expiryDate?: Date;
}

export class GetAnalyticsQueryDto {
  @IsOptional()
  @IsString()
  period?: 'week' | 'month' | 'year';

  @IsOptional()
  @IsUUID()
  simId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetDataLogsQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsUUID()
  simId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
