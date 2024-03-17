import { Injectable } from "@nestjs/common";
import type {
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from "@nestjs/typeorm";
import { Account } from "@src/module/account/entity";
import { Role } from "@src/module/account/module/role/entity";
import { UserRegisterType } from "@src/module/auth/user/entity";
import { File, FileVideo } from "@src/module/file/entity";
import { AccountUpload, UserUpload } from "@src/module/upload/entity";
import { User } from "@src/module/user/entity";
import { CollectionSubscribe } from "@src/module/video/collection-subsribe/entity";
import {
  Video,
  VideoHistory,
  VideoLike,
  VideoView,
} from "@src/module/video/video/entity";
import { VideoCollection } from "@src/module/video/video-collection/entity";
import {
  VideoComment,
  VideoCommentLike,
} from "@src/module/video/video-comment/entity";
import { VideoDanmu } from "@src/module/video/video-danmu/entity";
import {
  VideoFavorite,
  VideoRelationFavorite,
} from "@src/module/video/video-favorite/entity";
import { VideoPartition } from "@src/module/video/video-partition/entity";
import {
  VideoReply,
  VideoReplyLike,
} from "@src/module/video/video-reply/entity";
import {
  VideoCollectionRelationTag,
  VideoRelationTag,
  VideoTag,
} from "@src/module/video/video-tag/entity";
import { readFileData } from "@src/utils/tools";
import {
  ApplyRegister,
  ApprovalRegister,
} from "src/module/auth/account/entity";
import type { DataSourceOptions } from "typeorm";

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
  FileVideo,
];

/**
 * 数据库连接配置项工厂函数
 */
export const databaseConfigFactory = async (): Promise<DataSourceOptions> => {
  const username = await readFileData(process.env.DATABASE_USER_PATH, true);
  const password = await readFileData(process.env.DATABASE_PASSWORD_PATH, true);
  return {
    type: "mysql",
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username,
    password,
    database: process.env.DATABASE_NAME,
    synchronize: process.env.NODE_ENV === "development", // 生产环境禁用!!
    logging: true,
    entities, // 在此声明所有实体
    subscribers: [],
    migrations: [],
  };
};

/**
 * TypeORM配置项
 */
@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    return await databaseConfigFactory();
  }
}
