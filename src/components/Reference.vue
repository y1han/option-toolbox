<script>
export default {
  name: "Reference"
}
</script>

<template>
  <v-card class="elevation-1">
    <v-card-title>参考资料</v-card-title>
    <v-container>
      <v-card-title>期权风险指标对照表</v-card-title>
      <v-table>
        <thead>
        <tr>
          <th></th>
          <th style="text-align: center">认购/看涨期权 (Call)</th>
          <th style="text-align: center">认沽/看跌期权 (Put)</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td><p><b>BS公式价格</b></p></td>
          <td>
            <vue-latex :expression="'C_{t} = S_{t} e^{-q(T-t)} N(d_{1}) - K e^{-r(T-t)} N(d_{2})'" display-mode/>
          </td>
          <td>
            <vue-latex :expression="'P_{t} = -S_{t} e^{-q(T-t)} N(-d_{1}) + K e^{-r(T-t)} N(-d_{2})'" display-mode/>
          </td>
        </tr>
        <tr>
          <td><p><b>Delta (单份)</b></p></td>
          <td>
            <vue-latex :expression="'\\delta_{\\text{call}}=e^{-q(T-t)} N(d_{1})'" display-mode/>
          </td>
          <td>
            <vue-latex :expression="'\\delta_{\\text{put}}=-e^{-q(T-t)} N(-d_{1})'" display-mode/>
          </td>
        </tr>
        <tr>
          <td><p><b>Gamma (单份)</b></p></td>
          <td colspan="2">
            <vue-latex :expression="'\\gamma=\\frac{N\'(d_{1})e^{-q(T-t)}}{S_{t}\\sigma \\sqrt{T-t}}'"
                       display-mode/>
          </td>
        </tr>
        <tr>
          <td><p><b>Vega (单份)</b></p></td>
          <td colspan="2">
            <vue-latex :expression="'\\text{vega}=S_{t} e^{-q(T-t)}\\sqrt{T-t}N\'(d_{1})'"
                       display-mode/>
          </td>
        </tr>
        <tr>
          <td><p><b>Theta (单份)</b></p></td>
          <td>
            <vue-latex :expression="'\\theta_\\text{call}=-\\frac{S_{t} \\sigma N\'(d_{1})}{2 \\sqrt{T-t}} ' +
         '+ q S_{t} e^{-q(T-t)} N(d_{1}) - r K e^{-r(T-t)}N(d_{2})'"
                       display-mode/>
          </td>
          <td>
            <vue-latex :expression="'\\theta_\\text{put}=-\\frac{S_{t} \\sigma N\'(d_{1})}{2 \\sqrt{T-t}} ' +
         '- q S_{t} e^{-q(T-t)} N(-d_{1}) + r K e^{-r(T-t)}N(-d_{2})'"
                       display-mode/>
          </td>
        </tr>
        <tr>
          <td><p><b>Rho (单份)</b></p></td>
          <td>
            <vue-latex :expression="'\\rho_\\text{call}=K(T-t)e^{-r(T-t)}N(d_{2})'" display-mode/>
          </td>
          <td>
            <vue-latex :expression="'\\rho_\\text{put}=-K(T-t)e^{-r(T-t)}N(-d_{2})'" display-mode/>
          </td>
        </tr>
        <tr>
          <td><p><b>Delta</b></p></td>
          <td colspan="2">
            <vue-latex expression="\delta"/> (单份) * 合约乘数
          </td>
        </tr>
        <tr>
          <td><p><b>Gamma</b></p></td>
          <td colspan="2">
            <vue-latex expression="\gamma"/> (单份) * 合约乘数
          </td>
        </tr>
        <tr>
          <td><p><b>Vega</b></p></td>
          <td colspan="2">
            <vue-latex expression="vega"/> (单份) * 合约乘数
          </td>
        </tr>
        <tr>
          <td><p><b>Theta</b></p></td>
          <td colspan="2">
            <vue-latex expression="\theta"/> (单份) * 合约乘数
          </td>
        </tr>
        <tr>
          <td><p><b>Rho</b></p></td>
          <td colspan="2">
            <vue-latex expression="\rho"/> (单份) * 合约乘数
          </td>
        </tr>
        <tr>
          <td>
            <vue-latex :expression="'d_{1}'" display-mode/>
          </td>
          <td colspan="2">
            <vue-latex :expression="'\\frac{\\ln \\frac{S_{t}}{K} + ' +
         '(r - q + \\frac{\\sigma^2}{2})(T-t)}{\\sigma \\sqrt{T-t}}'"
                       display-mode/>
          </td>
        </tr>
        <tr>
          <td>
            <vue-latex :expression="'d_{2}'" display-mode/>
          </td>
          <td colspan="2">
            <vue-latex :expression="'\\frac{\\ln \\frac{S_{t}}{K} + ' +
         '(r - q - \\frac{\\sigma^2}{2})(T-t)}{\\sigma \\sqrt{T-t}} = d_{1} - \\sigma \\sqrt{T-t}'"
                       display-mode/>
          </td>
        </tr>
        </tbody>
      </v-table>
    </v-container>
    <v-container>
      <v-card-title>代数概念表</v-card-title>
      <v-table>
        <thead>
        <tr>
          <th style="text-align: center">代数</th>
          <th style="text-align: center">含义</th>
        </tr>
        </thead>
        <tbody>
          <tr>
            <td>e</td>
            <td>自然常数</td>
          </tr>
          <tr>
            <td>r</td>
            <td>无风险利率，默认设定为2.5%。</td>
          </tr>
          <tr>
            <td>q</td>
            <td>股息率，各标的需单独明确股息率。</td>
          </tr>
          <tr>
            <td><vue-latex :expression="'\\sigma'" display-mode/></td>
            <td>隐含波动率 (Implied Volatility)，标准算法为数值方法Brent Method，
              找出使得期权理论价格最接近于给定价格的IV。</td>
          </tr>
          <tr>
            <td>K</td>
            <td>行权价格</td>
          </tr>
          <tr>
            <td><vue-latex expression="S_{t}" display-mode/></td>
            <td>现货标的价格</td>
          </tr>
          <tr>
            <td>T - t</td>
            <td>剩余交易时间（精度以自然日计算；单位：年）</td>
          </tr>
          <tr>
            <td><vue-latex expression="N(x)" display-mode/></td>
            <td>正态分布的累计概率函数 (Cumulative Distribution Function)。
              <vue-latex expression="N(x) = \frac{1}{\sqrt{2 \pi}} \int_{-\infty}^{x} e^{-z^2/2}dz" display-mode/></td>
          </tr>
          <tr>
            <td><vue-latex expression="N'(x)" display-mode/></td>
            <td>正态分布的概率密度函数 (Probability Density Function)。
              <vue-latex expression="N'(x) = \frac{1}{\sqrt{2 \pi}} e^{-x^2/2}" display-mode/></td>
          </tr>
        </tbody>
      </v-table>
    </v-container>
  </v-card>
</template>

<style scoped>
v-table, th, tr, td {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-collapse: collapse;
  text-align: center;
}
</style>
