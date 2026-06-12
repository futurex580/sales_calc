import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <-- Tambahkan Import ini

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so the React frontend can talk to the NestJS backend
  app.enableCors();

  // Aktifkan Validasi Global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Membuang properti yang tidak ada di DTO
    forbidNonWhitelisted: true, // Menolak jika ada properti asing
    transform: true, // Otomatis mengonversi tipe data
  }));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
