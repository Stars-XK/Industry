import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AlarmController } from './alarm/alarm.controller';
import { SopController } from './sop/sop.controller';
import { OrderController } from './order/order.controller';
import { DutyController } from './order/duty.controller';
import { AlarmTaskService } from './tasks/alarm.task';
import { InventoryController } from "./inventory/inventory.controller";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || '139.224.26.134',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USERNAME || 'Industry',
      password: process.env.DB_PASSWORD || 'nDTe2mNcSMadmY3S',
      database: process.env.DB_DATABASE || 'Industry',
      synchronize: false,
      keepConnectionAlive: true,
      extra: { connectionLimit: 10, enableKeepAlive: true, keepAliveInitialDelay: 10000 },
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AlarmController, SopController, OrderController, DutyController, InventoryController],
  providers: [AlarmTaskService],
})
export class AppModule {}
