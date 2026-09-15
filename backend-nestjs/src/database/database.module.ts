import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import datasource from './typeorm.config.js';

@Module({
  imports: [
    TypeOrmModule.forRoot(datasource.options),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}