import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserRegisterType } from "@src/module/auth/module/user/entity";
import { AuthUserService } from "@src/module/auth/module/user/service";
import { AuthUserController } from "@src/module/auth/module/user/controller";

@Module({
  imports: [TypeOrmModule.forFeature([UserRegisterType])],
  controllers: [AuthUserController],
  providers: [AuthUserService],
})
export class AuthUserModule {}
