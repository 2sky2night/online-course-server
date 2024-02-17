import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { VideoDanmuService } from "@src/module/video/video-danmu/video-danmu.service";
import { UserGuard } from "@src/common/guard";
import { UserToken } from "@src/common/decorator";
import { CreateDanmuDto } from "@src/module/video/video-danmu/dto";
import { IntPipe } from "@src/common/pipe";
import { VideoMessage } from "@src/config/message";

/**
 * 弹幕控制层
 */
@Controller("video")
export class VideoDanmuController {
  /**
   * 弹幕服务层
   * @private
   */
  @Inject(VideoDanmuService)
  private service: VideoDanmuService;

  /**
   * 发布弹幕
   * @param video_id 视频id
   * @param user_id 发布人
   * @param dto 表单
   */
  @Post(":vid/danmu")
  @UseGuards(UserGuard)
  createDanmu(
    @Param("vid", new IntPipe("vid")) video_id: number,
    @UserToken("sub") user_id: number,
    @Body() dto: CreateDanmuDto,
  ) {
    return this.service.createDanmu(video_id, user_id, dto.content, dto.time);
  }

  /**
   * 查询某个视频下的弹幕
   * @param video_id 视频id
   * @param start 开始时间
   * @param end 结束时间
   */
  @Get(":vid/danmu")
  list(
    @Param("vid", new IntPipe("vid")) video_id: number,
    @Query("start", new IntPipe("start")) start: number,
    @Query("end", new IntPipe("end")) end: number,
  ) {
    if (start > end) {
      throw new BadRequestException(VideoMessage.get_danmu_error);
    }
    return this.service.list(video_id, start, end);
  }
}
