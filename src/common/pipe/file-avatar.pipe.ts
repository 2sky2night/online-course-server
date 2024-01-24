import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import { CommonMessage } from "@src/config/message";

/**
 * 头像上传管道
 */
@Injectable()
export class FileAvatarPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    const maxSize = Number(process.env.FILE_AVATAR_SIZE);
    if (file.size < maxSize) {
      return file;
    } else {
      throw new BadRequestException(CommonMessage.upload_file_size_error);
    }
  }
}
