<script>
import {EuropeanOption, optionAttributes} from "/src/plugins/option_model";

export default {
  name: "OptionCalculator",
  data: () => ({
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
  <v-card class="elevation-1">
    <v-card-title>风险指标计算</v-card-title>
    <v-container>
      <v-row>
        <v-col cols="3">
          <v-card>
            <v-col>
              <text>现货价格</text>
              <v-text-field hide-details variant="solo" class="right-input"
                            @input="input_value('other')" v-model="this.option_basics.underlying_price"
                            type="number" min="0" step=".001"></v-text-field>
            </v-col>
            <v-col>
              <text>行权价</text>
              <v-text-field hide-details variant="solo" class="right-input" v-model="this.option_basics.strike"
                            @input="input_value('other')" type="number" min="0" step=".001"></v-text-field>
            </v-col>
            <v-col>
              <text>波动率</text>
              <v-text-field hide-details variant="solo" v-model="this.option_basics.volatility"
                            :class="{bold: change_status.vol, 'right-input': true}" @input="input_value('vol')"
                            suffix="%" type="number" min="0" step=".0001"></v-text-field>
            </v-col>
            <v-col>
              <text>剩余到期时间（年）</text>
              <v-text-field hide-details variant="solo" class="right-input" v-model="this.option_basics.year_to_expiry"
                            @input="input_value('other')" type="number" min="0" step=".001"></v-text-field>
            </v-col>
            <v-col>
              <text>无风险利率</text>
              <v-text-field hide-details variant="solo" class="right-input"
                            @input="input_value('other')" v-model="this.option_basics.risk_free_rate_pct"
                            suffix="%" type="number" min="0" step=".01"></v-text-field>
            </v-col>
            <v-col>
              <text>红利率</text>
              <v-text-field hide-details variant="solo" class="right-input"
                            @input="input_value('other')" v-model="this.option_basics.dividend_rate_pct"
                            suffix="%" type="number" min="0" step=".01"></v-text-field>
            </v-col>
            <v-col>
              <text>合约乘数</text>
              <v-text-field hide-details variant="solo" class="right-input"
                            @input="input_value('other')" v-model="this.option_basics.notional"
                            type="number" min="10000" step="1"></v-text-field>
            </v-col>
          </v-card>
        </v-col>
        <v-col>
          <v-card>
            <v-table>
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
                  <v-text-field hide-details variant="solo"
                                :class="{bold: change_status.call, 'right-input': true}"
                                v-model="this.option_prices.call" @input="input_value('call')"
                                type="number" min="0" step=".0001"></v-text-field>
                </td>
                <td>
                  <v-text-field hide-details variant="solo"
                                :class="{bold: change_status.put, 'right-input': true}"
                                v-model="this.option_prices.put" @input="input_value('put')"
                                type="number" min="0" step=".0001"></v-text-field>
                </td>
              </tr>
              <tr v-for="item in getTableContent()" :key="item.title">
                <td style="text-align: center; font-weight: bold">{{ item.title }}</td>
                <td :class="{negative: getCall()[item.func](getVol()) < 0}">
                  {{ round(getCall()[item.func](getVol()), 6) }}
                </td>
                <td :class="{negative: getPut()[item.func](getVol()) < 0}">
                  {{ round(getPut()[item.func](getVol()), 6) }}
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
v-table, th, tr, td {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-collapse: collapse;
  text-align: center;
}

td {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-collapse: collapse;
  text-align: right;
}

.right-input :deep(input) {
  text-align: right;
}

.negative {
  color: red;
}

.bold {
  font-weight: bold;
}
</style>
