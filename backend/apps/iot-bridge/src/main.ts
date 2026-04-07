import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as aedes from 'aedes';
import * as net from 'net';

async function bootstrap() {
  if (process.env.MQTT_ENABLED === '1') {
    // Start built-in Aedes MQTT Broker using the new factory function approach
    const broker = (aedes as any).createBroker ? (aedes as any).createBroker() : (aedes as any)();
    const server = net.createServer(broker.handle);
    const MQTT_PORT = 1883;

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
