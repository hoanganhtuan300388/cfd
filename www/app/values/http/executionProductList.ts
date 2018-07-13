/**-----------------------------------------------------------------------------
 * 情報取得要求 - 約定銘柄一覧取得
 *
 *----------------------------------------------------------------------------*/
export interface IReqExecutionProductList {}

/**-----------------------------------------------------------------------------
 * 情報取得応答 - 約定銘柄一覧取得
 *
 *----------------------------------------------------------------------------*/
export interface IResExecutionProductList {
  status:string;
  message:string;
  datetime:string;
  result:{
    executionProductList:IExecutionProductList[]
  };
}

// executionProduct list
interface IExecutionProductList{
  cfdProductCode:string;
  meigaraSeiKanji:string;
}