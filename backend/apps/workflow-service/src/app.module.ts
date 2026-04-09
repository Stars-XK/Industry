import * as dotenv from 'dotenv';
dotenv.config();

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@app/common';
import { TDengineModule } from '@app/database';

import { AlarmController } from './alarm/alarm.controller';
import { SopController } from './sop/sop.controller';
import { OrderController } from './order/order.controller';
import { DutyController } from './order/duty.controller';
import { AlarmTaskService } from './tasks/alarm.task';
import { InventoryController } from "./inventory/inventory.controller";
import { AigcController } from './aigc/aigc.controller';

@Module({
  imports: [
    PassportModule,
    TDengineModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || '139.224.26.134',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || 'Industry',
      password: process.env.DB_PWD || 'nDTe2mNcSMadmY3S',
      database: process.env.DB_NAME || 'Industry',
      synchronize: false,
      keepConnectionAlive: true,
      extra: { connectionLimit: 10, enableKeepAlive: true, keepAliveInitialDelay: 10000 },
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AlarmController, SopController, OrderController, DutyController, InventoryController, AigcController],
  providers: [AlarmTaskService, JwtStrategy],
})
export class AppModule {}
