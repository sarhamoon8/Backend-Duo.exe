import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './shared/infrastructure/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.enableShutdownHooks();
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('FilaCero API')
    .setDescription(
      'API del backend de FilaCero: gestión de turnos y seguimiento de ' +
        'dispensación de medicamentos. Para probar un endpoint protegido, ' +
        'usa POST /auth/login o /auth/register para obtener un token y ' +
        "pégalo en el botón 'Authorize' (esquema Bearer).",
    )
    .setVersion('0.1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addTag('auth', 'Registro, login y emisión de tokens')
    .addTag('usuarios', 'Gestión de usuarios')
    .addTag('entidades-medicas', 'Catálogo de instituciones de salud (EPS/IPS)')
    .addTag('puntos-dispensacion', 'Sedes físicas de una entidad médica')
    .addTag('ventanillas', 'Módulos de atención de un punto de dispensación')
    .addTag('servicios', 'Servicios de dispensación ofrecidos')
    .addTag('turnos', 'Solicitud y gestión de turnos')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
