
// panel element id prefix
export const PANEL_ID_PREFIX    = "scrid_";
export const COMPONENT_PREFIX   = "_gfhost_";

// max virtual screen count
export const MAX_VIRTUALSCREEN  = 3;

// for taskbar Groupping
export const PANEL_ID_ORDER         = '03020100';
export const PANEL_ID_SPEEDORDER    = '03020104';
export const PANEL_ID_LOSSCUTCHANGE = '03020200';

// panel limit size
export const PANEL_SIZE_MIN = 200;
export const PANEL_SIZE_MAX = 20000;

// サーバー保存用パネルコード
export const PANEL_CODE = '01';   // not used

// #1542, #1544
export const PANEL_TITLE_CHART:string = 'チャート';
//

export const PANELLIST = {
  '03010100': {selector:'scr-03010100', width:100, height:100, maxCount:1, external:false, save:false, title:'トップ画面'},
  '03010200': {selector:'scr-03010200', width:480, height:400, maxCount:1, external:false, save:false, title:'ログイン'},
  '03010300': {selector:'scr-03010300', width:720, height:480, maxCount:1, external:true,  save:false, title:'設定'},
  '03010400': {selector:'scr-03010400', width:314, height:218, maxCount:1, external:false, save:true,  title:'約定・失効通知'},
  '03010500': {selector:'scr-03010500', width:432, height:356, maxCount:1, external:true,  save:true,  title:'アラート'},

  '03020100': {selector:'scr-03020100', width:288, height:400, maxCount:8, external:true,  save:true,  title:'新規注文', alias:'注文'},
  '03020101': {selector:'scr-03020101', width:288, height:400, maxCount:8, external:true,  save:false, title:'注文変更'},
  '03020102': {selector:'scr-03020102', width:288, height:400, maxCount:8, external:true,  save:false, title:'注文取消'},
  '03020103': {selector:'scr-03020103', width:288, height:400, maxCount:8, external:true,  save:false, title:'決済注文'},
  '03020104': {selector:'scr-03020104', width:288, height:400, maxCount:8, external:true,  save:true,  title:'スピード注文'},
  '03020200': {selector:'scr-03020200', width:352, height:400, maxCount:8, external:false, save:false, title:'ロスカットレート変更'},
  '03020300': {selector:'scr-03020300', width:860, height:200, maxCount:1, external:false, save:true,  title:'注文一覧'},
  '03020301': {selector:'scr-03020301', width:1280, height:548, maxCount:1, external:false, save:false, title:'注文詳細'},
  '03020400': {selector:'scr-03020400', width:860, height:193, maxCount:1, external:false, save:true,  title:'建玉一覧'},
  '03020500': {selector:'scr-03020500', width:880, height:356, maxCount:1, external:false, save:true,  title:'約定履歴'},
  '03020600': {selector:'scr-03020600', width:288, height:335, maxCount:1, external:false, save:true,  title:'振替'},
  '03020700': {selector:'scr-03020700', width:736, height:632, maxCount:1, external:false, save:true,  title:'余力詳細'},

  '03030100': {selector:'scr-03030100', width:720, height:280, maxCount:1, external:false, save:true,  title:'レート一覧'},
  '03030101': {selector:'scr-03030101', width:320, height:200, maxCount:3, external:false, save:false, title:'価格調整額'},
  '03030102': {selector:'scr-03030102', width:320, height:632, maxCount:3, external:false, save:false, title:'企業情報'},
  '03030103': {selector:'scr-03030103', width:320, height:632, maxCount:3, external:false, save:false, title:'ファンド情報'},
  '03030200': {selector:'scr-03030200', width:562, height:384, maxCount:1, external:false, save:true,  title:'マーケットサマリー'},
  '03030300': {selector:'scr-03030300', width:745, height:396, maxCount:1, external:false, save:true,  title:'経済カレンダー'},
  '03030400': {selector:'scr-03030400', width:600, height:512, maxCount:1, external:true,  save:false, title:'お知らせ'},

  '03030500': {selector:'scr-03030500', width:720, height:256, maxCount:1, external:false, save:true,  title:'ニュース'},
  '03030501': {selector:'scr-03030501', width:600, height:332, maxCount:1, external:false, save:false, title:'ニュース詳細'},
  '03030600': {selector:'scr-03030600', width:772, height:480, maxCount:6, external:true,  save:true,  title:'チャート'},
  '03030601': {selector:'scr-03030601', width:720, height:480, maxCount:1, external:true,  save:false,  title:'テクニカル設定'}, // #2994
  
  '03030602': {selector:'scr-03030602', width:772, height:480, maxCount:1, external:true,  save:true,  title:'ミニチャート'}, // #2247
}

// max row watch list
export const MAX_ROW_WATCHLIST      = 10;

// determine window is alive loop time
export const DETERMINE_WINDOW_ALIVE_LOOP = 1000;

// window is alive time
export const WINDOW_IS_ALIVE        = 3000;

// send message loop time
export const SEND_MESSAGE_TIME      = 1000;

export const SELL_TYPE_VAL      = '1';
export const BUY_TYPE_VAL       = '2';
export const NEW_ORDER_VAL      = '0';
export const SETTLE_ORDER_VAL   = '1';
export const EXEC_MARKET_P_VAL  = '1';  // 成行
export const EXEC_LIMIT_P_VAL   = '2';
export const EXEC_STOP_P_VAL    = '3';
export const ORDER_NORMAL       = '1';  // 通常
export const ORDER_IFD          = '2';  // IFD
export const ORDER_OCO          = '3';  // OCO
export const ORDER_IFD_OCO      = '4';  // IFD_OCO

export const PRICE_FLAG_NG      = '0';  // 0: disable flage 1: enable flag

// for blink-element
export const BLINK_NONE  = 0;
export const BLINK_UP    = 2;    // up price
export const BLINK_DOWN  = 3;    // down price

export const ERROR_QTY = "取引数量を確認して下さい。";
export const ERROR_PASS = "暗証番号を確認して下さい。";

export const DOMESTIC_STOCK = '10'; // 10	国内株式  41	国内株価指数先物  42	国内株化指数OP

// event notifier type
export const NoticeType = {
  NOTIFY_EXECUTION          : 'NOTIFY_EXECUTION',         // 約定通知（通知イベント）
  NOTIFY_ORDER_INVALIDAION  : 'NOTIFY_ORDER_INVALIDAION', // 注文失効通知（通知イベント）
  EXECUTION                 : 'EXECUTION',                // 約定
  ORDER_INVALIDATION        : 'ORDER_INVALIDATION',       // 注文失効
  NEW_ORDER                 : 'NEW_ORDER',                // 新規注文
  SETTLE_ORDER              : 'SETTLE_ORDER',             // 決済注文
  ORDER_UPDATE              : 'ORDER_UPDATE',             // 注文変更
  ORDER_CANCEL              : 'ORDER_CANCEL',             // 注文取消
  INTEREST_ADJUSTMENT       : 'INTEREST_ADJUSTMENT',      // 金利調整受払
  LOSSCUT_RATE_UPDATE       : 'LOSSCUT_RATE_UPDATE',      // ロスカットレート変更
  LOSSCUT_RATE_SETTLE       : 'LOSSCUT_RATE_SETTLE',      // ロスカットレート決済
  SQ_SETTLE                 : 'SQ_SETTLE',                // SQ決済
  TRAIL                     : 'TRAIL',                    // トレール注文
  SPEED_EXECUTION           : 'SPEED_EXECUTION',          // スピード注文約定
  SPEED_EXPIRE              : 'SPEED_EXPIRE',             // スピード注文失効
  EXPIRE                    : 'EXPIRE',                   // 失効
  UNEXPECTED_INCIDENT       : 'UNEXPECTED_INCIDENT',      // 約定異常
  NOTIFY_SPEED_EXPIRE       : 'NOTIFY_SPEED_EXPIRE',      // スピード注文失効通知（通知イベント）
  NOTIFY_EXPIRE             : 'NOTIFY_EXPIRE',            // 失効通知（通知イベント）
  REFRESH                   : 'REFRESH',                  // リフレッシュ
  CHART_REFRESH             : 'CHART_REFRESH',            // チャートリフレッシュ
}

// #1542
export const INDEX_LIST = {
  '101'     : '日経平均',
  '151'     : 'TOPIX',
  '196'     : 'Jストック',
  '190'     : 'JQ指数',
  '154'     : 'マザーズ指数',
}

/**
 * 銘柄タイプProductType
 */
export const PRODUCT_TYPE_ITEM_OTHER:string						= '0';  //  その他
export const PRODUCT_TYPE_ITEM_STOCK:string						= '1';  //	株
export const PRODUCT_TYPE_ITEM_INDEX_FUTURES:string		= '2';	//  指数先物
export const PRODUCT_TYPE_ITEM_INDEX_OPTIONS:string		= '3';	//  指数オプション
export const PRODUCT_TYPE_ITEM_INDEX:string						= '4';  //  指数


export const WS_PRODUCT_TYPE_LIST = {
  'OTHER'         : PRODUCT_TYPE_ITEM_OTHER,  				//  その他
  'STOCK'					: PRODUCT_TYPE_ITEM_STOCK,  				//	株
  'INDEX_FUTURES'	:	PRODUCT_TYPE_ITEM_INDEX_FUTURES,	//  指数先物
  'INDEX_OPTIONS' :	PRODUCT_TYPE_ITEM_INDEX_OPTIONS,	//  指数オプション
  'INDEX'         :	PRODUCT_TYPE_ITEM_INDEX,  				//  指数
}

export const INDEX_CODE_LEN   = 3;  // index code length
export const FOP_CODE_LEN   = 9;  // future code length

// レスポンスステータス 0：OK 8：CHECK 9：NG
export const ORDER_RESPONSE_OK = 0  // ok
export const ORDER_RESPONSE_CHECK = 8  // check
export const ORDER_RESPONSE_NG = 9  // ng

//

// #2032
export const SETTING_FUNCTION_ID_ORDER_GENERAL:string     = "001";
export const SETTING_FUNCTION_ID_ORDER_BY_PRODUCT:string  = "002";
export const SETTING_FUNCTION_ID_SOUND:string             = "003";
export const SETTING_FUNCTION_ID_DISPLAY:string           = "004";
export const SETTING_FUNCTION_ID_CHART_DISPLAY:string     = "005";
export const SETTING_FUNCTION_ID_CHART_COLOR:string       = "006";
export const SETTING_FUNCTION_ID_CHART_TECHNICAL:string   = "007";
export const SETTING_FUNCTION_ID_ALERT:string             = "008";

export const ORDER_TITLE = {
  '0' : '新規注文',
  '1' : '決済注文',
}

export const INVALIDDATE_TYPE_TXT = {
  '1' : '当日',
  '2' : '週末',
  '3' : '翌週末',
}

// #2410
export const PANEL_ID_NEW_ORDER:string = '03020100';
export const NEW_ORDER_PRICE_AUTO_UPDATE_PRICE:string = '__auto_price__';
//

// パネル左右移動禁止幅
export const FORBIDDEN_DISTANT = 30;

// レート一覧page count
export const PAGE_PER_UNIT  = 10;
