import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import metadata from './metadata';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = parseInt(process.env.PORT, 10) || 3000

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  await SwaggerModule.loadPluginMetadata(metadata);
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(PORT);
}
bootstrap();
