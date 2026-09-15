import type { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

// Docs paths served by this service (kept out of search indexes and AI crawls).
const DOCS_PATHS = ['/api', '/api-json', '/reference', '/api/auth/reference'];

// Tells indexers: don't index, don't follow, don't archive/snippet, don't train.
const NO_INDEX_TAG = 'noindex, nofollow, noarchive, nosnippet, noai';

// Minimal structural typing: true on Express and on Fastify (middie),
// without importing either framework's types into this adapter-agnostic lib.
// NOTE: plain Node ServerResponse API only (setHeader) — Express-only
// helpers like res.send do not exist under middie and 500.
interface DocsMiddlewareResponse {
  setHeader(name: string, value: string): void;
}

export function configOpenAPI(app: INestApplication): void {
   const config = new DocumentBuilder()
    .setTitle('Title Placeholder')
    .setDescription('Insert Description')
    .setVersion('1.0')
    .addTag('description')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // Indexers: per-response header as belt-and-suspenders on our own routes.
  // Registered BEFORE the Scalar handler: middleware runs in registration
  // order, and Scalar ends the response (never calls next()), so anything
  // registered after it would never execute for /reference.
  for (const path of DOCS_PATHS) {
    app.use(
      path,
      (_req: unknown, res: DocsMiddlewareResponse, next: () => void) => {
        res.setHeader('X-Robots-Tag', NO_INDEX_TAG);
        next();
      },
    );
  }

  // Same spec, modern skin (requires withFastify on the Fastify adapter).
  app.use('/reference', apiReference({ content: documentFactory(), withFastify: true }));
}


/**
 * Please insert the documentation at the controller level once this is setup!
 */