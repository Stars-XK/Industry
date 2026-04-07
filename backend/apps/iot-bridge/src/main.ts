import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as aedes from 'aedes';
import * as net from 'net';

async function bootstrap() {
  if (process.env.MQTT_ENABLED === '1') {
    // Start built-in Aedes MQTT Broker using the new factory function approach
    const broker = (aedes as any).createBroker ? (aedes as any).createBroker() : (aedes as any)();
    const server = net.createServer(broker.handle);
    const MQTT_PORT = process.env.MQTT_PORT ? parseInt(process.env.MQTT_PORT, 10) : 1883;

    // 添加 Broker 的基础认证逻辑
    broker.authenticate = (client, username, password, callback) => {
      const envUser = process.env.MQTT_USERNAME;
      const envPass = process.env.MQTT_PASSWORD;
      
      // 如果没有配置用户名密码，则允许匿名接入
      if (!envUser) {
        return callback(null, true);
      }
      
      if (username === envUser && password && password.toString() === envPass) {
        callback(null, true);
      } else {
        const error = new Error('Auth error');
        (error as any).returnCode = 4;
        callback(error, null);
      }
    };

    server.listen(MQTT_PORT, function () {
      console.log(`[MQTT Broker] Aedes is running and listening on port: ${MQTT_PORT}`);
    });

    broker.on('client', (client) => {
      console.log(`[MQTT Broker] Client Connected: ${client ? client.id : client}`);
    });

    broker.on('clientDisconnect', (client) => {
      console.log(`[MQTT Broker] Client Disconnected: ${client ? client.id : client}`);
    });
  } else {
    console.log('[MQTT Broker] Aedes is disabled by MQTT_ENABLED flag in .env');
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(3005);
  console.log('Microservice iot-bridge is running on port: 3005');
}
bootstrap();
