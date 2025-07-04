import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/user.module';
//config
import appConfig, { validationSchema } from './configs/env.config';
//middlewares
import { RouteLoggerMiddleware } from './common/middlewares/logger.middleware';
import { CorsMiddleware } from './common/middlewares/cors.middleware';
//setup typeorm
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './configs/typeorm.config';
import { DatalogModule } from './datalog/datalog.module';
import { AuthModule } from './auth/auth.module';
import { SimsModule } from './sims/sims.module';
import { SettingsModule } from './settings/settings.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UserPreferenceModule } from './user-preference/user-preference.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    UserModule,
    DatalogModule,
    AuthModule,
    SimsModule,
    SettingsModule,
    OnboardingModule,
    AnalyticsModule,
    UserPreferenceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    console.log('Configuring middlewares...');
    // Apply middlewares globally
    consumer.apply(RouteLoggerMiddleware).forRoutes('*');
    consumer.apply(CorsMiddleware).forRoutes('*');
  }
}
