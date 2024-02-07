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
import { UserToken } from "@src/common/decorator";
import { BooleanPipe, IntPipe, LimitPipe, OffsetPipe } from "@src/common/pipe";

/**
 * 用户订阅视频合集控制层
 */
@Controller("/video/collection")
export class CollectionSubscribeController {
  @Inject(CollectionSubscribeService)
  private service: CollectionSubscribeService;

  /**
   * 订阅合集
   * @param user_id 用户id
   * @param collection_id 合集id
   */
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
