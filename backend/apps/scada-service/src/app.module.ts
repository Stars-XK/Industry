import * as dotenv from 'dotenv';
dotenv.config();

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { TransformInterceptor, JwtStrategy, AuditLogInterceptor } from '@app/common';
import { TopologyController } from './topology/topology.controller';
import { HmiController } from './hmi/hmi.controller';
import { SecurityController } from './security/security.controller';
import { HmiGateway } from './hmi/hmi.gateway';
import { DmaZone } from '../../../libs/entities/src/dma-zone.entity';
import { AstDevice } from '../../../libs/entities/src/ast-device.entity';
import { AuditLog } from '../../../libs/entities/src/audit-log.entity';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || '139.224.26.134',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || 'Industry',
      password: process.env.DB_PWD || 'nDTe2mNcSMadmY3S',
      database: process.env.DB_NAME || 'Industry',
      autoLoadEntities: true,
      synchronize: false,
      keepConnectionAlive: true,
      extra: { connectionLimit: 10, enableKeepAlive: true, keepAliveInitialDelay: 10000 },
    }),
    TypeOrmModule.forFeature([DmaZone, AstDevice, AuditLog])
  ],
  controllers: [TopologyController, HmiController, SecurityController],
  providers: [
    JwtStrategy,
    HmiGateway,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    }
  ],
})
export class AppModule {}
