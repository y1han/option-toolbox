<script>
import template_strategy from "/src/plugins/template_strategy.js"

export default {
  name: "NavBar",
  data: () => ({
    simple_buy_sell: [
      {type: 'strategy', title: '备兑策略'},
      {type: 'strategy', title: '保险策略'},
      {type: 'strategy', title: '合成多头'},
      {type: 'strategy', title: '合成空头'},
      {type: 'strategy', title: '买认购期权'},
      {type: 'strategy', title: '卖认购期权'},
      {type: 'strategy', title: '买认沽期权'},
      {type: 'strategy', title: '卖认沽期权'},
    ],
    portfolio_strategies: [
      {type: 'subheader', title: '跨式/宽跨式'},
      {type: 'strategy', title: '买跨式'},
      {type: 'strategy', title: '卖跨式'},
      {type: 'strategy', title: '买宽跨式'},
      {type: 'strategy', title: '卖宽跨式'},
      {type: 'subheader', title: '垂直价差'},
      {type: 'strategy', title: '认购牛市价差'},
      {type: 'strategy', title: '认沽牛市价差'},
      {type: 'strategy', title: '认购熊市价差'},
      {type: 'strategy', title: '认沽熊市价差'},
      {type: 'subheader', title: '领口'},
      {type: 'strategy', title: '领口'},
    ],
  }),
  methods: {
    allStrategies() {
      let res = [];
      this.simple_buy_sell.forEach(item => {
        if(item.type === 'strategy') {
          res.push(item.title);
        }
      });
      this.portfolio_strategies.forEach(item => {
        if(item.type === 'strategy') {
          res.push(item.title);
        }
      });
      return res;
    },
    menuActionClick(action) {
      if (this.allStrategies().includes(action)) {
        if (template_strategy[action]) {
          this.$router.push({path: '/strategy/' + JSON.stringify(template_strategy[action])});
        }
      } else {
        alert('错误选项: ' + action);
      }
    }
  }
}
</script>

<template>
  <v-app-bar dense :elevation="2">
    <v-app-bar-title>期权工具箱</v-app-bar-title>
    <v-container>
      <v-btn color="gray">简易买卖
        <v-icon icon="mdi-triangle-small-down"></v-icon>
        <v-menu activator="parent">
          <v-list>
            <v-list-item class="smaller-font" v-for="(item, index) in simple_buy_sell" density="compact"
                         :key="index" :value="index" @click="menuActionClick(item.title)">
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>
      <v-btn color="gray">组合策略
        <v-icon icon="mdi-triangle-small-down"></v-icon>
        <v-menu activator="parent">
          <v-list>
            <v-list-item class="smaller-font" v-for="(item, index) in portfolio_strategies" density="compact"
                         :key="index" :value="index"
                         :disabled="item.type !== 'strategy'" @click="menuActionClick(item.title)">
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>
      <v-btn @click="$router.push('/')">期权组合计算</v-btn>
      <v-btn @click="$router.push('/option_calculator')">风险指标计算</v-btn>
      <v-btn @click="$router.push('/reference')">参考资料</v-btn>
    </v-container>
    <v-spacer></v-spacer>
  </v-app-bar>
</template>

<style scoped>
.smaller-font :deep(.v-list-item) {
  font-size: 30%;
}

.smaller-font.v-list-item {
  min-height: unset; /* or a length that suits you */
}
</style>
