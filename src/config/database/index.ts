import { Injectable } from "@nestjs/common";
import type { DataSourceOptions } from "typeorm";
import type {
  TypeOrmOptionsFactory,
  TypeOrmModuleOptions,
} from "@nestjs/typeorm";
import { Role } from "@src/module/account/module/role/entity";
import { Account } from "@src/module/account/entity";
import {
  ApplyRegister,
  ApprovalRegister,
} from "src/module/auth/account/entity";
import { User } from "@src/module/user/entity";
import { UserRegisterType } from "@src/module/auth/user/entity";
import { AccountUpload, UserUpload } from "@src/module/upload/entity";
import {
  Video,
  VideoHistory,
  VideoLike,
  VideoView,
} from "@src/module/video/video/entity";
import { VideoCollection } from "@src/module/video/video-collection/entity";
import { File } from "@src/module/file/entity";
import {
  VideoComment,
  VideoCommentLike,
} from "@src/module/video/video-comment/entity";
import {
  VideoReply,
  VideoReplyLike,
} from "@src/module/video/video-reply/entity";
import { VideoPartition } from "@src/module/video/video-partition/entity";
import {
  VideoCollectionRelationTag,
  VideoRelationTag,
  VideoTag,
} from "@src/module/video/video-tag/entity";
import {
  VideoFavorite,
  VideoRelationFavorite,
} from "@src/module/video/video-favorite/entity";
import { CollectionSubscribe } from "@src/module/video/collection-subsribe/entity";
import { VideoDanmu } from "@src/module/video/video-danmu/entity";

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
  UserUpload,
  AccountUpload,
  Video,
  VideoCollection,
  File,
  VideoView,
  VideoHistory,
  VideoLike,
  VideoComment,
  VideoCommentLike,
  VideoReply,
  VideoReplyLike,
  VideoPartition,
  VideoTag,
  VideoRelationTag,
  VideoCollectionRelationTag,
  VideoFavorite,
  VideoRelationFavorite,
  CollectionSubscribe,
  VideoDanmu,
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
