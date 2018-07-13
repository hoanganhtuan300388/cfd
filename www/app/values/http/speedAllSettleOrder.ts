/**-----------------------------------------------------------------------------
 * 注文要求
 * 
 *----------------------------------------------------------------------------*/
export interface IReqSpeedAllSettleOrder {

 
  cfdProductCode: string;
  orderType: string;
  priceId: string;
  allowedSlippage?: number;
  orderBidPrice: string;
  orderAskPrice: string;                               

  
}

/**-----------------------------------------------------------------------------
 * 注文応答
 * 
 *----------------------------------------------------------------------------*/
export interface IResSpeedAllSettleOrder {

  
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