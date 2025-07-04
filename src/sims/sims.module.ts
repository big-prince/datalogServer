import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { SimsController } from './sims.controller';
import { SimsService } from './sims.service';
import { Sim } from '../entities/sim.entity';
import { User } from '../entities/user.entity';
import { DatalogModule } from 'src/datalog/datalog.module';

@Module({
  imports: [TypeOrmModule.forFeature([Sim, User]), JwtModule, DatalogModule],
  controllers: [SimsController],
  providers: [SimsService],
  exports: [SimsService],
})
export class SimsModule {}
