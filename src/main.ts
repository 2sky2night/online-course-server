import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { Logger } from "@nestjs/common";
import { ValidationPipe } from "@src/common/pipe";
import { AppModule } from "./app.module";
import { ResponseInterceptor } from "@src/common/interceptor";
import { HttpExceptionFilter, InternalErrorFilter } from "@src/common/filter";

async function bootstrap() {
  try {
    // APP实例
    const app = await NestFactory.create(
      AppModule,
      // 开发环境开启跨域
      process.env.NODE_ENV === "development" ? { cors: true } : {},
    );
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
    // 配置swagger文档
    const swaggerConfig = new DocumentBuilder()
      .setTitle("趣学服务端")
      .setDescription("趣学服务端的接口文档")
      .setDescription(
        `接口json文档路径:http://localhost:${process.env.PORT}/docs-json`,
      )
      .setVersion("1.0")
      .addBearerAuth() // 给文档集成接口鉴权功能
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    // 启动swagger 配置启动路径
    SwaggerModule.setup("docs", app, document);
    // swagger文档路径为 http://localhost:prot/docs
    // swagger文档的json格式路径为 http://localhost:prot/docs-json
    // 服务器启动端口号
    await app.listen(process.env.PORT);
  } catch (e) {
    Logger.error(e);
  }
}

bootstrap();
