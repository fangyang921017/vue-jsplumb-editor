/* eslint-disable guard-for-in */
/* eslint-disable no-param-reassign */
function Event() {
  this.clientList = {};
}

Event.prototype = {
  on(key, fn) {
    if (!this.clientList[key]) {
      this.clientList[key] = [];
    }
    this.clientList[key].push(fn);
  },

  emit(...args) {
    const key = Array.prototype.shift.call(args);
    const fns = this.clientList[key];
    if (!fns || fns.length === 0) {
      return false;
    }

    fns.forEach((fn) => {
      fn.apply(this, args);
    });
    return false;
  },

  remove(key, fn) {
    const fns = this.clientList[key];
    if (!fns) {
      return false;
    }
    if (!fn) {
      if (fns) {
        fns.length = 0;
      }
    } else {
      for (let l = fns.length - 1; l >= 0; l -= 1) {
        const func = fns[l];
        if (func === fn) {
          fns.splice(l, 1);
        }
      }
    }
    return false;
  },
};

export const EventCenter = new Event();

export default function extendsEvent(obj) {
  const eventInstance = new Event();
  // eslint-disable-next-line no-restricted-syntax
  for (const key in eventInstance) {
    // for-in循环会将eventInstance原型上的方法遍历出来
    obj[key] = eventInstance[key];
  }
}
