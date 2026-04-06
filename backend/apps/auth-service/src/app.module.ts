import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { MenuModule } from './menu/menu.module';
import { SystemModule } from './system/system.module';

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
      synchronize: false, // 严格遵循规范：禁用自动同步，依赖 SQL 脚本初始化
    }),
    AuthModule,
    MenuModule,
    SystemModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
