<script>
import {EuropeanOption, optionAttributes} from "/src/plugins/option_model";
import {DeleteTwoTone} from "@ant-design/icons-vue";

export default {
  name: "OptionCalculator",
  components: {DeleteTwoTone},
  data: () => ({
    table_columns: [
      {title: '认购期权', dataIndex: 'call', align: 'center'},
      {title: '认沽期权', dataIndex: 'put', align: 'center'}
    ],
    option_basics: {
      underlying_price: 0.82,
      strike: 0.85,
      volatility: 30,
      year_to_expiry: 0.085,
      risk_free_rate_pct: 2.5,
      dividend_rate_pct: 0.,
      notional: 10000,
    },
    option_prices: {
      call: 0.0171,
      put: 0.0453,
    },
    change_status: {
      vol: true,
      call: false,
      put: false
    }
  }),
  methods: {
    input_value(input_type) {
      if (input_type === "vol") {
        this.change_status.vol = true;
        this.change_status.call = false;
        this.change_status.put = false;
        this.option_prices.call = this.round(this.getCall().theoretical_option_price(this.getVol()), 4);
        this.option_prices.put = this.round(this.getPut().theoretical_option_price(this.getVol()), 4);
      } else if (input_type === "call") {
        this.change_status.vol = false;
        this.change_status.call = true;
        this.change_status.put = false;
        let call = this.getCall();
        call.option_prices = this.option_prices;
        this.option_basics.volatility = this.round(call.implied_volatility() * 100, 4);
        this.option_prices.put = this.round(this.getPut().theoretical_option_price(this.getVol()), 4);
      } else if (input_type === "put") {
        this.change_status.vol = false;
        this.change_status.call = false;
        this.change_status.put = true;
        let put = this.getPut();
        put.option_prices = this.option_prices;
        this.option_basics.volatility = this.round(put.implied_volatility() * 100, 4);
        this.option_prices.call = this.round(this.getCall().theoretical_option_price(this.getVol()), 4);
      } else {
        if (this.change_status.vol) {
          this.input_value("vol");
        } else if (this.change_status.call) {
          this.input_value("call");
        } else if (this.change_status.put) {
          this.input_value("put");
        }
      }
    },
    round(val, n) {
      return (Math.round(val * Math.pow(10, n)) / Math.pow(10, n));
    },
    getCall() {
      return new EuropeanOption("C", this.option_prices.call, this.option_basics.underlying_price,
          this.option_basics.strike, this.option_basics.year_to_expiry, this.option_basics.risk_free_rate_pct / 100,
          this.option_basics.dividend_rate_pct / 100, this.option_basics.notional);
    },
    getPut() {
      return new EuropeanOption("P", this.option_prices.put, this.option_basics.underlying_price,
          this.option_basics.strike, this.option_basics.year_to_expiry, this.option_basics.risk_free_rate_pct / 100,
          this.option_basics.dividend_rate_pct / 100, this.option_basics.notional);
    },
    getVol() {
      return this.option_basics.volatility / 100;
    },
    getTableContent() {
      return optionAttributes;
    }
  }
}
</script>

<template>
  <a-card title="风险指标计算">
    <a-row>
      <a-col style="width: 30%">
        <a-card title="输入">
          <a-form layout="vertical">
            <a-form-item label="现货价格">
              <a-input-number @change="input_value('other')" v-model:value="this.option_basics.underlying_price"
                              size="large" min="0" step=".001" precision=3></a-input-number>
            </a-form-item>
            <a-form-item label="行权价">
              <a-input-number @change="input_value('other')" v-model:value="this.option_basics.strike"
                              size="large" min="0" step=".001" precision=3></a-input-number>
            </a-form-item>
            <a-form-item label="波动率">
              <a-input-number @change="input_value('vol')" v-model:value="this.option_basics.volatility"
                              size="large"
                              :formatter="value => `${value}%`"
                              :parser="value => value.replace('%', '')"
                              :class="{bold: change_status.vol}" min="0" step=".0001" precision=4></a-input-number>
            </a-form-item>
            <a-form-item label="剩余到期时间（年）">
              <a-input-number @change="input_value('other')" v-model:value="this.option_basics.year_to_expiry"
                              size="large" min="0" step=".001" precision=3></a-input-number>
            </a-form-item>
            <a-form-item label="无风险利率">
              <a-input-number @change="input_value('other')" v-model:value="this.option_basics.risk_free_rate_pct"
                              size="large"
                              :formatter="value => `${value}%`"
                              :parser="value => value.replace('%', '')"
                              min="0" step=".01" precision=2></a-input-number>
            </a-form-item>
            <a-form-item label="红利率">
              <a-input-number hide-details variant="solo"
                              @change="input_value('other')" v-model:value="this.option_basics.dividend_rate_pct"
                              size="large"
                              :formatter="value => `${value}%`"
                              :parser="value => value.replace('%', '')"
                              min="0" step=".01" precision=2></a-input-number>
            </a-form-item>
            <a-form-item label="合约乘数">
              <a-input-number @change="input_value('other')" v-model:value="this.option_basics.notional"
                              size="large" min="10000" step="1"></a-input-number>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
      <a-col style="width: 70%">
        <a-card title="输出">
          <table>
            <thead>
            <tr>
              <th></th>
              <th style="text-align: center; font-weight: bold">认购期权</th>
              <th style="text-align: center; font-weight: bold">认沽期权</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td style="text-align: center; font-weight: bold">期权价格</td>
              <td>
                <a-input-number v-model:value="option_prices.call"
                                :class="{bold: change_status.call}"
                                @change="input_value('call')"
                                :precision=4 :min="0." :step=".0001"
                                style="width: 100%"/>
              </td>
              <td>
                <a-input-number v-model:value="option_prices.put"
                                :class="{bold: change_status.put}"
                                @change="input_value('put')"
                                :precision=4 :min="0." :step=".0001"
                                style="width: 100%"/>
              </td>
            </tr>
            <tr v-for="item in getTableContent()" :key="item.title">
              <td style="text-align: center; font-weight: bold">{{ item.title }}</td>
              <td :class="{negative: getCall()[item.func](getVol()) < 0}">
                {{Intl.NumberFormat(undefined,
                  {minimumFractionDigits: 6}).format(round(getCall()[item.func](getVol()), 6))}}
              </td>
              <td :class="{negative: getPut()[item.func](getVol()) < 0}">
                {{Intl.NumberFormat(undefined,
                  {minimumFractionDigits: 6}).format(round(getPut()[item.func](getVol()), 6))}}
              </td>
            </tr>
            </tbody>
          </table>
        </a-card>
      </a-col>
    </a-row>
  </a-card>
</template>

<style scoped>
th, tr {
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-collapse: collapse;
  text-align: center;
  width: 30%;
  height: 100%;
  padding: 10px;
}

td {
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-collapse: collapse;
  text-align: right;
  width: 30%;
  height: 100%;
  padding: 8px;
}

table {
  width: 100%;
  height: 100%;
  align-content: center;
}

.ant-input-number {
  width: 50%;
}

.ant-input-number :deep(input) {
  text-align: right;
  padding-right: 24px;
}

.negative {
  color: red;
}

.bold * {
  font-weight: bold;
}
</style>
