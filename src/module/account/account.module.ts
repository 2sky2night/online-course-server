import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AccountController } from "./controller";
import { Account } from "./entity";
import { RoleModule } from "./module/role/role.module";
import { AccountService } from "./service";

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
