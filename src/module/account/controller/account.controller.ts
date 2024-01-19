import { Controller } from "@nestjs/common";
import { AccountService } from "@src/module/account/service";
import { initLoader } from "../init";

@Controller("account")
export class AccountController {
  constructor(private accountService: AccountService) {
    // 初始化管理员
    initLoader(this.accountService);
  }
}
