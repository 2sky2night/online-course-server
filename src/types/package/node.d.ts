declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * 服务器启动端口号
     */
    PORT: number;
    /**
     * 应用名称
     */
    APP_NAME: string;
    /**
     * 数据库连接的IP地址
     */
    DATABASE_HOST: string;
    /**
     * 数据库连接的端口号
     */
    DATABASE_PORT: string;
    /**
     * 数据库名
     */
    DATABASE_NAME: string;
    /**
     * 密码的加密密钥
     */
    PASSWORD_SECRET: string;
    /**
     * 后台账户JWT密钥
     */
    JSON_WEB_TOKEN_ACCOUNT_SECRET: string;
    /**
     * 后台账户JWT过期时间
     */
    JSON_WEB_TOKEN_ACCOUNT_TIME: string;
    /**
     * 前台用户JWT密钥
     */
    JSON_WEB_TOKEN_USER_SECRET: string;
    /**
     * 前台用户JWT过期时间
     */
    JSON_WEB_TOKEN_USER_TIME: string;
    /**
     * 初始超级管理员的初始密码
     */
    SUPER_ADMIN_PASSWORD: string;
    /**
     * 超级管理员的初始用户名称
     */
    SUPER_ADMIN_NAME: string;
    /**
     * 超级管理员的注册邮箱
     */
    SUPER_ADMIN_EMAIL: string;
    /**
     * 邮箱授权码
     */
    EMAIL_CODE: string;
    /**
     * 发件时的邮箱名称
     */
    EMAIL_NAME: string;
    /**
     * 发件时的邮箱地址
     */
    EMAIL_LOCATION: string;
    /**
     * 头像上传的最大为2mb(byte)
     */
    FILE_AVATAR_SIZE: string;
    /**
     * Github客户端id
     */
    GITHUB_CLIENT_ID: string;
    /**
     * Github客户端密钥
     */
    GITHUB_CLIENT_SECRET: string;
    /**
     * Gitee客户端id
     */
    GITEE_CLIENT_ID: string;
    /**
     * Gitee客户端密钥
     */
    GITEE_CLIENT_SECRET: string;
    /**
     * Gitee授权成功回调(回调地址，若与申请时填写的地址不一样会导致调用API失败)
     */
    GITEE_CALLBACK_URL: string;
    /**
     * 支付宝应用id
     */
    ALIPAY_APP_ID: string;
    /**
     * 支付宝应用公钥
     */
    ALIPAY_PRIVATE_KEY: string;
    /**
     * 支付宝应用私钥
     */
    ALIPAY_PUBLIC_KEY: string;
    /**
     * 上传文件的存储路径（绝对路径）所有上传的文件会分类保存
     */
    UPLOAD_PATH: string;
    /**
     * 生成视频封面的临时路径
     */
    AUTO_VIDEO_COVER_TEMP_PATH: string;
    /**
     * 封面最大大小
     */
    FILE_COVER_SIZE: string;
    /**
     * 文件切片的大小
     */
    FILE_CHUNK_SIZE: string;
    /**
     * 启动环境
     */
    NODE_ENV: "development" | "production";
    /**
     * 邮箱登录验证码有效时间（秒）
     */
    EMAIL_LOGIN_CODE_TIME: string;
    /**
     * redis选择的数据库0-15
     */
    REDIS_DATABASE_NAME: string;
    /**
     * 配图文件的最大大小
     */
    FILE_IMAGE_SIZE: string;
    /**
     * 视频加密密钥路径
     */
    VIDEO_KEY_PATH: string;
    /**
     * 视频加密密钥关系映射路径
     */
    VIDEO_KEY_INFO_PATH: string;
    /**
     * 存储转码后的临时视频文件夹路径
     */
    VIDEO_TEMP_PATH: string;
    /**
     * m3u8视频存储的路径
     */
    VIDEO_PATH: string;
  }
}
