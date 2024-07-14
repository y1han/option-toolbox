<script>
import template_strategy from "/src/plugins/template_strategy.js"

export default {
  name: "NavBar",
  data: () => ({
    menu_component: [
      {key: "/", label: "期权组合计算", title: "期权组合计算"},
      {key: "/option_calculator", label: "风险指标计算", title: "风险指标计算"},
      {key: "/reference", label: "参考资料", title: "参考资料"}
    ],
    simple_buy_sell: [
      {key: '/strategy', label: '备兑策略'},
      {key: '/strategy', label: '保险策略'},
      {key: '/strategy', label: '合成多头'},
      {key: '/strategy', label: '合成空头'},
      {key: '/strategy', label: '买认购期权'},
      {key: '/strategy', label: '卖认购期权'},
      {key: '/strategy', label: '买认沽期权'},
      {key: '/strategy', label: '卖认沽期权'},
    ],
    portfolio_strategies: [
      {key: 'straddle', type: 'group', label: '跨式/宽跨式',
        children: [
            {key: '/strategy', label: '买跨式'},
            {key: '/strategy', label: '卖跨式'},
            {key: '/strategy', label: '买宽跨式'},
            {key: '/strategy', label: '卖宽跨式'}]},
      {key: 'spread', type: 'group', label: '垂直价差',
        children: [
            {key: '/strategy', label: '认购牛市价差'},
            {key: '/strategy', label: '认沽牛市价差'},
            {key: '/strategy', label: '认购熊市价差'},
            {key: '/strategy', label: '认沽熊市价差'}]},
      {key: 'linko', type: 'group', label: '领口',
        children: [
            {key: '/strategy', label: '领口'}]},
    ],
  }),
  methods: {
    handleClick(item) {
      this.$router.push(item.key);
    },
    menu_list() {
      let res = [];
      let sbs = [];
      this.simple_buy_sell.forEach(item => {
        sbs.push({title: item.label, label: item.label,
          key: item.key + "/" + JSON.stringify(template_strategy[item.label])});
      });
      res.push({key: 'simple_buy_sell', label: '简易买卖', title: '简易买卖',
        children: [{type: 'group', label: '简易买卖', children: sbs}]});
      let ps = [];
      this.portfolio_strategies.forEach(item => {
        let subheader = [];
        item.children.forEach(child_item => {
          subheader.push({label: child_item.label,
            key: child_item.key + "/" + JSON.stringify(template_strategy[child_item.label])});
        })
        ps.push({key: item.key, type: item.type, label: item.label, children: subheader});
      });
      ps = [{key: 'portfolio_strategies', label: '组合策略', title: '组合策略', children: ps}];
      res = [...res, ...ps, ...this.menu_component];
      return res;
    },
  }
}
</script>

<template>
  <a-row style="background-color: white">
    <a-col style="width: 10%; background-color: white; align-content: center">
      <h1 style="text-align: center; font-size: 1.5vw;">期权工具箱</h1>
    </a-col>
    <a-col style="width: 80%">
      <a-menu mode="horizontal" @click="handleClick" :items="menu_list()" />
    </a-col>
  </a-row>
</template>

<style scoped>
</style>
