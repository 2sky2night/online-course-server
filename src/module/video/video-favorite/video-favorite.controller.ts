import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { VideoFavoriteService } from "@src/module/video/video-favorite/video-favorite.service";
import { UserGuard } from "@src/common/guard";
import { UserToken } from "@src/common/decorator";
import {
  AddVideoDto,
  CreateFavoriteDto,
  RemoveVideosDto,
  UpdateFavoriteDto,
} from "@src/module/video/video-favorite/dto";
import { BooleanPipe, IntPipe, LimitPipe, OffsetPipe } from "@src/common/pipe";
import { bodyOptionCatcher } from "@src/utils/tools";

/**
 * 视频收藏控制层
 */
@Controller("video/favorite")
export class VideoFavoriteController {
  @Inject(VideoFavoriteService)
  private service: VideoFavoriteService;

  /**
   * 创建视频收藏夹
   * @param user_id 用户id
   * @param dto 表单
   */
  @Post()
  @UseGuards(UserGuard)
  createFavorite(
    @UserToken("sub") user_id: number,
    @Body() dto: CreateFavoriteDto,
  ) {
    return this.service.createFavorite(
      user_id,
      dto.favorite_name,
      dto.description,
    );
  }

  /**
   * 更新收藏夹信息
   * @param favorite_id 收藏夹id
   * @param user_id 用户id
   * @param dto 表单
   */
  @Patch(":fid")
  @UseGuards(UserGuard)
  updateFavorite(
    @Param("fid", new IntPipe("fid")) favorite_id: number,
    @UserToken("sub") user_id: number,
    @Body() dto: UpdateFavoriteDto,
  ) {
    bodyOptionCatcher(dto, ["favorite_name", "description"]);
    return this.service.updateFavorite(
      user_id,
      favorite_id,
      dto.favorite_name,
      dto.description,
    );
  }

  /**
   * 向多个收藏夹|默认收藏夹添加视频
   * @param user_id 用户id
   * @param dto 表单
   */
  @Post("/videos")
  @UseGuards(UserGuard)
  addVideos(@UserToken("sub") user_id: number, @Body() dto: AddVideoDto) {
    return this.service.addVideos(
      user_id,
      dto.video_id,
      dto.favorite_id_list
        ? Array.from(new Set(dto.favorite_id_list))
        : undefined,
      dto.set_default,
    );
  }

  /**
   * 从默认收藏夹中移除多个视频
   * @param user_id
   * @param dto
   */
  @Delete("/default/videos")
  @UseGuards(UserGuard)
  removeDefaultVideos(
    @UserToken("sub") user_id: number,
    @Body() dto: RemoveVideosDto,
  ) {
    return this.service.removeDefaultVideos(user_id, dto.video_id_list);
  }

  /**
   * 查询用户默认收藏夹中视频
   * @param user_id 用户id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 降序
   */
  @Get("/default/videos")
  favoriteDefaultVideoList(
    @Query("user_id", new IntPipe("user_id")) user_id: number,
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.service.favoriteDefaultVideoList(user_id, offset, limit, desc);
  }

  /**
   * 从收藏夹中移除一些视频
   * @param user_id 用户id
   * @param favorite_id 收藏夹id
   * @param dto 表单
   */
  @Delete(":fid/videos")
  @UseGuards(UserGuard)
  removeVideos(
    @UserToken("sub") user_id: number,
    @Param("fid", new IntPipe("fid")) favorite_id: number,
    @Body() dto: RemoveVideosDto,
  ) {
    return this.service.removeVideos(
      user_id,
      favorite_id,
      Array.from(new Set(dto.video_id_list)),
    );
  }

  /**
   * 查询用户收藏夹对此视频的收藏状态
   * @param user_id 用户id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 是否降序
   * @param video_id 视频id
   */
  @Get("/user/list/with-video")
  @UseGuards(UserGuard)
  userFavoritesWithVideo(
    @UserToken("sub") user_id: number,
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
    @Query("video_id", new IntPipe("video_id")) video_id: number,
  ) {
    return this.service.userFavoritesWithVideo(
      user_id,
      offset,
      limit,
      desc,
      video_id,
    );
  }

  /**
   * 查询用户收藏夹列表
   * @param user_id 用户id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 创建时间降序
   */
  @Get("/user/list")
  @UseGuards(UserGuard)
  userFavoritesList(
    @Query("user_id", new IntPipe("user_id")) user_id: number,
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.service.userFavoritesList(user_id, offset, limit, desc);
  }

  /**
   * 查询收藏夹中的视频
   * @param favorite_id 收藏夹id
   * @param offset 偏移量
   * @param limit 长度
   * @param desc 排序
   */
  @Get(":fid/videos")
  favoriteVideoList(
    @Param("fid", new IntPipe("fid")) favorite_id: number,
    @Query("offset", OffsetPipe) offset: number,
    @Query("limit", LimitPipe) limit: number,
    @Query("desc", BooleanPipe) desc: boolean,
  ) {
    return this.service.favoriteVideoList(favorite_id, offset, limit, desc);
  }
}
