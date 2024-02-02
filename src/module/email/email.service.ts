import { Inject, Injectable } from "@nestjs/common";
import { Transporter, SentMessageInfo } from "nodemailer";
import * as process from "process";

@Injectable()
export class EmailService {
  @Inject("EMAIL_TRANSPORT")
  emailTransport: Transporter<SentMessageInfo>;

  /**
   * 发送邮箱
   * @param dest 目的地址
   * @param title 标题
   * @param content 发送内容
   * @param html 发送的html内容
   */
  sendMail(dest: string, title: string, content: string, html = content) {
    return this.emailTransport.sendMail({
      from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_LOCATION}>`,
      to: dest,
      subject: title,
      text: content,
      html: html,
    });
  }

  /**
   * 给邮箱发送登录验证码
   * @param email 邮箱地址
   * @param code 验证码
   */
  sendCode(email: string, code: string) {
    return this.sendMail(
      email,
      `【${process.env.APP_NAME}】登录验证码`,
      `【${
        process.env.APP_NAME
      }】您正在进行登录验证，验证码为${code}。提供给他人会导致账号被盗，若非本人操作，请忽视，验证码在${
        Number(process.env.EMAIL_LOGIN_CODE_TIME) / 60
      }分钟内有效。`,
    );
  }

  /**
   * 将账户申请信息发送给用户邮箱
   * @param email 邮箱验证码
   */
  sendApplyMsg(email: string) {
    return this.sendMail(
      email,
      `【${process.env.APP_NAME}】账号申请`,
      `【${process.env.APP_NAME}】您正在进行账号申请，发送此邮件是想验证您的邮箱是否正确有效。申请结果会通过此邮件进行通知。`,
    );
  }

  /**
   * 将注册申请的审核结果发送给对应的邮箱
   * @param account_name 账户名
   * @param email 邮箱地址
   * @param status 申请结果
   */
  sendApprovalEmail(account_name: string, email: string, status: boolean) {
    return this.sendMail(
      email,
      `【${process.env.APP_NAME}】账户申请结果`,
      status
        ? `${account_name}，你好，您在本网站申请账户成功，可以登录并进一步操作了!`
        : "非常抱歉，您的申请被回绝，期待我们的下一次的合作。",
    );
  }
}
