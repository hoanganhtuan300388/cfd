/**-----------------------------------------------------------------------------
 * 情報取得要求 - 約定一覧
 *
 *----------------------------------------------------------------------------*/
export interface IReqExecutionList {
  listdataGetType:string;
  pageCnt?:number;
  executionDateType?:string;  
  executionKeys?:string | string[];        // 約定キーリスト ※複数指定可能
}

/**-----------------------------------------------------------------------------
 * 情報取得応答 - 約定一覧
 *
 *----------------------------------------------------------------------------*/
export interface IResExecutionList {
  status:string;
  message:string;
  datetime:string;
  result:{
    // totalPageCount:number,
    executionList:IResExecutionItem[],
    append:boolean,
  };
  targetDateFrom  : string;     // 対象期間FROM   20180110
  targetDateTo    : string;     // 対象期間TO     20180116  
}

// execution list
export interface IResExecutionItem {
  executionKey:string;
  orderKey:string;
  cfdProductCode:string;
  buySellType:string;       // 1：売、2：買
  settleType:string;
  executionQuantity:number; // 決済数量
  executionPrice:number;    // 決済単価
  executionDatetime:string;
  settleDate:string;
  settleAmount:number;
  orderJointId:string;      // 連結ID
}