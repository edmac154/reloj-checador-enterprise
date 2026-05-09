import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';

import {
  ValidationPipe,
} from '@nestjs/common';

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

  const config =
    new DocumentBuilder()
      .setTitle(
        'Auth Service',
      )
      .setDescription(
        'Enterprise Authentication Service',
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

  app.enableCors({
    origin: '*',
  });

  await app.listen(
    process.env.PORT || 3001,
  );

  console.log(
    `Auth Service running on: ${await app.getUrl()}`,
  );
}

bootstrap();