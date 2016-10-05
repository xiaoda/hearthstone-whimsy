/* eslint-disable no-unused-vars */

import helper from '../helper'

/* 玩家类 */
class Player {
  constructor (game, rate = 50, level = 25, star = 0, streakNum = 0) {
    this.game = game // 游戏
    this.rate = rate // 胜率
    this.level = level // 等级
    this.star = star // 星星数
    this.streakNum = streakNum // 连胜场次
    this.streak = this.streakNum >= this.game.streakNum // 是否连胜

    this.gameTotalNum = 0 // 总场次
    this.winTotalNum = 0 // 获胜总场次
  }

  /* 玩游戏（私有方法） */
  _play () {
    this.gameNum++
    this.gameTotalNum++

    let result = this.game.round(this.rate) // 游戏结果
    let levels = this.game.levels

    if (this['levelNum'][this.level] === undefined) this['levelNum'][this.level] = 1
    else this['levelNum'][this.level]++

    if (result) {
      this.winNum++
      this.winTotalNum++
    }

    /* 传说 */
    if (this.level === 0) {
      return {
        win: result,
        level: this.level,
        star: this.star
      }
    }

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
      if (this.streak && this.star === 5) this.star++
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

    /* 返回结果 */
    return {
      win: result,
      level: this.level,
      star: this.star
    }
  }

  /* 玩游戏（公共方法） */
  play (num = 1) {
    this.gameNum = 0 // 场次
    this.winNum = 0 // 获胜场次
    this.legendNum = 0 // 上传说所用场次
    this.levelNum = [] // 每个等级所用场次

    let detail = []
    for (let i = 0; i <= num - 1; i++) {
      detail.push(this._play())
    }
    return {
      level: this.level,
      star: this.star,
      gameNum: this.gameNum,
      legendNum: this.legendNum,
      realRate: this.winNum / this.gameNum * 100,
      levelNum: this.levelNum,
      detail
    }
  }
}

/* 游戏类 */
class Game {
  constructor () {
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
