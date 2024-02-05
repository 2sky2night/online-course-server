import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { CommonMessage } from "@src/config/message";

/**
 * 文件配图管道
 */
@Injectable()
export class FileImagePipe implements PipeTransform {
  /**
   * 上传文件的最大大小(byte)
   */
  maxSize: number;

  constructor() {
    this.maxSize = Number(process.env.FILE_IMAGE_SIZE);
  }

  transform(file?: Express.Multer.File) {
    if (file === undefined) {
      // 此字段未上传文件
      throw new BadRequestException(CommonMessage.upload_file_empty_error);
    }
    if (
      file.mimetype !== "image/jpeg" &&
      file.mimetype !== "image/png" &&
      file.mimetype !== "image/webp"
    ) {
      // 上传的文件类型错误
      throw new BadRequestException(CommonMessage.upload_file_type_error);
    }
    if (file.size <= this.maxSize) {
      return file;
    } else {
      // 上传的文件超出大小
      throw new BadRequestException(CommonMessage.upload_file_size_error);
    }
  }
}
