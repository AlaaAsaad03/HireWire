import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist/config.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for both local dev and production
  const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  ConfigModule.forRoot({
    isGlobal: true,
  });

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Backend running on port ${port}`);
}
bootstrap();