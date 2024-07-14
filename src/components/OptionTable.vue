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
    table_columns: [
      {title: '买/卖', dataIndex: 'buy_sell', type: 'select', align: 'center', select_options: [{value: '买',
          label: '买'}, {value: '卖', label: '卖', input_value: 'other'}], udl_disable: false},
      {title: '合约数量', dataIndex: 'quantity', type: 'number', align: 'center', precision: 0, pct: false,
        min: 0, max: 1000000, step: 1, input_value: 'other', udl_disable: false},
      {title: '认购/认沽/现货', dataIndex: 'asset_type', type: 'select', align: 'center',
        select_options: [{value: '认购期权', label: '认购期权'}, {value: '认沽期权', label: '认沽期权'},
          {value: '现货标的', label: '现货标的', input_value: 'other'}], udl_disable: false},
      {title: '行权价', dataIndex: 'strike', type: 'number', align: 'center', precision: 3, pct: false,
        min: 0., max: 50, step: 0.001, input_value: 'other', udl_disable: true},
      {title: '距离到期天数', dataIndex: 'dte', type: 'number', align: 'center', precision: 0, pct: false,
        min: 0, max: 365, step: 1, input_value: 'other', udl_disable: true},
      {title: '波动率', dataIndex: 'vol_pct', type: 'number', align: 'center', precision: 4, pct: true,
        min: 0., max: 300, step: 0.0001, input_value: 'vol', udl_disable: true},
      {title: '期权价格', dataIndex: 'option_price', type: 'number', align: 'center', precision: 4, pct: false,
        min: 0., max: 1000, step: 0.0001, input_value: 'price', udl_disable: true},
      {title: '合约乘数', dataIndex: 'notional', type: 'number', align: 'center', precision: 0, pct: false,
        min: 10000, max: 50000, step: 1, input_value: 'other', responsive: ['lg'], udl_disable: true},
      {title: '现金流', dataIndex: 'cash_flow', type: 'cash_flow', align: 'center', responsive: ['lg']},
      {title: '删除', dataIndex: 'delete_btn', type: 'none', align: 'center'},
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
    openBase64Modal: false,
    base64_input: "",
  }),
  methods: {
    showBase64Modal() {
      this.openBase64Modal = true;
    },
    handleBase64ModalOk(e) {
      this.openBase64Modal = false;
    },
    input_value(index, input_type) {
      let item = this.options[index];
      if (item.asset_type === "现货标的") {
        this.options[index].strike = undefined;
        this.options[index].dte = undefined;
        this.options[index].vol_pct = undefined;
        this.options[index].option_price = undefined;
        this.options[index].notional = undefined;
      } else {
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
    deleteAsset(index) {
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
  <a-card title="期权组合计算">
    <a-row>
      <a-form layout="inline">
        <a-form-item label="现货价格">
          <a-input-number precision=3
                          step=".001"
                          @change="input_basic_value()"
                          v-model:value="basic_attributes.underlying_price" />
        </a-form-item>
        <a-form-item label="无风险利率">
          <a-input-number :min="0"
                          :max="100"
                          precision=2
                          step=".01"
                          @change="input_basic_value()"
                          :formatter="value => `${value}%`"
                          :parser="value => value.replace('%', '')"
                          v-model:value="basic_attributes.risk_free_rate_pct" />
        </a-form-item>
        <a-form-item label="红利率">
          <a-input-number :min="0"
                          :max="100"
                          precision=2
                          step=".01"
                          @change="input_basic_value()"
                          :formatter="value => `${value}%`"
                          :parser="value => value.replace('%', '')"
                          v-model:value="basic_attributes.dividend_rate_pct"/>
        </a-form-item>
        <a-form-item label="期权类型" >
          <a-select v-model:value="basic_attributes.option_style" disabled/>
        </a-form-item>
      </a-form>
    </a-row>
    <a-row>
      <a-col :span="24" style="text-align: right;">
        <div>
          <a-modal v-model:open="openBase64Modal" title="导入Base64" @ok="handleBase64ModalOk">
            <a-input class="vertical-gap" v-model:value="base64_input"></a-input>
            <a-button type="primary" @click="readPortfolioByText">导入</a-button>
            <a-button danger type="text" @click="resetBase64Input">清除</a-button>
            <template #footer>
              <a-button key="back" @click="handleBase64ModalOk">返回</a-button>
            </template>
          </a-modal>
        </div>
        <a-button class="horizontal-gap" type="primary" @click="showBase64Modal">导入Base64</a-button>
        <a-button class="horizontal-gap" type="primary" @click="copyPortfolio">导出Base64至剪切板</a-button>
        <a-button class="horizontal-gap" @click="readPortfolio">导入JSON</a-button>
        <a-button class="horizontal-gap" @click="savePortfolio">导出JSON</a-button>
        <a-button class="horizontal-gap" danger type="text" @click="resetAsset">重置</a-button>
      </a-col>
    </a-row>
    <a-row>
      <a-table bordered :data-source="current_options" :columns="table_columns"
               size="middle" pagination=false
               class="ant-table-striped"
               :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)">
        <template #bodyCell="{ index, column, record }">
          <template v-if="column.type === 'number'">
            <a-input-number v-model:value="current_options[index][column.dataIndex]"
                            @change="input_value(index, column.input_value)"
                            :disabled="column.udl_disable && record.asset_type === '现货标的'"
                            :precision=column.precision
                            :min=column.min
                            :max=column.max
                            :step=column.step
                            style="width: 100%"
                            :class="{'bold': (record.use_vol && column.dataIndex === 'vol_pct') ||
                            ((!record.use_vol) && column.dataIndex === 'option_price')}"
                            :formatter="column.pct? value => `${value}%`: value => `${value}`"
                            :parser="value => value.replace('%', '')"/>
          </template>
          <template v-else-if="column.type === 'select'">
            <a-select style="font-weight: bold"
                      @change="input_value(index, column.input_value)"
                      :disabled="column.udl_disable && record.asset_type === '现货标的'"
                      v-model:value="current_options[index][column.dataIndex]" :options="column.select_options"/>
          </template>
          <template v-else-if="column.type === 'cash_flow'">
            <div style="text-align: center;">
              {{record.asset_type === "现货标的" ?
                round(record.quantity * this.basic_attributes.underlying_price * (record.buy_sell === "买" ? -1 : 1), 4) :
                round(record.option_price * record.quantity * record.notional * (record.buy_sell === "买" ? -1 : 1), 4)}}</div>
          </template>
          <template v-else>
            <a-popconfirm
                v-if="current_options.length"
                title="确认删除？"
                @confirm="deleteAsset(index)"
            > <DeleteTwoTone two-tone-color="#eb2f96"/>
            </a-popconfirm>
          </template>
        </template>
        <template #summary v-if="screens['lg']">
          <a-table-summary-row>
            <a-table-summary-cell v-for="(column, i) in table_columns">
              <div v-if="i === 0" style="text-align: center; font-weight: bold">
                合计
              </div>
              <p v-else-if="column.type === 'cash_flow'" style="text-align: center"
                 :style="{color: sumCashFlow() > 0? 'red': 'green'}">
                <b>{{ sumCashFlow() }}</b>
              </p>
            </a-table-summary-cell>
          </a-table-summary-row>
        </template>
      </a-table>
    </a-row>
    <a-button type="primary" style="margin: 10px" @click="addAsset">增加资产</a-button>

    <a-row>
      <a-col style="width: 60%">
        <a-row>
          <a-form layout="inline">
            <a-form-item label="T+N日">
              <a-input-number :min="0"
                              :max="max_expiry_day()"
                              step="1"
                              precision=0
                              v-model:value="this.chart_attributes.day_from_today"
                              :formatter="value => `${value}`"/>
            </a-form-item>
            <a-form-item label="波动率">
              <a-input-number :min="0"
                              :max="100"
                              step="1"
                              precision=2
                              :formatter="value => `${value}%`"
                              :parser="value => value.replace('%', '')"
                              v-model:value="this.chart_attributes.vol_pct" />
            </a-form-item>
          </a-form>
        </a-row>
        <a-row>
          <Chart :option="getChartAttributes()"/>
        </a-row>
      </a-col>
      <a-col style="width: 40%">
        <a-card>
          <a-descriptions title="组合风险" bordered size="small" :column="1">
            <a-descriptions-item
                v-for="item in getGreeksTableContent()"
                :label="item.title"
                :label-style="{'font-weight': 'bold'}"
                :content-style="{'text-align': 'right',
                'color': (getPortfolioGreeks()[item.func] < 0) ? 'red': 'black'}">
              <div>
                {{Intl.NumberFormat(undefined,
                  {minimumFractionDigits: 6}).format(round(getPortfolioGreeks()[item.func], 6))}}
              </div>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup>
import { DeleteTwoTone } from '@ant-design/icons-vue';
import { Grid } from 'ant-design-vue';

const useBreakpoint = Grid.useBreakpoint;
const screens = useBreakpoint();
</script>

<style scoped>
.ant-row {
  margin: 10px;
}

.horizontal-gap {
  margin-inline: 5px;
}

.vertical-gap {
  margin-top: 5px;
  margin-bottom: 5px;
}

.bold * {
  font-weight: bold;
}

.ant-input-number :deep(input) {
  text-align: right;
  padding-right: 24px;
}

</style>
