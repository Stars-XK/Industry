import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter, TransformInterceptor, AuditLogInterceptor } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 开启跨域
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // 全局注册参数校验管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 全局注册异常过滤器和拦截器
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // 配置 Swagger API 文档
  const config = new DocumentBuilder()
    .setTitle('信创工业综合治理平台 API')
    .setDescription('Auth Service API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT_AUTH_SERVICE || 3001;
  await app.listen(port);
  console.log(`Microservice auth-service is running on port: ${port}`);
  console.log(`Swagger Docs is available at: http://localhost:${port}/api/docs`);
}
bootstrap();
