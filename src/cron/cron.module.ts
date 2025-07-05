import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataLog } from 'src/entities/datalog.entity';
import { User } from 'src/entities/user.entity';
import { Setting } from 'src/entities/setting.entity';
import { CronService } from './cron.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    TypeOrmModule.forFeature([DataLog, User, Setting]),
  ],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
