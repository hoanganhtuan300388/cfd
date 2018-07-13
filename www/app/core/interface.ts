import {ViewStateFlag, ViewDataFlag, fontSizeType } from '../const/commonEnum'
/**
 * view dataの変更イベント
 */
export interface IViewData{
    flag:ViewDataFlag;
    market?:string;             // 市場コード
    symbol?:string;             // 銘柄コード
    symbolName?:string;         // 銘柄名
    price?:number;              // 注文価格
    selFuOp?:string;            // 先物・OP区分
    index?:string;              // 先物指数
    strikePrice?:number;        // OPの権利行使価格
    callPut?:string;            // OPのCall・Put区分
    message?:string;            // エラーメッセージ
    groupId?:number;            // 画面データ共有 Group ID
}

/**
 * view stateの変更イベント
 */
export interface IViewState{
    type:ViewStateFlag;         // 通知イベントタイプ
    targetElement?:any;         // イベントを発生したElement
//    targetComponent?:any;       // イベントを発生したコンポネント
}

/**
 * DragDrop data
 */
export interface IDragDropData{
  flag:ViewDataFlag;          // data type
  market?:string;             // 市場コード
  symbol?:string;             // 銘柄コード
  symbolName?:string;         // 銘柄名
}

/**
 *
 */
export interface IPanel {
  id:string;
  component:string;
  title:string;
  subTitle:string;
}

/**
 *
 */
export interface IPanelInfo extends IPanel{
  virtualId:number;             // virtual screen id
  uniqueId:string;
  showscreen:boolean;
  zIndex:number;
  params:any;
  instance?:any;
  save?:boolean;                 // サーバー保存
}

/**
 * 
 */
export interface IPanelClose{
  id:string, 
  uniqueId:string, 
  reason:{
    closeReason:'movedOutSide'|'movedInSide'|'panelClosed', 
    panelParams:any
  }
}

/**
 *  focused panel info
 */
export interface IPanelFocus{
  id:string, 
  uniqueId:string,
  panelParams:any
}

/**
 * Speed order info
 */
export interface ISpeedOrderInfo{
  showConfirm?:boolean;
}



export interface iBoardPrice{
  productCode: {
    marketCode    : string;
    productType   : string;
    securityCode  : string;
  };
  element:  {
    bid: [{  // 買気配
      index?         : number;
      qty?:  {
        qty         : number;
      };
      price?:  {
        price       : number;
        decimals    : number;
      };
      status?        : string;
    }]
    ask: [{  // 売気配
      index?         : number;
      qty?:  {
        qty         : number;
      };
      price?:  {
        price       : number;
        decimals    : number;
      };
      time?          : string;
      status?        : string;      
    }]
    buyMarketOrderQty:  {
      qty         : number;
    };
    overAskQty:  {
      qty         : number;
    };
    sellMarketOrderQty:  {
      qty         : number;
    };
    underBidQty:  {
      qty         : number;
    };
  };
  snapshot_flag      : boolean;   // スナップショットフラグ
}

/**
 * price unit info 
 */
export interface iCodeInfo{
  code            : string;
  price           : number;   // current price
  upperLimitPrice : number;
  lowerLimitPrice : number;
  tradeUnit       : number;   // 売買単位
  tickCode        : string;   // 適用呼値単位
  attention?       : boolean;     // 取引注意
}


/**
 * tick price info -> snapshot
 */
export interface iTickPrice{
  productCode: {
    marketCode    : string;
    productType   : string;
    securityCode  : string;
  };
  element:  {
    openPrice:  { // 始値
      price:  {
        price     : number;
        decimals  : number;
      };
      time        : string;
    };
    highPrice:  { // 高値
      price:  {
        price       : number;
        decimals    : number;
      };
      time          : string;
      stopHighFlag  : boolean;
    };
    lowPrice:  {  // 安値
      price:  {
        price       : number;
        decimals    : number;
      };
      time          : string;
      stopLowFlag   : boolean;
    };
    currentPrice:  {  // 現在値
      price:  {
        price       : number;
        decimals    : number;
      };
      time          : string;
      status        : boolean;
      comparator    : number;
    };
    change:  {  // 前日比
      price:  {
        price       : number;
        decimals    : number;
      };
    };
    changeRatio:  { // 前日比率
      changeRatio:  {
        price       : number;
        decimals    : number;
      };
      time          : string;
      status        : boolean;
    };
    lastClosePrice: { // 終値
      price:  {
        price       : number;
        decimals    : number;
      };
      date          : string;
    }
    volume: { // 出来高
      volume:  {
        qty         : number;
      };
      time          : string;
    }
    tradingValue: { // 売買代金
      tradingValue:  {
        qty         : number;
      };
      time          : string;
    }    
    bid: {  // 買気配
      qty:  {
        qty         : number;
      };
      price:  {
        price       : number;
        decimals    : number;
      };
      time          : string;
      status        : boolean;      
    }
    ask: {  // 売気配
      qty:  {
        qty         : number;
      };
      price:  {
        price       : number;
        decimals    : number;
      };
      time          : string;
      status        : boolean;      
    }    
    tickPrice: {  // 歩み値
      index        : number;
      price:  {
        price       : number;
        decimals    : number;
      };
      time          : string;
    }
    lastTradingDate: {  // 最終取引日
      last_trade_date : string;
      remaining_days  : number;
    }
    optionIndicator: {  // オプション指標
      iv:  {
        price       : number;
        decimals    : number;
      };
      delta:  {
        price       : number;
        decimals    : number;
      };
      gamma:  {
        price       : number;
        decimals    : number;
      };
      vega:  {
        price       : number;
        decimals    : number;
      };
      theta:  {
        price       : number;
        decimals    : number;
      };
      theoreticalPrice:  {
        price       : number;
        decimals    : number;
      };                              
    }
  };
  snapshot_flag      : boolean;   // スナップショットフラグ
}

