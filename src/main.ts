import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  // Cria a aplicação
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Config
  const configService = app.get(ConfigService);

  app.use(cookieParser());

  // Proxy
  app.set('trust proxy', 1);

  // Prefixo global
  app.setGlobalPrefix('api');

  // CORS
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS')
    ? configService
        .get<string>('ALLOWED_ORIGINS')!
        .split(',')
        .map((o) => o.trim())
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://localhost:3000',
        'https://localhost:3001',
        'http://srv1819497.hstgr.cloud/',
        'https://srv1819497.hstgr.cloud/',
      ];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger
  const isNotProduction =
    configService.get<string>('NODE_ENV') !== 'production';
  if (isNotProduction) {
    const config = new DocumentBuilder()
      .setTitle('Carona Universitária')
      .setDescription('API da Carona Universitária by Alisson e Renan')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const openApiDoc = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, cleanupOpenApiDoc(openApiDoc), {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
    console.log('Swagger UI is enabled (Development Mode)');
  }

  // Porta
  const PORT = configService.get<number>('PORT') ?? 3000;

  // Inicia o servidor (apenas uma vez)
  await app.listen(PORT);
  console.log(`🚀 Server running on http://localhost:${PORT} 🚀`);
}

void bootstrap();
