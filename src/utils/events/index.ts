import { EventEmitter } from "node:events";

import type { EventHandler, EventName } from "@src/types/common";

const emitter = new EventEmitter();

/**
 * 事件分发
 * @param name
 * @param handler
 */
export function on(name: EventName, handler: EventHandler) {
  emitter.on(name, handler);
}

/**
 * 事件监听
 * @param name
 * @param args
 */
export function emit(name: EventName, ...args: any[]) {
  emitter.emit(name, ...args);
}

/**
 * 只监听一次事件
 * @param name
 * @param handler
 */
export function once(name: EventName, handler: EventHandler) {
  emitter.once(name, handler);
}

/**
 * 移除事件监听
 * @param name
 * @param handler
 */
export function off(name: EventName, handler: EventHandler) {
  emitter.off(name, handler);
}
