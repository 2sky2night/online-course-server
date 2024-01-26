import { createHash } from "node:crypto";
import { ArrayBuffer } from "spark-md5";

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
 * @param buffer 要计算hash的文件数据
 */
export function generateFileHash(buffer: Buffer): string;
/**
 * 直接计算出文件的hash，采用md5算法
 * @param buffer 要计算的文件数据
 * @param spark 是否采用spark-md5库计算hash
 */
export function generateFileHash(buffer: Buffer, spark: boolean): string;
export function generateFileHash(buffer: Buffer, spark = false) {
  if (spark === true) {
    // 注意若输入的文件是Buffer类型的需要使用ArrayBuffer实例来计算文件的hash
    const hashInst = new ArrayBuffer();
    hashInst.append(buffer);
    return hashInst.end();
  } else {
    const hashInst = createHash("md5");
    hashInst.update(buffer);
    return hashInst.digest("hex");
  }
}
