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
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import {
  ApiResponse,
  ApiResponseEmpty,
  ApiResponsePage,
  UserToken,
} from "@src/common/decorator";
import { UserGuard } from "@src/common/guard";
import { BooleanPipe, IntPipe, LimitPipe, OffsetPipe } from "@src/common/pipe";
import {
  AddVideoDto,
  CreateFavoriteDto,
  RemoveVideosDto,
  UpdateFavoriteDto,
} from "@src/module/video/video-favorite/dto";
import { VideoFavoriteService } from "@src/module/video/video-favorite/video-favorite.service";
import { ResponseDto } from "@src/types/docs";
import { FavoriteDto, VideoDto } from "@src/types/docs/video/common";
import { FavoriteListDto } from "@src/types/docs/video/favorite";
import { bodyOptionCatcher } from "@src/utils/tools";

/**
 * 视频收藏控制层
 */
@ApiTags("VideoFavorite")
@ApiBearerAuth() // 标明此控制器的所有接口需要Bearer类型的token验证
@ApiExtraModels(ResponseDto)
@Controller("video/favorite")
export class VideoFavoriteController {
  @Inject(VideoFavoriteService)
  private service: VideoFavoriteService;

  /**
   * 创建视频收藏夹
   * @param user_id 用户id
   * @param dto 表单
   */
  @ApiOperation({
    summary: "创建视频收藏夹",
    description: "前台用户创建视频收藏夹",
  })
  @ApiResponseEmpty()
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
  @ApiOperation({
    summary: "更新收藏夹信息",
    description: "前台用户更新收藏夹信息",
  })
  @ApiResponseEmpty()
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
  @ApiOperation({
    summary: "更新收藏夹信息",
    description: "前台用户更新收藏夹信息",
  })
  @ApiResponseEmpty()
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
  @ApiOperation({
    summary: "从默认收藏夹中移除多个视频",
    description: "前台用户从默认收藏夹中移除多个视频",
  })
  @ApiResponseEmpty()
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
  @ApiOperation({
    summary: "查询用户默认收藏夹中视频",
    description: "分页查询用户默认收藏夹中的所有视频",
  })
  @ApiResponsePage(VideoDto)
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
  @ApiOperation({
    summary: "从收藏夹中移除一些视频",
    description: "前台用户从收藏夹中移除一些视频",
  })
  @ApiResponseEmpty()
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
  @ApiOperation({
    summary: "分页查询用户收藏夹对此视频的收藏状态",
    description: "分页查询用户收藏夹对此视频的收藏状态",
  })
  @ApiResponse(FavoriteListDto)
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
  @ApiOperation({
    summary: "查询用户收藏夹列表",
    description: "分页查询前台用户收藏夹列表",
  })
  @ApiResponsePage(FavoriteDto)
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
  @ApiOperation({
    summary: "查询收藏夹中的视频",
    description: "查询收藏夹中的视频",
  })
  @ApiResponsePage(VideoDto)
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
