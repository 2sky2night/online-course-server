import { AES, enc } from "crypto-js";
import {
  v4 as uuidV4,
  validate as uuidValidate,
  version as uuidVersion,
} from "uuid";

/**
 * 生成盐
 * @return {string} 三十六位的字符串
 */
export function generateSalt() {
  return uuidV4();
}

/**
 * 校验uuid是否合法
 * @param uuid 要校验的uuid
 * @return {boolean} 是否合法且uuid版本为v4
 */
export function uuidValidateV4(uuid: string) {
  return uuidValidate(uuid) && uuidVersion(uuid) === 4;
}

/**
 * AES加密
 * @param text 要加密的文本
 * @param secret 密钥
 * @returns {string} 加密后的文本
 */
export function encrypt(text: string, secret: string): string {
  return AES.encrypt(text, secret).toString();
}

/**
 * AES解密
 * @param key 加密后的文本
 * @param secret 密钥
 * @return {string} 解密后的源文本
 */
export function decrypt(key: string, secret: string): string {
  return AES.decrypt(key, secret).toString(enc.Utf8);
}

/**
 * AES加盐加密密码
 * @param password
 * @return {string} 加密完成后的密码
 */
export function passwordEncrypt(password: string) {
  // 生成盐
  const salt = generateSalt();
  // 拼接文本
  const text = salt + password;
  return encrypt(text, process.env.PASSWORD_SECRET);
}

/**
 * AES解密加盐密码
 * @param key
 * @return {string} 密码
 */
export function passwordDecrypt(key: string) {
  // 解密密文
  const text = decrypt(key, process.env.PASSWORD_SECRET);
  // 由于盐的固定长度为36，所以截取36位后面的字符既是用户的密码
  return text.slice(36);
}
