/**-----------------------------------------------------------------------------
 * 情報取得要求 - プライス配信
 *
 *----------------------------------------------------------------------------*/
export interface IReqStreamPrice {
  
  }
  
/**-----------------------------------------------------------------------------
 * 情報取得応答 - プライス配信
 *
 *----------------------------------------------------------------------------*/
export interface IResStreamPrice {

  // prices:string,					// プライスのリスト
  // prices:IStreamPrice[];
}

export interface IStreamPrice {
  cfdProductCode:string,        // 銘柄コード					
  priceId:string,               // 対顧客プライスID			
  bid:string,                   // BID値		
  ask:string,                   // ASK値		
  high:string,                  // 当日高値			
  low:string,                   // 当日安値		
  change:string,                // 前日比			
  validFlag:string,             // プライス有効フラグ				
  createDatetime:string,        // プライス生成日時					
  createBusinessDate:string,		// プライス生成業務日付	
}
  