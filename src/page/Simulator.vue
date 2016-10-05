<template>
  <div class="page simulator-page">
    <h1>传说模拟器</h1>

    <h2>天梯规则</h2>

    <h2>假设</h2>

    <h2>概况</h2>
    <p>
      玩家胜率: {{rate}}%,
      初始等级: {{level}}级{{star}}星,
      场次: {{num}}
    </p>
    <p>
      最终等级:
      <span v-if="result.level === 0">传说({{result.legendNum}}场上传说),</span>
      <span v-else>{{result.level}}级{{result.star}}星,</span>
      真实胜率: {{Number.parseInt(result.realRate)}}%
    </p>

    <h2>
      <span class="clickable" v-on:click="toggle.gameNum = !toggle.gameNum">
        场次详情
        <span v-show="toggle.gameNum">+</span>
        <span v-show="!toggle.gameNum">-</span>
      </span>
    </h2>
    <ol>
      <li
        v-for="(item, index) in result.detail"
        v-if="item.level !== 0 || (item.level === 0 && result['detail'][index - 1]['level'] !== 0)"
        v-show="(toggle.gameNum && index + 1 <= 10) || (!toggle.gameNum)"
      >
        {{item.win ? '胜' : '负'}},
        <span v-if="item.level === 0">传说</span>
        <span v-else>{{item.level}}级{{item.star}}星</span>
      </li>
      <li v-show="toggle.gameNum">...</li>
    </ol>

    <h2>
      <span class="clickable" v-on:click="toggle.levelNum = !toggle.levelNum">
        每个等级的场数
        <span v-show="toggle.levelNum">+</span>
        <span v-show="!toggle.levelNum">-</span>
      </span>
    </h2>
    <ul>
      <li
        v-for="(item, index) in result.levelNum"
        v-if="index !== 0 && item !== undefined"
        v-show="(toggle.levelNum && (index <= 10 || result['levelNum'][index - 10] === undefined)) || (!toggle.levelNum)"
      >
        {{index}}级:
        {{item}}场
      </li>
      <li v-show="toggle.levelNum">...</li>
    </ul>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */

import {Game, Player} from '../game/core'

export default {
  data: function () {
    return {
      rate: 50,
      level: 25,
      star: 0,
      num: 1000,
      toggle: {
        gameNum: true,
        levelNum: true
      }
    }
  },
  computed: {
    result: function () {
      let game = new Game()
      let playerA = new Player(game, this.rate, this.level, this.star)
      let result = playerA.play(this.num)
      return result
    }
  }
}
</script>

<style>
body {
  background: url(../assets/img/bg.jpg) center top;
  color: #552c09;
}

.clickable {cursor: pointer;}

.page {
  width: 600px;
  margin: 30px auto;
  padding: 0 15px;
  border: 1px solid transparent;
  box-shadow: 0 0 20px #552c09;
  background-color: rgba(255, 255, 255, 0.7);
}
</style>
