import { betterAuth } from 'better-auth';
import { openAPI } from 'better-auth/plugins';
import { typeormAdapter } from '@hedystia/better-auth-typeorm';
import dataSource from '../database/typeorm.config.js';
import { AuthModule } from '@thallesp/nestjs-better-auth';

if (!dataSource.isInitialized) {
  await dataSource.initialize();
}

const auth = betterAuth({
  database: typeormAdapter(dataSource),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    // Serves a Scalar reference UI at /api/auth/reference plus machine-readable
    // schema at /api/auth/open-api/generate-schema (Nest Swagger can't see
    // middleware-mounted routes, so this is how auth endpoints get docs).
    openAPI(),
  ],
  user: {
    // Self-serve account deletion (no verification-email sender wired yet,
    // so this deletes directly after password confirmation).
    deleteUser: { enabled: true },
  },
  advanced: {
    database: {
      // Our PK columns are uuid; without this Better Auth mints nanoid-style
      // ids that Postgres rejects with "invalid input syntax for type uuid".
      generateId: 'uuid',
    },
  },
});

export const BetterAuthModule = AuthModule.forRoot({
  auth,
  bodyParser: {
    json: { limit: '2mb' },
    urlencoded: { limit: '2mb', extended: true },
    rawBody: true,
  },
});
