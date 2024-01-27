import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoleModule } from "./module/role/role.module";
import { Account } from "./entity";
import { AccountService } from "./service";
import { AccountController } from "./controller";

/**
 * 账户模块(后台)
 */
@Module({
  imports: [
    /**
     * 注入数据库表
     */
    TypeOrmModule.forFeature([Account]),
    /**
     * 角色模块
     */
    RoleModule,
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
