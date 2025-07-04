import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateSimDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(['MTN', 'Glo', 'Airtel', '9mobile'], {
    message: 'Provider must be one of: MTN, Glo, Airtel, 9mobile',
  })
  provider: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class UpdateSimDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['MTN', 'Glo', 'Airtel', '9mobile'], {
    message: 'Provider must be one of: MTN, Glo, Airtel, 9mobile',
  })
  provider?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class CreateMultipleSimsDto {
  @IsNotEmpty()
  sims: CreateSimDto[];
}

