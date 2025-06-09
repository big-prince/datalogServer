import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatalogService } from './datalog.service';
import { User } from '../entities/user.entity';
import { Sim } from '../entities/sim.entity';
import { DataLog } from '../entities/datalog.entity';
import { Setting } from '../entities/setting.entity';
import { Token } from 'src/entities/token.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Sim, DataLog, Setting, Token])],
  providers: [DatalogService, JwtService, AuthService],
  exports: [DatalogService, JwtService, AuthService],
})
export class DatalogModule {}
