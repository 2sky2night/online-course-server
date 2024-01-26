import { BadRequestException, PipeTransform } from "@nestjs/common";
import { CommonMessage } from "@src/config/message";

/**
 *  上传视频管道
 */
export class FileVideoPipe implements PipeTransform {
  transform(file?: Express.Multer.File) {
    if (file === undefined) {
      // 此字段未上传文件
      throw new BadRequestException(CommonMessage.upload_file_empty_error);
    }
    const { mimetype } = file;
    if (
      mimetype !== "video/mp4" &&
      mimetype !== "video/mpeg" &&
      mimetype !== "video/ogg" &&
      mimetype !== "video/webm"
    ) {
      // 上传文件的类型错误
      throw new BadRequestException(CommonMessage.upload_file_type_error);
    }
    return file;
  }
}
