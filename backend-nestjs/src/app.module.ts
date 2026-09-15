import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { IdentityModule } from './identity/identity.module.js';
import { BetterAuthModule } from './lib/better-auth.js';

@Module({
  imports: [
    DatabaseModule,
    IdentityModule,
    BetterAuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
