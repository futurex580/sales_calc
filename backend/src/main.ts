import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so the React frontend can talk to the NestJS backend
  app.enableCors();

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
