import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@app/common';

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
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PWD || '',
      database: process.env.DB_NAME || 'scada',
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
