const template_call_850 = {
    asset_type: '认购期权',
    strike: 0.85,
    dte: 30,
    option_price: 0.0115,
    notional: 10000,
    vol_pct: 23.5993,
    use_vol: true
}  // 10006974.SH 2024/03/25

const template_call_800 = {
    asset_type: '认购期权',
    strike: 0.80,
    dte: 30,
    option_price: 0.0339,
    notional: 10000,
    vol_pct: 22.656,
    use_vol: true
}  // 10006973.SH 2024/03/25

const template_call_900 = {
    asset_type: '认购期权',
    strike: 0.90,
    dte: 30,
    option_price: 0.0040,
    notional: 10000,
    vol_pct: 26.7124,
    use_vol: true
}  // 10006975.SH 2024/03/25

const template_put_850 = {
    asset_type: '认沽期权',
    strike: 0.85,
    dte: 30,
    option_price: 0.0428,
    notional: 10000,
    vol_pct: 27.1559,
    use_vol: true
}  // 10006983.SH 2024/03/25

const template_put_800 = {
    asset_type: '认沽期权',
    strike: 0.80,
    dte: 30,
    option_price: 0.016,
    notional: 10000,
    vol_pct: 26.9841,
    use_vol: true
}  // 10006982.SH 2024/03/25

const template_put_900 = {
    asset_type: '认沽期权',
    strike: 0.90,
    dte: 30,
    option_price: 0.085,
    notional: 10000,
    vol_pct: 31.8733,
    use_vol: true
}  // 10006984.SH 2024/03/25

const template_underlying = {
    asset_type: '现货标的',
    quantity: 10000,
}

const template_strategy = {
    "备兑策略":
        [{
            buy_sell: '卖',
            quantity: 1,
            ...template_call_850,
        }, {
            buy_sell: '买',
            ...template_underlying
        }],
    "保险策略":
        [{
            buy_sell: '买',
            quantity: 1,
            ...template_put_850,
        }, {
            buy_sell: '买',
            ...template_underlying
        }],
    "合成多头":
        [{
            buy_sell: '买',
            quantity: 1,
            ...template_call_850
        }, {
            buy_sell: '卖',
            quantity: 1,
            ...template_put_850
        }
        ],
    "合成空头":
        [{
            buy_sell: '卖',
            quantity: 1,
            ...template_call_850
        }, {
            buy_sell: '买',
            quantity: 1,
            ...template_put_850
        }
        ],
    "买认购期权":
        [{
            buy_sell: '买',
            quantity: 1,
            ...template_call_850,
        }],
    "卖认购期权":
        [{
            buy_sell: '卖',
            quantity: 1,
            ...template_call_850,
        }],
    "买认沽期权":
        [{
            buy_sell: '买',
            quantity: 1,
            ...template_put_850,
        }],
    "卖认沽期权":
        [{
            buy_sell: '卖',
            quantity: 1,
            ...template_put_850
        }],
    "买跨式":
        [{
            buy_sell: '买',
            quantity: 1,
            ...template_call_850
        }, {
            buy_sell: '买',
            quantity: 1,
            ...template_put_850
        }
        ],
    "卖跨式":
        [{
            buy_sell: '卖',
            quantity: 1,
            ...template_call_850
        }, {
            buy_sell: '卖',
            quantity: 1,
            ...template_put_850
        }
        ],
    "买宽跨式":
        [{
            buy_sell: '买',
            quantity: 1,
            ...template_call_850
        }, {
            buy_sell: '买',
            quantity: 1,
            ...template_put_800
        }
        ],
    "卖宽跨式":
        [{
            buy_sell: '卖',
            quantity: 1,
            ...template_call_850
        }, {
            buy_sell: '卖',
            quantity: 1,
            ...template_put_800
        }
        ],
    "认购牛市价差":
        [{
            buy_sell: '买',
            quantity: 1,
            ...template_call_800
        }, {
            buy_sell: '卖',
            quantity: 1,
            ...template_call_850
        }
        ],
    "认沽牛市价差":
        [{
            buy_sell: '买',
            quantity: 1,
            ...template_put_800
        }, {
            buy_sell: '卖',
            quantity: 1,
            ...template_put_850
        }
        ],
    "认沽熊市价差":
        [{
            buy_sell: '买',
            quantity: 1,
            ...template_put_850
        }, {
            buy_sell: '卖',
            quantity: 1,
            ...template_put_800
        }
        ],
    "认购熊市价差":
        [{
            buy_sell: '买',
            quantity: 1,
            ...template_call_850
        }, {
            buy_sell: '卖',
            quantity: 1,
            ...template_call_800
        }
        ],
    "领口":
        [{
            buy_sell: '买',
            quantity: 1,
            ...template_put_800
        }, {
            buy_sell: '卖',
            quantity: 1,
            ...template_call_850
        }, {
            buy_sell: '买',
            quantity: 10000,
            ...template_underlying
        }
        ],
}

export default template_strategy
