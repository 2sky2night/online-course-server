/**
 * 生成验证码
 * @param length 验证码长度
 */
export function generateCode(length = 4) {
  return Array.from({ length })
    .map(() => {
      return Math.floor(Math.random() * 10);
    })
    .join("");
}

/**
 * 直接计算出文件的hash，采用md5算法
 * @param buffer 要计算的文件数据
 */
export function generateFileHash(buffer: Buffer) {
  // 实现计算文件的hash
  buffer;
}
