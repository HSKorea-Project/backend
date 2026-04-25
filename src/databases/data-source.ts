import * as dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { Admin } from '../admin/admin.entity';
import { InquiryEntity } from '../inquiry/inquiry.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: [Admin, InquiryEntity],

  migrations: ['src/migrations/*.ts'],

  synchronize: false,
  logging: true,

  namingStrategy: new SnakeNamingStrategy(),
});