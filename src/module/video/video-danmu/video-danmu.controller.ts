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
import {
  ApiResponseEmpty,
  ApiResponsePage,
  UserToken,
} from "@src/common/decorator";
import { CreateDanmuDto } from "@src/module/video/video-danmu/dto";
import { IntPipe } from "@src/common/pipe";
import { VideoMessage } from "@src/config/message";
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ResponseDto } from "@src/types/docs";
import { DanmuDto } from "@src/types/docs/video/common";

/**
 * 弹幕控制层
 */
@ApiTags("VideoDanmu")
@ApiBearerAuth() // 标明此控制器的所有接口需要Bearer类型的token验证
@ApiExtraModels(ResponseDto)
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
  @ApiOperation({
    summary: "发布弹幕",
    description: "前台用户发布弹幕",
  })
  @ApiResponseEmpty()
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
  @ApiOperation({
    summary: "查询某个视频下的弹幕",
    description: "按照时间范围分页查询某个视频下的弹幕",
  })
  @ApiResponsePage(DanmuDto)
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
