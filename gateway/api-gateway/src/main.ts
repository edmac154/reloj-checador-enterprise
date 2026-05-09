import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import helmet from 'helmet';

import rateLimit from 'express-rate-limit';

import {
  ValidationPipe,
} from '@nestjs/common';

import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';

async function bootstrap() {
  const app =
    await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,

      forbidNonWhitelisted: true,

      transform: true,
    }),
  );

  app.use(
    helmet(),
  );

  app.use(
    rateLimit({
      windowMs:
        15 * 60 * 1000,

      max: 1000,
    }),
  );

  app.enableCors({
    origin: '*',
  });

  const config =
    new DocumentBuilder()
      .setTitle(
        'Reloj Checador API',
      )
      .setDescription(
        'Enterprise Attendance API Gateway',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();

  const document =
    SwaggerModule.createDocument(
      app,
      config,
    );

  SwaggerModule.setup(
    'docs',
    app,
    document,
  );

  await app.listen(
    process.env.PORT || 3000,
  );

  console.log(
    `Gateway running on: ${await app.getUrl()}`,
  );
}

bootstrap();