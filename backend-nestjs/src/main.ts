
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import { configOpenAPI } from './lib/openAPI.js';
import { configRobots } from './lib/robots.js';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      // The auth module re-adds body parsers for non-auth routes itself. (For BetterAuth)
      bodyParser: false,
    },
  );

  // Addons
  configRobots(app);
  configOpenAPI(app);


  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
