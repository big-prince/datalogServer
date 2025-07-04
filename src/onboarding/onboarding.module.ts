import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OnboardingController } from './onboarding.controller';
import { SimsModule } from '../sims/sims.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SimsModule, SettingsModule, JwtModule],
  controllers: [OnboardingController],
})
export class OnboardingModule {}

