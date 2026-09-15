import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Account } from '../identity/account/account.entity.js';
import { Session } from '../identity/session/session.entity.js';
import { User } from '../identity/user/user.entity.js';
import { Verification } from '../identity/verification/verification.entity.js';

// Load environment variables from .env file if done locally of course
config();

const dataSource = new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),

  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  synchronize: false, // Must be false in production to prevent data loss

  // Explicit entity list (preferred): no path magic, identical behavior
  // under ts-node, compiled dist, and every OS. Add new entities here.
  entities: [User, Account, Session, Verification],

  // Alternative: glob discovery but we suggest the
  // manual imports above.
  // entities: ['src/**/*.entity.{js,ts}'],

  migrations: ['src/migrations/*.{js,ts}'],
  migrationsRun: false, // We will run it on our CI/CD pipeline, not on app boot
});

export default dataSource;
