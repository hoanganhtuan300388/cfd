/**-----------------------------------------------------------------------------
 * 情報取得要求 - 注文一覧
 *
 *----------------------------------------------------------------------------*/
export interface IReqOrderList {
    listdataGetType:string,                             
    pageCnt?:number                             

}

/**-----------------------------------------------------------------------------
 * 情報取得応答 - 注文一覧
 *
 *----------------------------------------------------------------------------*/
export interface IResOrderList {
  message?:string;
  result:{
      // totalPageCount?:number,    
      orderDateFrom?:string,
      orderList:IResOrderItem[],
      append:boolean,
  };
  status?:string;
  datetime?:string;
  targetDateFrom  : string;     // 対象期間FROM   20180110
  targetDateTo    : string;     // 対象期間TO     20180116
}

// order list
export interface IResOrderItem{
  orderKey:string;          // 注文キー 
  cfdProductCode:string;    // 銘柄コード
  buySellType:string;       // 売買区分
  settleType:string;        // 仕切区分
  executionType:string;     // 執行区分
  orderType:string;         // 注文方式
  orderPrice:number;        // 注文価格
  orderQuantity:number;     // 注文数量
  trailWidth:number;        // トレール幅
  trailPrice:number;        // トレール価格
  invalidDateType:string;   // 1:当日限り 2:週末まで 3:翌週末まで
  invalidDatetime:string;   // 有効期限
  orderDatetime:string;     // 注文日時
  orderStatus:string;       // 注文ステータス
  orderJointId:string;      // 連結ID
  losscutRate:number;       // ロスカットレート
  allowedSlippage:number;   // 許容スリッページ
  positionKeyList:[         // ポジションキーリスト
    {positionKey:string}    // ポジションキー 
  ]
  isgroup?:boolean;
}
