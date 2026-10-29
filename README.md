<h1 align="center">趣学网 · 服务端</h1>

<p align="center">一个在线课程 / 视频教学平台的后端服务，基于 NestJS 10 构建。</p>

## 项目简介

趣学网是一个 B 站 / 视频网站式的在线教育平台。本仓库是它的**服务端**，提供完整的 REST API，包含后台管理端和前台用户端两套账号体系，以及视频上传、转码、加密、播放、互动等一整套能力。

主要能力：

- **后台账户体系**：超级管理员 / 管理员 / 老师三级角色，账号需申请并经后台审批（老师角色可发布视频）。
- **前台用户体系**：邮箱验证码登录，以及 Gitee / GitHub / 支付宝第三方 OAuth 登录。
- **视频业务**：分区、标签、合集、收藏、点赞、评论、回复、弹幕、观看历史、浏览量、实时在线人数。
- **视频处理流水线**：大文件切片上传 / 秒传 → 合并 → ffmpeg 转码为多分辨率 H.264 → AES-128 加密 HLS(m3u8) 切片。
- **文件上传**：头像、封面、配图、视频等分类存储。
- **邮件通知**：登录验证码、账号审批结果、错误日志上报。
- **系统监控**：数据库健康检查、CPU / 内存 / 磁盘 / 网络占用、错误日志查看。

## 技术栈

- [NestJS](https://nestjs.com/) 10 + TypeScript
- [TypeORM](https://typeorm.io/) + MySQL
- Redis（登录验证码、视频处理进度、实时在线人数）
- JWT 鉴权（后台账户 / 前台用户两套独立密钥）
- Swagger（`@nestjs/swagger`）自动生成接口文档
- nodemailer（QQ 邮箱）、fluent-ffmpeg（视频转码）、alipay-sdk、systeminformation、@nestjs/terminus

## 环境要求

- Node.js 20+
- [pnpm](https://pnpm.io/)
- MySQL
- Redis
- [ffmpeg](https://ffmpeg.org/)（命令行工具，视频转码 / m3u8 加密必需，需在系统 PATH 中可用）

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

项目根目录的 `.env` 已经存在，按需修改。需要注意一个**关键约定**：

> 部分敏感信息（数据库账号密码、邮箱授权码、OAuth 密钥、视频加密密钥等）**不直接写在 `.env` 里**，而是写「存放该密钥的文件路径」，程序通过 `readFileData(path, utf8)` 在运行时读取。请确保这些路径指向真实存在的文件。

以 `.env` 为例，这些配置是指向文件的路径：

| 变量 | 含义 |
| --- | --- |
| `DATABASE_USER_PATH` / `DATABASE_PASSWORD_PATH` | 数据库用户名 / 密码所在的文件 |
| `EMAIL_KEY_PATH` | QQ 邮箱 SMTP 授权码文件 |
| `VIDEO_KEY_PATH` / `VIDEO_KEY_INFO_PATH` | 视频加密密钥 / 密钥映射信息文件 |
| `ALIPAY_APP_ID_PATH` / `ALIPAY_PUBLIC_KEY_PATH` / `ALIPAY_PRIVATE_KEY_PATH` | 支付宝应用 id / 公钥 / 私钥文件 |
| `GITEE_CLIENT_ID_PATH` / `GITEE_CLIENT_SECRET_PATH` | Gitee OAuth 客户端 id / 密钥文件 |
| `GITHUB_CLIENT_ID_PATH` / `GITHUB_CLIENT_SECRET_PATH` | GitHub OAuth 客户端 id / 密钥文件 |

> `.env` 中目前是 Windows 绝对路径（如 `D:\毕设\code\key\...`），部署到其他环境时请改为对应路径。

其他常用配置（`PORT`、`DATABASE_HOST`、`SUPER_ADMIN_*`、`UPLOAD_PATH`、`VIDEO_PATH` 等）直接写在 `.env` 中即可，含义见文件内注释。

### 3. 启动

```bash
# 开发模式（watch 热更新，开启跨域）
pnpm run start:dev

# 生产模式
pnpm run build
pnpm run start:prod
```

> 开发模式下 TypeORM 会开启 `synchronize` 自动同步表结构；**生产环境禁用**（见 `src/config/database/index.ts`），请自行准备建表方案。

## API 文档

启动后访问：

- Swagger UI：`http://localhost:3000/docs`
- Swagger JSON：`http://localhost:3000/docs-json`

所有接口统一挂载在 `/api` 前缀下，接口文档已集成 Bearer Token 鉴权。

## 测试

```bash
# 单元测试
pnpm run test

# 监听模式
pnpm run test:watch

# 覆盖率
pnpm run test:cov

# e2e 测试
pnpm run test:e2e
```

Jest 配置内嵌在 `package.json` 中（`rootDir: "src"`，匹配 `*.spec.ts`）。运行单个测试：

```bash
pnpm run test -- path/to/file.spec.ts
```

## 代码规范与提交

```bash
pnpm run lint      # eslint --fix
pnpm run format    # prettier --write
pnpm run commit    # 交互式中文 conventional commit（commitizen）
```

提交时 Husky + lint-staged 会对暂存文件自动执行格式化与 lint，commitlint 校验提交信息格式。请优先使用 `pnpm run commit` 生成规范的提交信息。

## 项目结构

```
src/
├── main.ts                 # 应用入口：全局管道 / 前缀 / 过滤器 / 拦截器 / Swagger
├── app.module.ts           # 根模块，聚合所有业务模块
├── common/                 # 跨领域基础设施
│   ├── decorator/          # 自定义参数装饰器 + Swagger 响应装饰器
│   ├── guard/              # 鉴权守卫（账户 / 用户 / 角色）
│   ├── filter/             # 异常过滤器（HTTP 异常 / 内部错误）
│   ├── interceptor/        # 统一响应拦截器
│   └── pipe/               # 参数 / 文件校验管道
├── config/                 # 配置工厂与常量
│   ├── database/           # TypeORM 配置 + 实体注册表
│   ├── message/            # 所有用户提示文案（中文）
│   ├── oauth/              # 第三方登录配置
│   └── upload/             # 上传路径配置
├── lib/                    # 与框架无关的领域能力
│   ├── folder/             # 文件系统抽象（Folder / ChunkFolder / FfmpegFolder）
│   ├── oauth/              # 支付宝 / Gitee / GitHub SDK 封装
│   └── video-processing/   # 视频转码 + m3u8 加密
├── module/                 # 业务模块
│   ├── account/            # 后台账户（含 role 角色子模块）
│   ├── auth/               # 鉴权（account 账户审批 / user 前台登录）
│   ├── user/               # 前台用户
│   ├── video/              # 视频业务（分区 / 标签 / 合集 / 评论 / 弹幕 / 收藏等）
│   ├── upload/             # 上传（图片 / 视频切片）
│   ├── file/               # 文件与视频源记录
│   ├── email/              # 邮件发送
│   ├── redis/              # Redis 封装
│   └── monitor/            # 系统监控
├── types/                  # 共享类型 / Swagger 文档模型 / 环境变量声明
└── utils/                  # 纯工具函数（加密 / 事件 / ffmpeg / 通用工具）
```

## 统一响应约定

所有成功响应由全局拦截器包装为：

```json
{ "code": 200, "msg": "ok", "data": {} }
```

异常分别由 `HttpExceptionFilter`（HTTP 异常）与 `InternalErrorFilter`（内部错误，落盘 + 邮件上报）处理。分页接口统一返回：

```json
{ "list": [], "total": 0, "has_more": false }
```

## License

私有项目（UNLICENSED）。
