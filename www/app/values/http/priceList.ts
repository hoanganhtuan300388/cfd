/**-----------------------------------------------------------------------------
 * 情報取得要求 - レート取得
 *
 *----------------------------------------------------------------------------*/
export interface IReqPriceList {
  productCodes:string | string[];
  // [index: number]: IReqPrice;
}

export interface IReqPrice {
  productCodes:string;
}

/**-----------------------------------------------------------------------------
 * 情報取得応答 - レート取得
 *
 *----------------------------------------------------------------------------*/
export interface IResPriceList {
  message:string;
  result:{
    priceList:IResPrice[];
  };
  status:string;
  datetime:string;
}

// price info
export interface IResPrice{
  cfdProductCode:string;
  bid:string;
  ask:string;
  change:string;
  open:string;
  high:string;
  low:string;
  validFlag:string;
  bidChange:string;
  askChange:string;
  priceId:string;
}