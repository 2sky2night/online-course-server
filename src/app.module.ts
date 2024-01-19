import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmConfigService } from "@src/config/database";
import { AccountModule } from "@src/module/account/account.module";
import { RoleModule } from "@src/module/role/role.module";

@Module({
  imports: [
    /**
     * 加载环境变量
     */
    ConfigModule.forRoot({
      envFilePath: [
        ".env",
        process.env.NODE_ENV === "development"
          ? ".env.development"
          : ".env.production",
      ],
      isGlobal: true,
    }),
    /**
     * 建立数据库连接
     */
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    /**
     * 角色模块
     */
    RoleModule,
    /**
     * 后台账户模块
     */
    AccountModule,
  ],
})
export class AppModule {}
