import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Sim } from '../entities/sim.entity';
import { DataLog } from '../entities/datalog.entity';
import { Setting } from '../entities/setting.entity';
import { Token } from '../entities/token.entity';
import * as dotenv from 'dotenv';

dotenv.config();
// Centralized TypeORM configuration for Datalog
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url:
    process.env.DATABASE_URL ||
    'postgresql://postgres:dream831@localhost:5432/datalogdb?schema=public',
  entities: [User, Sim, DataLog, Setting, Token],
  synchronize: process.env.NODE_ENV === 'development',
  // logging: process.env.NODE_ENV === 'development',
  migrationsRun: false,
};
