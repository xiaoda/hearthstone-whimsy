<template>
  <div class="page simulator-page">
    <h1>传说模拟器</h1>

    <h2>条件</h2>
    <p>
      <strong>玩家胜率:</strong>
      <input class="input-text" type="number" v-model="rate" v-on:keyup.enter="calc"/>%,
      <strong>初始等级:</strong>
      <input class="input-text" type="number" v-model="level" v-on:keyup.enter="calc"/>级
      <input class="input-text" type="number" v-model="star" v-on:keyup.enter="calc"/>星,
      <strong>场次:</strong>
      <input class="input-text" type="number" v-model="num" v-on:keyup.enter="calc"/>
      <br/>
    </p>
    <div>
      <button class="btn" v-on:click="calc">开始计算</button>
      <button class="btn" v-on:click="clear">清空结果</button>
      <button class="btn" v-on:click="reset">重置条件</button>
    </div>

    <div v-if="Object.keys(result).length">
      <h2>结果</h2>

      <p>
        <strong>最终等级:</strong>
        <span v-if="result.level === 0"><span class="em">传说</span>({{result.legendNum}}场上传说),</span>
        <span v-else><span class="em">{{result.level}}级{{result.star}}星</span>,</span>
        <span v-if="result.level !== 0">
          <strong>最高等级:</strong>
          <span v-if="result.highest.level === 0"><span class="em">传说</span>,</span>
          <span v-else><span class="em">{{result.highest.level}}级{{result.highest.star}}星</span>,</span>
        </span>
        <strong>真实胜率:</strong>
        <span class="em">{{Number.parseInt(result.realRate)}}%</span>
      </p>

      <h2>等级变化图</h2>
      <div id="levelChart"></div>

      <h2>
        <span class="clickable" v-on:click="toggle.gameNum = !toggle.gameNum">
          战况详情(按场次)
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
          <strong>{{item.win ? '胜' : '负'}},</strong>
          <span v-if="item.level === 0">传说</span>
          <span v-else>{{item.level}}级{{item.star}}星</span>
        </li>
        <li v-show="toggle.gameNum && result.detail.length > 10">...</li>
      </ol>

      <h2>
        <span class="clickable" v-on:click="toggle.levelDetail = !toggle.levelDetail">
          战况详情(按等级)
          <span v-show="toggle.levelDetail">+</span>
          <span v-show="!toggle.levelDetail">-</span>
        </span>
      </h2>
      <ul>
        <li
          v-for="(item, index) in result.levelDetail"
          v-if="index !== 0 && item !== undefined"
          v-show="(toggle.levelDetail && (index <= 10 || result['levelDetail'][index - 10] === undefined)) || (!toggle.levelDetail)"
        >
          <span style="display: inline-block; min-width: 100px;">
            <strong>{{index}}级:</strong>
            {{item.num}}场,
          </span>
          <strong>胜率:</strong>
          {{Number.parseInt(item.win / item.num * 100)}}%
        </li>
        <li v-show="toggle.levelDetail && result.levelDetail.filter((item, index) => index !== 0 && item !== undefined).length > 10">...</li>
      </ul>
    </div>

    <h2>
      <span class="clickable" v-on:click="toggle.rule = !toggle.rule">
        天梯规则
        <span v-show="toggle.rule">+</span>
        <span v-show="!toggle.rule">-</span>
      </span>
    </h2>
    <ol v-show="!toggle.rule">
      <li><strong>等级:</strong> 25级到1级，数字越小表示等级越高，1级以上为传说</li>
      <li><strong>星星:</strong> 25级到21级每级2颗星，20级到16级3颗星，15级到11级4颗星，10级到1级5颗星；赢1局加1颗星，输1局减1颗星</li>
      <li><strong>连胜:</strong> 25级到6级连胜3场后可获得连胜奖励，每赢1局得到2颗星(1颗星为额外奖励)</li>
      <li><strong>升级/降级:</strong> 星星数超过当前等级最大数量则升级，小于0则降级；20级以下不降级</li>
    </ol>

    <h2>
      <span class="clickable" v-on:click="toggle.hypothesis = !toggle.hypothesis">
        假设
        <span v-show="toggle.hypothesis">+</span>
        <span v-show="!toggle.hypothesis">-</span>
      </span>
    </h2>
    <ol v-show="!toggle.hypothesis">
      <li>玩家胜率稳定，不受等级等因素影响</li>
    </ol>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */

import {Game, Player} from '../game/core'
import echarts from 'echarts'

const DEFAULT = {
  rate: 55,
  level: 25,
  star: 0,
  num: 500
}

let game = new Game()
let player = new Player(game)

let calc = (rate, level, star, num) => {
  player.reset({
    rate,
    level,
    star,
    streakNum: 0
  })
  let result = player.play(num)
  if (result.status === 'success') {
    console.info('Play Result')
    console.info('→ options', {rate, level, star, num})
    console.info('→ result', result)
    return result
  } else if (result.status === 'paramsErr') {
    let map = {
      rate: '胜率',
      level: '等级',
      star: '星星',
      num: '场次'
    }
    window.alert(`“${map[result['err'][0]]}”不对呢，改一下啦！`)
  }
}
let initLevelChart = (data) => {
  setTimeout(() => {
    let chart = echarts.init(document.getElementById('levelChart'))
    let len = data.legendNum || data.detail.length
    let xAxisData = new Array(len)
    let seriesData = new Array(len)
    for (let i = 0; i < len; i++) {
      xAxisData[i] = i + 1
      seriesData[i] = data['detail'][i]['level']
    }
    let option = {
      title: {
        text: ''
      },
      tooltip: {
        formatter: function (param) {
          return `${param.name}场 ${25 - param.data}级`
        }
      },
      legend: {
        data: ['等级']
      },
      xAxis: {
        name: '场次',
        data: xAxisData
      },
      yAxis: {
        name: '等级',
        interval: 1,
        axisLabel: {
          formatter: function (v) {
            return 25 - v
          }
        }
      },
      series: [{
        name: '等级',
        type: 'line',
        data: (function () {
          while (len--) {
            seriesData[len] = 25 - seriesData[len]
          }
          return seriesData
        })()
      }]
    }
    chart.setOption(option)
  }, 0)
}

export default {
  data: function () {
    return {
      result: {},
      rate: DEFAULT.rate,
      level: DEFAULT.level,
      star: DEFAULT.star,
      num: DEFAULT.num,
      toggle: {
        gameNum: true,
        levelDetail: true,
        rule: true,
        hypothesis: true
      }
    }
  },
  created: function () {
    this.result = calc(this.rate, this.level, this.star, this.num)
    initLevelChart(this.result)
  },
  methods: {
    calc: function () {
      let result = calc(this.rate, this.level, this.star, this.num)
      if (result) {
        this.result = result
        this.toggle.gameNum = true
        this.toggle.levelDetail = true
        initLevelChart(this.result)
      }
    },
    clear: function () {
      this.result = {}
    },
    reset: function () {
      this.rate = DEFAULT.rate
      this.level = DEFAULT.level
      this.star = DEFAULT.star
      this.num = DEFAULT.num
    }
  }
}
</script>

<style>
body {
  background: url(../assets/img/bg.jpg) center top;
  color: #552c09;
}
h2 {
  padding-bottom: 10px;
  border-bottom: 1px solid #552c09;
}
button {outline: none; cursor: pointer;}

.em {color: #d25300;}
.clickable {cursor: pointer;}
.input-text {width: 60px; outline: none;}
.btn {
  border: none;
  border-radius: 3px;
  background-color: #5d1477;
  color: #fff;
}
.page {
  width: 600px;
  margin: 30px auto;
  padding: 0 15px;
  border: 1px solid transparent;
  box-shadow: 0 0 20px #552c09;
  background-color: rgba(255, 255, 255, 0.7);
}
</style>

<style scoped>
#levelChart {
  width: 600px;
  height: 600px;
}
</style>
