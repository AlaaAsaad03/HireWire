import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true,
  });

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
  console.log('🚀 Backend running on http://localhost:3000');
}
bootstrap();