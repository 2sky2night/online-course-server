import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@src/module/user/entity";
import { UserService } from "@src/module/user/service";
import { UserController } from "@src/module/user/controller";

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
