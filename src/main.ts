import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { ValidationPipe } from "@src/common/pipe";
import { AppModule } from "./app.module";
import { ResponseInterceptor } from "@src/common/interceptor";
import { HttpExceptionFilter, InternalErrorFilter } from "@src/common/filter";

async function bootstrap() {
  try {
    // APP实例
    const app = await NestFactory.create(AppModule);
    // 全局DTO校验
    app.useGlobalPipes(new ValidationPipe());
    // 接口前缀(必须在端口启动之前设置)
    app.setGlobalPrefix("/api");
    // 内部异常过滤器
    app.useGlobalFilters(new InternalErrorFilter());
    // 响应拦截器统一拦截格式
    app.useGlobalInterceptors(new ResponseInterceptor());
    // HTTP异常过滤器
    app.useGlobalFilters(new HttpExceptionFilter());
    // 服务器启动端口号
    await app.listen(process.env.PORT);
  } catch (e) {
    Logger.error(e);
  }
}

bootstrap();
