/**-----------------------------------------------------------------------------
 * 情報取得要求 - 注文一覧
 *
 *----------------------------------------------------------------------------*/
export interface IReqconversionRate {
    
}

/**-----------------------------------------------------------------------------
 * 情報取得応答 - 注文一覧
 *
 *----------------------------------------------------------------------------*/
export interface IResconversionRate {
  status:string;
  message:string;
  datetime:string;
  result:{
    conversionRateList:IConversionRate[];
  };
}

export interface IConversionRate{
    currency:string;
    createBusinessDate:string;
    createDatetime:string;
    floatingpos:string;
    seq:string;
    bid:string;
    ask:string;
}