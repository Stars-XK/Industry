import { NestFactory } from '@nestjs/core';
import { AppModule } from './apps/scada-service/src/app.module';
import { AssetController } from './apps/scada-service/src/asset/asset.controller';

async function test() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const controller = app.get(AssetController);
  
  console.log('--- SITES ---');
  const sites = await controller.getSites({ page: 1, size: 20 });
  console.log(JSON.stringify(sites, null, 2));

  console.log('--- DEVICES ---');
  const devices = await controller.getDevices({ page: 1, size: 20 });
  console.log(JSON.stringify(devices, null, 2));

  console.log('--- POINTS ---');
  const points = await controller.getPoints({ page: 1, size: 20 });
  console.log(JSON.stringify(points, null, 2));

  await app.close();
}

test().catch(console.error);
