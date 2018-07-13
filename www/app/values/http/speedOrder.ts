/**-----------------------------------------------------------------------------
 * 注文要求
 * 
 *----------------------------------------------------------------------------*/
export interface IReqSpeedOrder {

 
  cfdProductCode: string;
  orderType: string;
  buySellType: string;
  executionType: string;
  orderQuantity:string;
  allowedSlippage?: number;
  priceId: string;
  orderBidPrice: string;
  orderAskPrice: string;
}

/**-----------------------------------------------------------------------------
 * 注文応答
 * 
 *----------------------------------------------------------------------------*/
export interface IResSpeedOrder {

  
  status: string; 
  message: string;
  datetime: string;
  // メッセージ
  // レスポンスステータスがCHECKの場合、keyが付与される。
  result: string;
  clientInfoMessage:clientInfoMessage[];
}

interface clientInfoMessage{
    messageCode: string;
    message: string;
    returnType: string;
}