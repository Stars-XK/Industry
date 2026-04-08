import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { TransformInterceptor, JwtStrategy } from '@app/common';
import { EdgeTagController } from './edge-tag/edge-tag.controller';
import { OverviewController } from './overview/overview.controller';
import { DashboardController } from './overview/dashboard.controller';
import { BillingController } from './billing/billing.controller';
import { AnalysisController } from './analysis/analysis.controller';
import { NrwController } from './analytics/nrw.controller';
import { PredictController } from './analysis/predict.controller';
import { GovernanceController } from './governance/governance.controller';
import { InterlockController } from './governance/interlock.controller';
import { RevenueController } from './governance/revenue.controller';
import { SensorController } from './governance/sensor.controller';
import { IntegrationController } from './governance/integration.controller';
import { IotTagMapping } from '../../../libs/entities/src/iot-tag-mapping.entity';
import { IotGateway } from '../../../libs/entities/src/iot-gateway.entity';
import { EnergyController } from './billing/energy.controller';
import { RecipeController } from './governance/recipe.controller';
import { GovernanceTaskService } from './tasks/governance.task';

@Module({
  imports: [
    PassportModule,
    ScheduleModule.forRoot(),
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
    TypeOrmModule.forFeature([IotTagMapping, IotGateway])
  ],
  controllers: [
    EdgeTagController, OverviewController, DashboardController, 
    BillingController, AnalysisController, NrwController, PredictController, 
    GovernanceController, InterlockController, RevenueController, 
    SensorController, IntegrationController, EnergyController, RecipeController
  ],
  providers: [
    JwtStrategy,
    GovernanceTaskService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    }
  ],
})
export class AppModule {}
