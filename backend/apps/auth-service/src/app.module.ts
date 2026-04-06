import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { MenuModule } from './menu/menu.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST || 'localhost',
      port: parseInt(process.env.PG_PORT || '5432', 10),
      username: process.env.PG_USER || 'postgres',
      password: process.env.PG_PASSWORD || 'postgres',
      database: process.env.PG_DATABASE || 'postgres',
      autoLoadEntities: true,
      synchronize: false, // 严格遵循规范：禁用自动同步，依赖 SQL 脚本初始化
    }),
    AuthModule,
    MenuModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
