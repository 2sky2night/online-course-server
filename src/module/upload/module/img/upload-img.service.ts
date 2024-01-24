import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountUpload, UserUpload } from "@src/module/upload/entity";
import { Folder } from "@src/lib/folder";

@Injectable()
export class UploadImgService {
  /**
   * 上传前台用户头像目录
   */
  @Inject("UPLOAD_USER_AVATAR")
  userAvatarFolder: Folder;
  /**
   * 前台账户追踪表
   * @private
   */
  @InjectRepository(UserUpload)
  private UURepository: UserUpload;
  /**
   * 后台账户上传追踪表
   * @private
   */
  @InjectRepository(AccountUpload)
  private AURepository: AccountUpload;

  async uploadUserAvatar(userId: number) {
    userId;
  }
}
