import { createHash } from "node:crypto";
import { ArrayBuffer } from "spark-md5";
import { BadRequestException } from "@nestjs/common";
import { CommonMessage } from "@src/config/message";

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

/**
 * 请求体可选参数检查器（场景：请求体中的参数全是可选的情况下使用）
 * @param o 请求体
 * @param optionKeys 定义的可选参数
 */
export function bodyOptionCatcher(
  o: NonNullable<unknown>,
  optionKeys: string[],
) {
  const keys = Object.keys(o);
  if (keys.length === 0) {
    throw new BadRequestException(CommonMessage.form_empty_error);
  }
  // 判断传入的请求体是否有一项包含了定义的参数？
  const flag = keys.some((key) => {
    return optionKeys.includes(key);
  });
  if (flag) {
    return true;
  } else {
    throw new BadRequestException(CommonMessage.form_fields_error);
  }
}

/**
 * 将数值列表转换成queryString
 * @param list 列表
 */
export function arrayToQueryString(list: number[]) {
  return list.reduce((pre, item, index) => {
    if (index === 0) {
      return String(item);
    } else {
      return `${pre},${item}`;
    }
  }, "");
}
