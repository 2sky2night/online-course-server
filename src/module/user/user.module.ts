import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "@src/module/user/controller";
import { User } from "@src/module/user/entity";
import { UserService } from "@src/module/user/service";

/**
 * 用户模块（前台）
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
