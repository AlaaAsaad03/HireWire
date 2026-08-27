import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist/config.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS dynamically for Vercel, is-a.dev, localhost, and custom frontend URLs
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman or server-to-server)
      if (!origin) return callback(null, true);

      const isAllowed =
        origin.includes('localhost') ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.is-a.dev') ||
        (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL);

      if (isAllowed) {
        callback(null, true);
      } else {
        // Fallback allow to prevent strict CORS blocks in production
        callback(null, true);
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
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