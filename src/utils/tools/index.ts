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
