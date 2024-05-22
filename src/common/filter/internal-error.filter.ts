import { open, write } from "node:fs";
import { resolve } from "node:path";
import { env } from "node:process";

import { ArgumentsHost, Catch, ExceptionFilter, Logger } from "@nestjs/common";
import { readFileData } from "@src/utils/tools";
import { Request, Response } from "express";
import type { SentMessageInfo, Transporter } from "nodemailer";
import { createTransport } from "nodemailer";

@Catch()
export class InternalErrorFilter implements ExceptionFilter {
  logger: Logger;
  /**
   * 日志文件路径
   */
  errorLogPath: string;
  /**
   * 日志文件描述符
   */
  logFd: number | null = null;
  /**
   * 邮箱实例
   */
  emailInst: Transporter<SentMessageInfo> | null = null;
  /**
   * 错误日志邮箱收件人
   */
  emailDest: string | null = null;
  /**
   * 邮箱发件人名称
   */
  emailName: string | null = null;
  /**
   * 发送邮件时的APP名称
   */
  appName: string | null = null;

  constructor() {
    this.logger = new Logger();
    this.errorLogPath =
      globalThis.process.env.ERROR_LOG_PATH ||
      resolve(__dirname, "../../../../server_error_log.txt");
    this.initLog();
    this.initEmail();
  }

  /**
   * 初始化邮箱
   */
  async initEmail() {
    try {
      this.emailDest = env.EMAIL_LOCATION;
      this.emailName = env.EMAIL_NAME;
      this.appName = env.APP_NAME;
      const pass = await readFileData(env.EMAIL_KEY_PATH, true);
      this.emailInst = createTransport({
        service: "QQ",
        auth: {
          user: env.EMAIL_LOCATION,
          pass,
        },
      });
      this.logger.log("[错误异常拦截器] 初始化邮箱成功!");
    } catch (err) {
      this.logger.error("[错误异常拦截器] 初始化邮箱失败:" + String(err));
    }
  }

  /**
   * 初始化日志记录
   */
  initLog() {
    open(this.errorLogPath, "a", (err, fd) => {
      if (err) {
        this.logger.error("[错误异常拦截器] 初始化日志记录失败:" + String(err));
      } else {
        this.logFd = fd;
        this.logger.log("初始化日志记录成功!");
      }
    });
  }

  /**
   * 记录日志
   */
  logError(timeStamp: number, path: string, method: string, error: Error) {
    const msg = {
      timeStamp,
      path,
      method,
      error: {
        name: error.name || null,
        stack: error.stack || null,
        message: error.message || null,
      },
    };
    if (this.logFd !== null) {
      write(this.logFd, JSON.stringify(msg) + ",", (err) => {
        if (err) {
          this.logger.error("写入日志失败");
        }
      });
    }
  }

  /**
   * 通过邮箱通知错误
   */
  logErrorByEmail(
    timeStamp: number,
    path: string,
    method: string,
    error: Error,
  ) {
    const html = `
      <h1>错误日志</h1>
      <div>
        <h2>错误名称: ${error.name}</h2>
        <h2>错误消息: ${error.message}</h2>
        <div>
        调用栈: ${error.stack}
        </div>
        <div>时间: ${new Date(timeStamp).toLocaleString()}</div>
        <div>请求路径: ${path}</div>
        <div>请求方式: ${method}</div>
      </div>
    `;
    this.emailInst
      .sendMail({
        from: `"${env.EMAIL_NAME}" <${this.emailDest}>`,
        to: this.emailDest,
        subject: `【${this.appName}】错误日志上报`,
        html,
      })
      .then(() => {
        this.logger.log("[错误异常拦截器] 异常邮箱发送成功!");
      })
      .catch(() => {
        this.logger.log("[错误异常拦截器] 异常邮箱发送失败!");
      });
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const error = {
      timeStamp: Date.now(),
      path: request.path,
      method: request.method,
      exception: exception,
    };
    // 在控制台打印内部错误信息
    this.logger.error(
      JSON.stringify({ ...error, exception: String(exception) }),
    );
    // 记录错误日志
    this.logError(error.timeStamp, error.path, error.method, error.exception);
    // 发送错误日志邮箱
    this.logErrorByEmail(
      error.timeStamp,
      error.path,
      error.method,
      error.exception,
    );
    // 给客户端响应的消息
    response.status(500).json({
      code: 500,
      msg: "Internal Server Error",
      timestamp: Date.now(),
      path: request.path,
      method: request.method,
    });
  }
}
