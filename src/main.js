require('normalize.css')

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Simulator from './page/Simulator'
import NotFound from './page/NotFound'
import Demo from './page/Demo'

const routes = {
  '/': Simulator,
  '/demo': Demo
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  data: {
    currentRoute: window.location.pathname
  },
  computed: {
    ViewComponent () {
      return routes[this.currentRoute] || NotFound
    }
  },
  render (h) {
    return h(this.ViewComponent)
  }
})
