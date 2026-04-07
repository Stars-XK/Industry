import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import aedes from 'aedes';
import * as net from 'net';

async function bootstrap() {
  // Start built-in Aedes MQTT Broker
  const broker = new (aedes as any)();
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

  const app = await NestFactory.create(AppModule);
  await app.listen(3005);
  console.log('Microservice iot-bridge is running on port: 3005');
}
bootstrap();
