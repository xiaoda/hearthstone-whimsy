/* eslint-disable no-unused-vars */

class Helper {
  /* 单局游戏是否获胜 */
  random (rate) {
    return rate > Math.random() * 100
  }
}

let helper = new Helper()
module.exports = helper
