import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { TransformInterceptor, JwtStrategy } from '@app/common';
import { EdgeTagController } from './edge-tag/edge-tag.controller';
import { IotTagMapping } from '../../../libs/entities/src/iot-tag-mapping.entity';

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
    }),
    TypeOrmModule.forFeature([IotTagMapping])
  ],
  controllers: [EdgeTagController],
  providers: [
    JwtStrategy,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    }
  ],
})
export class AppModule {}
