import { CONNECTORSEPARATESYMBOL } from './const';

const uuidv1 = require('uuid/v1');

/**
 * @description 增加css规则
 * @export {function}
 * @param {string} cssRules 字符串形式的css代码
 */
export function addCssRules(cssRules) {
  const css = cssRules;
  const style = document.createElement('style');
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  document.getElementsByTagName('head')[0].appendChild(style);
}

/**
 * @description 判断端点的类型（Dot，Rect）
 * @param {Anchor} anchor
 * @export {function}
 * @returns {boolean}
 */
export function isEndpoint(anchor) {
  return anchor.type === 'Dot';
}

/**
 * @description 生成uuid
 * @export {function}
 * @returns {string}
 */
export function createUuid() {
  let uuid = uuidv1();
  let retryCount = 0;
  const maxRetries = 100; // 最大重试次数

  // 保证生成安全的uuid
  while (uuid.includes(CONNECTORSEPARATESYMBOL)) {
    retryCount += 1;
    if (retryCount >= maxRetries) {
      throw new Error('无法生成有效的UUID，已达到最大重试次数');
    }
    uuid = uuidv1();
  }
  return uuid;
}
