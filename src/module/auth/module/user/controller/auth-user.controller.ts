import { Controller, Inject } from "@nestjs/common";
import { AuthUserService } from "@src/module/auth/module/user/service";
import { initLoader } from "@src/module/auth/module/user/init";
import type { ConfigType } from "@nestjs/config";
import { registerTypeConfig } from "@src/config/login";

@Controller("/auth/user")
export class AuthUserController {
  constructor(
    private authUserService: AuthUserService,
    @Inject(registerTypeConfig.KEY)
    private registerConfig: ConfigType<typeof registerTypeConfig>,
  ) {
    // 初始化创建注册方式
    initLoader(this.authUserService, registerConfig);
  }
}
