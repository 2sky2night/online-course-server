import { createHash } from "node:crypto";
import { existsSync, readFile } from "node:fs";

import { BadRequestException } from "@nestjs/common";
import { CommonMessage } from "@src/config/message";
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

/**
 * 读取文件中的数据
 * @param filePath 文件路径
 * @param utf8 是否以uft8读取文件数据，否则就是buffer
 */
export function readFileData(filePath: string, utf8: true): Promise<string>;
export function readFileData(filePath: string, utf8: false): Promise<Buffer>;
export function readFileData(filePath: string, utf8: boolean) {
  return new Promise((resolve, reject) => {
    if (existsSync(filePath)) {
      if (utf8) {
        readFile(filePath, "utf8", (err, data) => {
          if (err) reject(`读取文件数据失败，错误信息为:${err}`);
          resolve(data);
        });
      } else {
        readFile(filePath, (err, data) => {
          if (err) reject(`读取文件数据失败，错误信息为:${err}`);
          resolve(data);
        });
      }
    } else {
      reject("读取文件数据失败，文件路径不存在!");
    }
  });
}

/**
 * 包装列表返回数据
 * @param list 数据
 * @param total 总数
 * @param offset 偏移量
 * @param limit 页长度
 */
export function pageResult<T>(
  list: T[],
  total: number,
  offset: number,
  limit: number,
) {
  return {
    list,
    total,
    has_more: total > offset + limit,
  };
}
