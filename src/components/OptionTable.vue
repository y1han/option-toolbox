<script>
import {EuropeanOption, Asset, optionAttributes} from "../plugins/option_model";
import Chart from "/src/components/OptionPnLChart.vue";
import template_strategy from "/src/plugins/template_strategy";

const {ipcRenderer} = require('electron');

const default_option = template_strategy["买认购期权"][0];
export default {
  name: "OptionTable",
  components: {Chart},
  data: () => ({
    headers: [
      {title: '买/卖', align: 'center', sortable: false, key: 'buy_sell', width: '110px'},
      {title: '合约数量', sortable: false, key: 'quantity', align: 'center', width: '160px'},
      {title: '认购/认沽/现货', sortable: false, key: 'asset_type', align: 'center', width: '160px'},
      {title: '行权价', sortable: false, key: 'strike', align: 'center'},
      {title: '距离到期天数', sortable: false, key: 'dte', align: 'center'},
      {title: '波动率', sortable: false, key: 'vol_pct', align: 'center', width: '160px'},
      {title: '期权价格', sortable: false, key: 'option_price', align: 'center'},
      {title: '合约乘数', sortable: false, key: 'notional', align: 'center'},
      {title: '现金流', sortable: false, key: 'cash_flow', align: 'center'},
      {title: '删除', sortable: false, key: 'delete_btn', align: 'center'},
    ],
    basic_attributes: {
      underlying_price: 0.82,
      risk_free_rate_pct: 2.5,
      dividend_rate_pct: 0.,
      option_style: "欧式"
    },
    options: [structuredClone(default_option)],
    chart_attributes: {
      day_from_today: 0,
      vol_pct: 30
    },
    base64_input: "",
  }),
  methods: {
    input_value(index, input_type) {
      let item = this.options[index];
      let option_type = (item.asset_type === "认购期权") ? "C" : "P";
      let option = new EuropeanOption(option_type, item.option_price, this.basic_attributes.underlying_price,
          item.strike, item.dte / 365, this.basic_attributes.risk_free_rate_pct / 100,
          this.basic_attributes.dividend_rate_pct / 100, item.notional);
      if (input_type === "vol") {
        item.use_vol = true;
        this.options[index].option_price = this.round(option.theoretical_option_price(item.vol_pct / 100), 4);
      } else if (input_type === "price") {
        item.use_vol = false;
        this.options[index].vol_pct = this.round(option.implied_volatility() * 100, 4);
      } else {
        if (item.use_vol) {
          this.input_value(index, "vol");
        } else {
          this.input_value(index, "price");
        }
      }
    },
    input_basic_value() {
      for (let i = 0; i < this.options.length; i++) {
        this.input_value(i, "other");
      }
    },
    max_expiry_day() {
      let max;
      for (let i = 0 ; i < this.options.length ; i++) {
        if (max == null || parseInt(this.options[i].dte) > parseInt(max))
          max = this.options[i].dte;
      }
      return max;
    },
    round(val, n) {
      return (Math.round(val * Math.pow(10, n)) / Math.pow(10, n));
    },
    addAsset() {
      this.options.push(structuredClone(default_option));
      this.input_value(this.options.length - 1, default_option.use_vol ? "vol": "price");
    },
    deleteAsset(asset) {
      const index = this.options.indexOf(asset);
      this.options.splice(index, 1);
    },
    resetAsset() {
      this.options = [];
      delete this.$route.params.strategy;
      this.addAsset();
    },
    resetBase64Input() { this.base64_input = "" },
    async savePortfolio() {
      const data = JSON.stringify({basics: this.basic_attributes, assets: this.options});
      try {
        // 注意->  第一个参数，为 主进程注册进来的方法名称。
        // 其他参数为， 主进程注册的函数参数。
        await ipcRenderer.invoke('saveFile', data, {
          title: '导出策略',
          buttonLabel: '导出',
          defaultPath: 'option_strategy.json',
          filters: [{
            name: 'JSON',
            extensions: ['json']
          }, {
            name: 'All Files',
            extensions: ['*']
          }]
        })
      } catch (e) {
        console.error('Save Portfolio Error!', e)
      }
    },
    async readPortfolio() {
      try {
        let response = await ipcRenderer.invoke('readFile', {
          title: '导入策略',
          buttonLabel: '导入',
          multiSelections: false,
          filters: [{
            name: 'JSON',
            extensions: ['json']
          }, {
            name: 'All Files',
            extensions: ['*']
          }]
        });
        if (response.success) {
          let saved_json = JSON.parse(response.data);
          this.basic_attributes = saved_json.basics;
          this.options = saved_json.assets;
        }
      } catch (e) {
        console.error('Read Portfolio Error!', e)
      }
    },
    readPortfolioByText() {
      try {
        let saved_json = JSON.parse(decodeURIComponent(escape(atob(this.base64_input))));
        this.basic_attributes = saved_json["basics"];
        this.options = saved_json["assets"];
      } catch (e) {
        console.error('Read Portfolio Error!', e)
      }
    },
    async copyPortfolio() {
      try {
        await navigator.clipboard.writeText(
            btoa(unescape(encodeURIComponent(
                JSON.stringify({basics: this.basic_attributes, assets: this.options})))));
        alert('Copied');
      } catch($e) {
        alert('Cannot copy');
      }
    },
    sumCashFlow() {
      let total = 0;
      let underlying_price = this.basic_attributes.underlying_price;
      this.options.forEach(function (item) {
        if (item.asset_type === "现货标的") {
          total += item.quantity * underlying_price * (item.buy_sell === "买" ? -1 : 1);
        } else {
          total += item.option_price * item.quantity * item.notional * (item.buy_sell === "买" ? -1 : 1);
        }
      })
      return this.round(total, 4);
    },
    portfolioPayoffs(low_limit_pct = 0., up_limit_pct = 2., precision = 3) {
      let gap = 1. / Math.pow(10, precision);
      let res = [];
      let up = low_limit_pct * this.basic_attributes.underlying_price;
      let r = this.basic_attributes.risk_free_rate_pct / 100;
      let q = this.basic_attributes.dividend_rate_pct / 100;
      let vol = this.chart_attributes.vol_pct / 100;
      let dft = this.chart_attributes.day_from_today;
      while (up < up_limit_pct * this.basic_attributes.underlying_price) {
        up = this.round(up, precision);
        let port_value = 0.;
        let port_current_value = 0.;
        this.options.forEach(function (item) {
          let dte = item.dte - dft;
          if (item.asset_type === "现货标的") {
            let underlying_value = item.quantity * up * (item.buy_sell === "买" ? 1 : -1);
            port_value += underlying_value;
            port_current_value += underlying_value;
          } else if (item.asset_type === "认购期权") {
            let basics = item.quantity * item.notional * (item.buy_sell === "买" ? 1 : -1);
            port_value += basics * Math.max(up - item.strike, 0);
            if (dte !== 0) {
              let option = new EuropeanOption("C", item.option_price, up, item.strike,
                  dte / 365, r, q, item.notional);
              port_current_value += basics * option.theoretical_option_price(vol);
            } else {
              port_current_value += basics * Math.max(up - item.strike, 0);
            }
          } else {
            let basics = item.quantity * item.notional * (item.buy_sell === "买" ? 1 : -1);
            port_value += basics * Math.max(item.strike - up, 0);
            if (dte !== 0) {
              let option = new EuropeanOption("P", item.option_price, up, item.strike,
                  dte / 365, r, q, item.notional);
              port_current_value += basics * option.theoretical_option_price(vol);
            } else {
              port_current_value += basics * Math.max(item.strike - up, 0);
            }
          }
        });
        res.push({
          underlying_price: up,
          port_value: this.round(port_value + this.sumCashFlow(), precision),
          port_current_value: this.round(port_current_value + this.sumCashFlow(), precision),
        });
        up += gap;
      }
      return {
        results: res,
        middle_point: (low_limit_pct + up_limit_pct) / 2 - 1,
      };
    },
    getChartAttributes() {
      let data = this.portfolioPayoffs();
      return {
        title: {
          text: '组合损益图',
          subtext: 'PnL'
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: 'cross'
          },
          valueFormatter: (value) => parseFloat(value).toFixed(2)
        },
        toolbox: {
          show: true,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          axisTick: {
            alignWithLabel: true
          },
          axisLine: {
            onZero: false,
          },
          axisPointer: {
            label: {
              formatter: function (params) {
                return ('现货价格：' + params.value);
              }
            }
          }
        },
        yAxis: [{}, {}],
        series: [
          {
            name: "组合当前价值",
            yAxisIndex: 0,
            symbol: 'none',
            type: 'line',
            areaStyle: {
              opacity: 0.1
            },
          },
          {
            name: "组合到期价值",
            yAxisIndex: 0,
            symbol: 'none',
            type: 'line',
            lineStyle: {color: 'gray', type: 'dashed', opacity: 0.8}
          },
        ],
        dataset: [{
          dimensions: ['underlying_price', 'port_current_value', 'port_value'],
          source: data.results,
        }],
        dataZoom: [
          {
            show: true,
            realtime: true,
            start: 40,
            end: 60,
            xAxisIndex: [0, 1]
          },
        ],
        visualMap: [
          {
            show: false,
            seriesIndex: 0,
            dimension: 1,
            pieces: [
              {lte: -0.0001, color: 'green'},
              // almost succeed to hide the zero label
              {gt: -0.0001, lt: 0.0001, color: 'transparent', label: ' '},
              {gte: 0.0001, color: 'red'}
            ],
            outOfRange: {
              color: '#6e6e6e'
            }
          },
          {show: false, seriesIndex: 1, pieces: [
              {lte: -0.0001, color: '#6e6e6e'},
              // almost succeed to hide the zero label
              {gt: -0.0001, lt: 0.0001, color: 'transparent', label: ' '},
              {gte: 0.0001, color: '#6e6e6e'}
            ],outOfRange: {color: '#6e6e6e'}}],
      };
    },
    getGreeksTableContent() {
      return optionAttributes;
    },
    getPortfolioGreeks() {
      let greeks = optionAttributes.map(x => x.func);
      let optionGreeks = {};
      for (const item of greeks) {
        optionGreeks[item] = 0;
      }
      let up = this.basic_attributes.underlying_price;
      let rf = this.basic_attributes.risk_free_rate_pct / 100;
      let q = this.basic_attributes.dividend_rate_pct / 100;
      this.options.forEach(function (item) {
        let netQty = item.quantity * (item.buy_sell === "买" ? 1 : -1);
        if (item.asset_type === "现货标的") {
          let asset = new Asset(up, 1);
          for (const g of greeks) {
            optionGreeks[g] += netQty * asset[g](0.);
          }
        } else {
          let optType = item.asset_type === "认购期权" ? "C" : "P";
          let opt = new EuropeanOption(optType, item.option_price, up, item.strike,
              item.dte / 365, rf, q, item.notional);
          let vol = item.vol_pct / 100;
          for (const g of greeks) {
            optionGreeks[g] += netQty * opt[g](vol);
          }
        }
      })
      return optionGreeks;
    }
  },
  computed: {
    current_options() {
      // alert(this.$route.params.strategy);
      if (this.$route.params.strategy !== undefined) {
        this.options = JSON.parse(this.$route.params.strategy);
      }
      return this.options;
    }
  },
}
</script>

<template>
  <v-card class="elevation-1">
    <v-card-title>期权组合计算</v-card-title>
    <v-container fluid class="mx-auto">
      <v-row class="pa-md-6 mx-lg-auto" justify-center tag="basics">
        <v-col>
          <text>现货价格</text>
          <v-text-field hide-details variant="solo" class="right-input"
                        @input="input_basic_value()"
                        v-model="this.basic_attributes.underlying_price"
                        type="number" min="0" step=".001"></v-text-field>
        </v-col>
        <v-col>
          <text>无风险利率</text>
          <v-text-field hide-details variant="solo" class="right-input" suffix="%"
                        @input="input_basic_value()"
                        v-model="this.basic_attributes.risk_free_rate_pct"
                        type="number" min="0" step=".01"></v-text-field>
        </v-col>
        <v-col>
          <text>红利率</text>
          <v-text-field hide-details variant="solo" class="right-input" suffix="%"
                        @input="input_basic_value()"
                        v-model="this.basic_attributes.dividend_rate_pct"
                        type="number" min="0" step=".01"></v-text-field>
        </v-col>
        <v-col>
          <text>期权类型</text>
          <v-select hide-details v-model="this.basic_attributes.option_style"
                    :items="['欧式', '美式']" disabled></v-select>
        </v-col>
        <v-spacer></v-spacer>
      </v-row>
      <v-row>
        <v-col align="right">
          <v-dialog max-width="500">
            <template v-slot:activator="{ props: activatorProps }">
              <v-btn
                  v-bind="activatorProps"
                  color="blue"
                  text="导入Base64"
                  variant="flat"
              ></v-btn></template>
            <template v-slot:default="{ isActive }">
              <v-card title="Base64导入">
                <v-text-field v-model="base64_input" style="margin: 20px"></v-text-field>
                <v-btn variant="tonal" color="blue" @click="readPortfolioByText" style="margin-inline: 4px">导入</v-btn>
                <v-btn variant="tonal" color="red" @click="resetBase64Input" style="margin-inline: 4px">清除</v-btn>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text="关闭窗口" @click="isActive.value = false"></v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
          <v-btn variant="flat" color="blue" @click="copyPortfolio" style="margin-inline: 4px">导出Base64至剪切板</v-btn>
          <v-btn variant="tonal" color="blue" @click="readPortfolio" style="margin-inline: 4px">导入JSON</v-btn>
          <v-btn variant="tonal" color="blue" @click="savePortfolio" style="margin-inline: 4px">保存JSON</v-btn>
          <v-btn variant="plain" color="red" @click="resetAsset" style="margin-inline: 4px">重置</v-btn>
        </v-col>
      </v-row>
      <v-row class="pa-md-6 mx-lg-auto" justify-center tag="option_table">
        <v-data-table :items="current_options" :headers="headers" class="elevation-0" hide-default-footer
                      disable-pagination items-per-page="-1">
          <template v-slot:item.buy_sell="{ item, index }">
            <v-select hide-details variant="solo" v-model="item.buy_sell"
                      @update:modelValue="input_value(index, 'other')"
                      hint="买/卖" :items="['买', '卖']"></v-select>
          </template>
          <template v-slot:item.quantity="{ item }">
            <v-text-field hide-details variant="solo" class="right-input" v-model="item.quantity"
                          type="number" :min="item.asset_type === '现货标的' ? 100 : 1"
                          :step="item.asset_type === '现货标的' ? 100 : 1"
                          hint="数量"></v-text-field>
          </template>
          <template v-slot:item.asset_type="{ item, index }">
            <v-select hide-details variant="solo" v-model="item.asset_type"
                      @update:modelValue="input_value(index, 'other')"
                      hint="认购期权/认沽期权/现货" :items="['认购期权', '认沽期权', '现货标的']"></v-select>
          </template>
          <template v-slot:item.strike="{ item, index }">
            <v-text-field hide-details variant="solo" class="right-input" v-model="item.strike" type="number" min="0"
                          step=".001" @input="input_value(index, 'other')"
                          v-if="item.asset_type !== '现货标的'" hint="行权价"></v-text-field>
          </template>
          <template v-slot:item.vol_pct="{ item, index }">
            <v-text-field hide-details variant="solo" class="" v-model="item.vol_pct" type="number" min="0"
                          :class="{'right-input': true, 'bold': item.use_vol}" @input="input_value(index, 'vol')"
                          step=".0001" v-if="item.asset_type !== '现货标的'" hint="波动率" suffix="%"></v-text-field>
          </template>
          <template v-slot:item.dte="{ item, index }">
            <v-text-field hide-details variant="solo" class="right-input" v-model="item.dte" type="number" min="0"
                          step="1" @input="input_value(index, 'other')"
                          v-if="item.asset_type !== '现货标的'" hint="剩余到期日期"></v-text-field>
          </template>
          <template v-slot:item.option_price="{ item, index }">
            <v-text-field hide-details variant="solo" v-model="item.option_price" type="number"
                          :class="{'right-input': true, 'bold': !item.use_vol}"
                          min="0" step=".0001" @input="input_value(index, 'price')"
                          v-if="item.asset_type !== '现货标的'" hint="期权价格"></v-text-field>
          </template>
          <template v-slot:item.notional="{ item }">
            <v-text-field hide-details variant="solo" class="right-input" v-model="item.notional" type="number" min="0"
                          step="1" v-if="item.asset_type !== '现货标的'" hint="期权合约乘数"></v-text-field>
          </template>
          <template v-slot:item.cash_flow="{ item }">
            {{
              item.asset_type === "现货标的" ?
                  round(item.quantity * this.basic_attributes.underlying_price * (item.buy_sell === "买" ? -1 : 1), 4) :
                  round(item.option_price * item.quantity * item.notional * (item.buy_sell === "买" ? -1 : 1), 4)
            }}
          </template>
          <template v-slot:item.delete_btn="{ item }">
            <v-btn variant="plain" icon="$close" color="red" @click="deleteAsset(item)"></v-btn>
          </template>
          <template v-slot:body.append>
            <tr class="border_bottom">
              <td v-for="(header, i) in headers" :key="i">
                <div v-if="i === 0">
                  <p style="font-size:120%;"><b>汇总</b></p>
                </div>
                <div v-if="header.key === 'cash_flow'">
                  <p style="font-size:120%;" :style="{color: sumCashFlow() > 0? 'red': 'green'}">
                    <b>{{ sumCashFlow() }}</b>
                  </p>
                </div>
                <div v-else>
                  <!-- empty table cells for columns that don't need a sum -->
                </div>
              </td>
            </tr>
          </template>
          <template #bottom></template>
        </v-data-table>
      </v-row>
      <v-row class="pa-md-6 mx-lg-auto" justify-center tag="add_asset_btn">
        <v-btn variant="flat" color="primary" @click="addAsset">增加资产</v-btn>
      </v-row>
    </v-container>
    <v-container fulid class="mx-auto">
      <v-row>
        <v-col cols="9">
          <v-row class="pa-md-6 mx-lg-auto" justify-center tag="basics">
            <v-col cols="2">
              <text>T+N日</text>
                <v-text-field hide-details variant="solo" class="right-input" v-model="this.chart_attributes.day_from_today"
                              type="number" min="0" :max="max_expiry_day()" step="1"/>
            </v-col>
            <v-col cols="2">
              <text>波动率</text>
              <v-text-field hide-details variant="solo" class="right-input" v-model="this.chart_attributes.vol_pct"
                              type="number" min="0" step="1" suffix="%"/>
            </v-col>
            <v-spacer></v-spacer>
          </v-row>
          <v-row>
            <Chart :option="getChartAttributes()"/>
          </v-row>
        </v-col>
        <v-col>
          <v-card>
            <v-table>
              <thead>
              <tr>
                <th></th>
                <th style="text-align: center; font-weight: bold">组合风险</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="item in getGreeksTableContent()" :key="item.title">
                <td style="text-align: center; font-weight: bold">{{ item.title }}</td>
                <td :class="{'negative': getPortfolioGreeks()[item.func] < 0, 'greeks-table': true}">
                  {{ this.round(getPortfolioGreeks()[item.func], 6) }}
                </td>
              </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<style scoped>
td :deep(div) {
  text-align: center;
}

.greeks-table {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-collapse: collapse;
  text-align: right;
}

.negative {
  color: red;
}

.v-row {
  border-radius: 10px;
}

.v-container {
  border-radius: 4px;
}

.v-data-table {
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.v-card {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.right-input :deep(input) {
  text-align: right;
}

.centered-input :deep(input) {
  width: 100%;
  justify-content: center;
}

.bold {
  font-weight: bold;
}
</style>
