export const OHLC_TYPE_CODES:any = {
  "4_1"  : { ohlcTypeCode: 99, key:"0",  text:"ティック"	}, 
  "0_1"  : { ohlcTypeCode:  1, key:"1",  text:"1分足"	}, 
  "0_5"  : { ohlcTypeCode:  3, key:"2",  text:"5分足"	}, 
  "0_10" : { ohlcTypeCode:  4, key:"3",  text:"10分足"}, 
  "0_15" : { ohlcTypeCode:  5, key:"4",  text:"15分足"}, 
  "0_30" : { ohlcTypeCode:  7, key:"5",  text:"30分足"}, 
  "0_60" : { ohlcTypeCode:  8, key:"6",  text:"60分足"}, 
  "5_2"  : { ohlcTypeCode:  9, key:"7",  text:"2時間足"},  // #2230
  "5_4"  : { ohlcTypeCode: 10, key:"8",  text:"4時間足"},  // #2230
  "5_6"  : { ohlcTypeCode: 11, key:"9",  text:"6時間足"},  // #2230
  "5_8"  : { ohlcTypeCode: 12, key:"10", text:"8時間足"},  // #2230
  "1_1"  : { ohlcTypeCode: 14, key:"11", text:"日足"	}, 
  "2_1"  : { ohlcTypeCode: 15, key:"12", text:"週足"	},
  "3_1"  : { ohlcTypeCode: 16, key:"13", text:"月足"	}, // #3259
}

export const INDICATOR_CODES:any = {
  SMA_TRIPLE:"0600",
  BOLLINGER_BANDS_TRIPLE_SUPER:"0601",
  SPANMODEL:"0602",
  HEIKINASHI:"0603",
  RSI_TRIPLE:"0604",
  ICHIMOKU_CFD:"0605",
  STOCHASTIC_CFD:"0606",

  MACD:"0607",
  RCI:"0608",
  EMA_TRIPLE:"0609",
  BOLLINGER_BANDS_TRIPLE:"0610",
}

// #2009

// 売買区分
export const OEP_BUYSELL_TYPE_SELL:string = "1";  // 売
export const OEP_BUYSELL_TYPE_BUY:string  = "2";  // 買

// 売買区分
export const ORDER_BUYSELL_TYPE_SELL:string = OEP_BUYSELL_TYPE_SELL;  // 売
export const ORDER_BUYSELL_TYPE_BUY:string  = OEP_BUYSELL_TYPE_BUY;  // 買
// 仕切区分
export const ORDER_SETTLE_TYPE_NEW:string  = "0"; // 新規
export const ORDER_SETTLE_TYPE_SETTLE:string = "1"; // 決済（仕切り）
export const ORDER_SETTLE_TYPE_LIST = {
  "0" : "新規",
  "1" : "決済（仕切り）"
};
export const ORDER_SETTLE_TYPE_LIST_SHORT = {
  "0" : "新",
  "1" : "決"
};

// 執行区分
export const ORDER_EXECUTION_TYPE_MARKET:string = "1"; // 成行
export const ORDER_EXECUTION_TYPE_LIMIT:string  = "2"; // 指値
export const ORDER_EXECUTION_TYPE_STOP:string   = "3"; // 逆指値
export const ORDER_EXECUTION_TYPE_LIST = {
  "1" : "成行",
  "2" : "指値",
  "3" : "逆指値",
};

// 注文方式
export const ORDER_METHOD_TYPE_NORMAL:string        = "1"; // 通常
export const ORDER_METHOD_TYPE_IFD:string           = "2"; // IFD
export const ORDER_METHOD_TYPE_OCO:string           = "3"; // OCO
export const ORDER_METHOD_TYPE_IFDOCO:string        = "4"; // IFD-OCO
export const ORDER_METHOD_TYPE_SETTLE_ALL:string    = "5"; // 一括決済
export const ORDER_METHOD_TYPE_TRAIL:string         = "6"; // トレール
export const ORDER_METHOD_TYPE_LOSSCUT:string       = "7"; // ロスカット
export const ORDER_METHOD_TYPE_SETTLE_FORCE:string  = "9"; // 強制決済
export const ORDER_METHOD_TYPE_LIST = {
	"1" : "通常",
	"2" : "IFD",
	"3" : "OCO",
	"4" : "IFD-OCO",
  "5" : "一括決済",
  "6" : "トレール",
  "7" : "ロスカット",
  "9" : "強制決済",
};

// 注文ステータス
export const ORDER_STATUS_WAITING:string        = "0"; // 待機中
export const ORDER_STATUS_VALID:string          = "1"; // 有効
export const ORDER_STATUS_COMMITTED:string      = "2"; // 約定済
export const ORDER_STATUS_CANCELD:string        = "3"; // 取消済
export const ORDER_STATUS_EXECUTING:string      = "4"; // 執行中
export const ORDER_STATUS_CANCELING:string      = "5"; // 取消中
export const ORDER_STATUS_INVALID:string        = "8"; // 失効

//