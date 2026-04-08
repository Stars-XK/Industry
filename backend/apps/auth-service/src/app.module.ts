import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { MenuModule } from './menu/menu.module';
import { SystemModule } from './system/system.module';
import { AuditLogInterceptor } from '@app/common';
import { AuditLog } from '@app/entities/audit-log.entity';
import { DeptController } from './system/dept.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || '139.224.26.134',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || 'Industry',
      password: process.env.DB_PWD || 'nDTe2mNcSMadmY3S',
      database: process.env.DB_NAME || 'Industry',
      autoLoadEntities: true,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([AuditLog]),
    AuthModule,
    MenuModule,
    SystemModule,
  ],
  controllers: [DeptController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
