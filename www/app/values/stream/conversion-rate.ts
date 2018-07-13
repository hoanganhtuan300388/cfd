/**-----------------------------------------------------------------------------
 * 情報取得要求 - 
 *
 *----------------------------------------------------------------------------*/
export interface IReqStreamConversionRate {
  
}

/**-----------------------------------------------------------------------------
* 情報取得応答 - conversion Rate 通知
*
*----------------------------------------------------------------------------*/
export interface IResStreamConversionRate {
  conversionRateList:IStreamConversionRate[];
}

export interface IStreamConversionRate{
  currency:string;				      // 通貨				
  createBusinessDate:string;		// 作成業務日付						
  seq:number;						        // 作成通番		
  createDatetime:string;			  // 作成日時					
  bid:string;						        // BID		
  ask:string;						        // ASK		
  floatingpos:number;				    // 有効小数桁数	
}