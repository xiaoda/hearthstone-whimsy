import helper from '../helper'

/* 玩家类 */
class Player {
  /* 初始化 */
  constructor (game, rate = 50, level = 25, star = 0, streakNum = 0) {
    this.game = game // 游戏
    this.rate = rate // 胜率
    this.level = level // 等级
    this.star = star // 星星数
    this.streakNum = streakNum // 连胜场次
    this.streak = this.streakNum >= this.game.streakNum // 是否连胜
  }

  /* 重置玩家数据 */
  reset (options) {
    Object.keys(options).forEach((key, index) => {
      this[key] = options[key]
    })
    this.streak = this.streakNum >= this.game.streakNum
  }

  /* 参数检查 */
  _checkParams (num) {
    let check = {
      valid: true,
      err: []
    }
    let throwErr = (field) => {
      check.valid = false
      check.err.push(field)
    }
    if (this.game.name !== 'hearthstone') throwErr('game')
    if (this.rate > 100 || this.rate < 0) throwErr('rate')
    if (!Number.isInteger(this.level) || this.level < 0 || this.level > 25) throwErr('level')
    if (!check.err.includes('level')) {
      let maxStar = this['game']['levels'][this.level]['stars']
      if (!Number.isInteger(this.star) || this.star < 0 || this.star > maxStar) throwErr('star')
    }
    if (!Number.isInteger(num) || num < 0) throwErr('num')
    return check
  }

  /* 玩游戏（私有方法） */
  _play () {
    let result = this.game.round(this.rate) // 游戏结果
    let levels = this.game.levels

    /* 传说 */
    if (this.level === 0) {
      return {
        win: result,
        level: this.level,
        star: this.star
      }
    }

    /* 场次递增 */
    this.gameNum++
    if (result) this.winNum++

    /* 等级详情 */
    if (this['levelDetail'][this.level] === undefined) {
      this['levelDetail'][this.level] = {}
      this['levelDetail'][this.level]['num'] = 0
      this['levelDetail'][this.level]['win'] = 0
    }
    this['levelDetail'][this.level]['num']++
    this['levelDetail'][this.level]['win'] += Number(result)

    /* 连胜逻辑 */
    if (levels[this['level']]['streak']) {
      if (result) {
        this.streakNum++
        if (this.streakNum === this.game.streakNum) this.streak = true
      } else {
        this.streak = false
        this.streakNum = 0
      }
    } else {
      this.streak = false
      this.streakNum = 0
    }

    /* 星星 */
    if (result) {
      if (this.streak && this.level === 6 && this.star === 5) this.star++
      else if (this.streak) this.star += 2
      else this.star++
    } else {
      this.star--
    }

    /* 等级 */
    let currentLevelData = levels[this['level']]
    if (this.star > currentLevelData['stars']) {
      let newLevel = --this.level
      if (newLevel === 0) {
        this.star = 0
        this.legendNum = this.gameNum
      } else {
        this.star = this.star - currentLevelData['stars']
      }
    } else if (this.star < 0) {
      if (currentLevelData['degrade']) {
        let newLevel = ++this.level
        this.star = levels[newLevel]['stars'] - 1
      } else {
        this.star++
      }
    }

    /* 最高等级 */
    if (this.level < this.highest.level) {
      this.highest.level = this.level
      this.highest.star = this.star
    } else if (this.level === this.highest.level) {
      if (this.star > this.highest.star) this.highest.star = this.star
    }

    /* 最低等级 */
    if (this.level > this.lowest.level) {
      this.lowest.level = this.level
      this.lowest.star = this.star
    } else if (this.level === this.lowest.level) {
      if (this.star < this.lowest.star) this.lowest.star = this.star
    }

    /* 返回结果 */
    return {
      win: result,
      level: this.level,
      star: this.star
    }
  }

  /* 玩游戏（公共方法） */
  play (num = 1) {
    let check = this._checkParams(num)
    if (!check.valid) {
      return {
        status: 'paramsErr',
        err: check.err
      }
    }
    this.gameNum = 0 // 场次
    this.winNum = 0 // 获胜场次
    this.legendNum = 0 // 上传说所用场次
    this.levelDetail = [] // 每个等级所用场次
    this.highest = {
      level: this.level,
      star: this.star
    }
    this.lowest = helper.cloneObj(this.highest)

    let detail = []
    for (let i = 0; i <= num - 1; i++) {
      detail.push(this._play())
    }
    return {
      status: 'success',
      level: this.level,
      star: this.star,
      gameNum: this.gameNum,
      legendNum: this.legendNum,
      realRate: this.winNum / this.gameNum * 100,
      levelDetail: this.levelDetail,
      highest: this.highest,
      lowest: this.lowest,
      detail
    }
  }
}

/* 游戏类 */
class Game {
  constructor () {
    this.name = 'hearthstone'
    this.streakNum = 3 // 连胜需要场次
    this.levels = [
      {stars: 0, streak: false, degrade: false}, // 传说
      {stars: 5, streak: false, degrade: true},  // 1级
      {stars: 5, streak: false, degrade: true},  // 2级
      {stars: 5, streak: false, degrade: true},  // 3级
      {stars: 5, streak: false, degrade: true},  // 4级
      {stars: 5, streak: false, degrade: true},  // 5级
      {stars: 5, streak: true, degrade: true},   // 6级
      {stars: 5, streak: true, degrade: true},   // 7级
      {stars: 5, streak: true, degrade: true},   // 8级
      {stars: 5, streak: true, degrade: true},   // 9级
      {stars: 5, streak: true, degrade: true},   // 10级
      {stars: 4, streak: true, degrade: true},   // 11级
      {stars: 4, streak: true, degrade: true},   // 12级
      {stars: 4, streak: true, degrade: true},   // 13级
      {stars: 4, streak: true, degrade: true},   // 14级
      {stars: 4, streak: true, degrade: true},   // 15级
      {stars: 3, streak: true, degrade: true},   // 16级
      {stars: 3, streak: true, degrade: true},   // 17级
      {stars: 3, streak: true, degrade: true},   // 18级
      {stars: 3, streak: true, degrade: true},   // 19级
      {stars: 3, streak: true, degrade: false},  // 20级
      {stars: 2, streak: true, degrade: false},  // 21级
      {stars: 2, streak: true, degrade: false},  // 22级
      {stars: 2, streak: true, degrade: false},  // 23级
      {stars: 2, streak: true, degrade: false},  // 24级
      {stars: 2, streak: true, degrade: false}   // 25级
    ]
  }

  /* 单局游戏 */
  round (rate) {
    /* 游戏结果 */
    let result = helper.random(rate)
    return result
  }
}

module.exports = {Game, Player}
