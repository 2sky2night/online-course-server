import { Injectable } from "@nestjs/common";
import type { DataSourceOptions } from "typeorm";
import type {
  TypeOrmOptionsFactory,
  TypeOrmModuleOptions,
} from "@nestjs/typeorm";
import { Role } from "@src/module/role/entity";
import { Account } from "@src/module/account/entity";
import {
  ApplyRegister,
  ApprovalRegister,
} from "src/module/auth/module/account/entity";
import { User } from "@src/module/user/entity";
import { UserRegisterType } from "@src/module/auth/module/user/entity";

/**
 * 所有实体
 */
export const entities = [
  Role,
  Account,
  ApprovalRegister,
  ApplyRegister,
  User,
  UserRegisterType,
];

/**
 * 数据库连接配置项工厂函数
 */
export const databaseConfigFactory = (): DataSourceOptions => {
  return {
    type: "mysql",
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: process.env.NODE_ENV === "development", // 生产环境禁用!!
    logging: true,
    entities, // 在此声明所有实体
    subscribers: [],
    migrations: [],
  };
};

/**
 * 数据库连接配置项(注意，此对象在根模块中引用会无法正确读取环境变量中的数据)
 */
export const databaseConfig: DataSourceOptions = {
  type: "mysql",
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: process.env.NODE_ENV === "development", // 生产环境禁用!!
  logging: true,
  entities,
  subscribers: [],
  migrations: [],
};

/**
 * TypeORM配置项
 */
@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return databaseConfigFactory();
  }
}
