import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './account/account.entity.js';
import { Session } from './session/session.entity.js';
import { User } from './user/user.entity.js';
import { Verification } from './verification/verification.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account, Session, Verification]),
  ],
  exports: [TypeOrmModule],
})
export class IdentityModule {}
