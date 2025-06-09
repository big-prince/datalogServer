/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const dotenv = require('dotenv');
const { DataSource } = require('typeorm');
const { User } = require('./entities/user.entity');
const { Sim } = require('./entities/sim.entity');
const { DataLog } = require('./entities/datalog.entity');
const { Setting } = require('./entities/setting.entity');
const { Token } = require('./entities/token.entity');

dotenv.config();
const AppDataSource = new DataSource({
  type: 'postgres',
  url:
    process.env.DATABASE_URL ||
    'postgresql://postgres:dream831@localhost:5432/datalogdb?schema=public',
  entities: [User, Sim, DataLog, Setting, Token],
  migrations:
    process.env.NODE_ENV === 'production'
      ? ['dist/migrations/*{.ts,.js}']
      : ['src/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development',
  migrationRun: false,
});

module.exports = AppDataSource;
