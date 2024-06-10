# Option Toolbox 期权工具箱
Inspired by <a href="https://optioncreator.com"> Option Creator </a>

工具箱以OptionCreator为基础模版，针对中国期权市场的情况以及相关的指标进行了一部分的调整，并使用Electron框架进行了包装，使其能够以App形式进行运行。

![MainWindow.png](./images/MainWindow.png)

## 已实现功能

1. 期权组合计算
   - 单标的隐含波动率计算（Brent方法）
   - 组合损益图绘制（可调整日期、波动率）
   - 组合风险指标计算
   - 组合导入导出（JSON、Base64格式）
   - 菜单栏设置了默认组合供选取
   - 支持根据价格/隐含波动率倒推另一个结果（粗体为固定住的参数）
2. 期权风险指标计算
   - 根据各个参数计算结果
   - 支持根据价格/隐含波动率倒推另一个结果（粗体为固定住的参数）


## 快速上手

- 部署相关包
    ```shell
    npm install
  ```
- 快速启动（开发模式）
    ```shell
    npm run start
  ```
- 对应用程序进行打包
    ```shell
    npm run package_win  # Windows (x64架构)
    npm run package_mac  # MacOS (arm64架构)
  ```


## 主要工具
- Electron
- Vue
- Vuetify
- ECharts
- KaTex


## 已知问题

1. 输入框无硬性限制，若数值过大可能会造成卡死的状况
2. 调整窗口大小时会导致部分组件显示有错误
3. mac版本文件过大，需要进行优化
