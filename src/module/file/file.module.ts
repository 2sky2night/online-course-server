import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { File } from "@src/module/file/entity";
import { FileService } from "@src/module/file/service";

/**
 * 文件模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([File])],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}