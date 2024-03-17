import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CollectionSubscribeService } from "@src/module/video/collection-subsribe/collection-subscribe.service";
import { UserGuard } from "@src/common/guard";
import {
  ApiResponseEmpty,
  ApiResponsePage,
  UserToken,
} from "@src/common/decorator";
import { BooleanPipe, IntPipe, LimitPipe, OffsetPipe } from "@src/common/pipe";
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ResponseDto } from "@src/types/docs";
import { CollectionDtoA } from "@src/types/docs/video/collection";

/**
 * 用户订阅视频合集控制层
 */
@ApiTags("VideoCollection")
@ApiBearerAuth() // 标明此控制器的所有接口需要Bearer类型的token验证
@ApiExtraModels(ResponseDto)
@Controller("/video/collection")
export class CollectionSubscribeController {
  @Inject(CollectionSubscribeService)
  private service: CollectionSubscribeService;

  /**
   * 订阅合集
   * @param user_id 用户id
   * @param collection_id 合集id
   */
  @ApiOperation({
    summary: "订阅合集",
    description: "前台用户订阅合集",
  })
  @ApiResponseEmpty()
  @Post(":cid/subscribe")
  @UseGuards(UserGuard)
  subscribe(
    @UserToken("sub") user_id: number,
    @Param("cid", new IntPipe("cid")) collection_id: number,
  ) {
    return this.service.subscribe(user_id, collection_id);
  }

  /**
   * 取消订阅
   * @param user_id 用户id
   * @param collection_id 合集id
   */
  @ApiOperation({
    summary: "取消订阅合集",
    description: "前台用户取消订阅合集",
  })
  @ApiResponseEmpty()
  @Delete(":cid/subscribe")
  @UseGuards(UserGuard)
  unsubscribe(
    @UserToken("sub") user_id: number,
    @Param("cid", new IntPipe("cid")) collection_id: number,
  ) {
    return this.service.unsubscribe(user_id, collection_id);
  }

  /**
   * 查看用户订阅的视频合集
   * @param user_id 用户id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否降序
   */
  @ApiOperation({
    summary: "查看用户订阅的视频合集",
    description: "查看用户订阅的视频合集",
  })
  @ApiResponsePage(CollectionDtoA)
  @Get("/user/subscribes")
  subscribeList(
    @Query("user_id", new IntPipe("user_id")) user_id: number,
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.service.subscribeList(user_id, offset, limit, desc);
  }
}
