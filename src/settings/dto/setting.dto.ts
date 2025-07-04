import { IsNumber, IsOptional, IsEnum, IsObject, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class NotificationSettingsDto {
  @IsBoolean()
  expiryReminders: boolean;

  @IsBoolean()
  highUsageWarnings: boolean;

  @IsBoolean()
  usageSummaries: boolean;
}

export class CreateSettingDto {
  @IsOptional()
  @IsNumber({}, { message: 'Daily usage estimate must be a number' })
  dailyUsageEstimate?: number;

  @IsOptional()
  @IsEnum(['GB', 'MB'], {
    message: 'Usage unit must be either GB or MB',
  })
  usageUnit?: 'GB' | 'MB';

  @IsOptional()
  @IsEnum(['GB', 'MB'], {
    message: 'Preferred display unit must be either GB or MB',
  })
  preferredDisplayUnit?: 'GB' | 'MB';

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notifications?: NotificationSettingsDto;
}

export class UpdateSettingDto {
  @IsOptional()
  @IsNumber({}, { message: 'Daily usage estimate must be a number' })
  dailyUsageEstimate?: number;

  @IsOptional()
  @IsEnum(['GB', 'MB'], {
    message: 'Usage unit must be either GB or MB',
  })
  usageUnit?: 'GB' | 'MB';

  @IsOptional()
  @IsEnum(['GB', 'MB'], {
    message: 'Preferred display unit must be either GB or MB',
  })
  preferredDisplayUnit?: 'GB' | 'MB';

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notifications?: NotificationSettingsDto;
}

