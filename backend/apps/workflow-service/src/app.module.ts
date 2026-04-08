import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AlarmController } from './alarm/alarm.controller';
import { SopController } from './sop/sop.controller';
import { OrderController } from './order/order.controller';

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
    }),
  ],
  controllers: [AlarmController, SopController, OrderController],
  providers: [],
})
export class AppModule {}
