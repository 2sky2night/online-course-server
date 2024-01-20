import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoleModule } from "@src/module/role/role.module";
import { Account } from "./entity";
import { AccountService } from "./service";
import { AccountController } from "./controller";

@Module({
  imports: [TypeOrmModule.forFeature([Account]), RoleModule],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
