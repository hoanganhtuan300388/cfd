/**-----------------------------------------------------------------------------
 * 情報取得要求 - 銘柄情報List
 *
 *----------------------------------------------------------------------------*/
export interface IReqProductList {

}

/**-----------------------------------------------------------------------------
 * 情報取得応答 - 銘柄情報List
 *
 *----------------------------------------------------------------------------*/
export interface IResProductList {
  message:string;
  result:{
    productList:IProductInfo[];
  };
  status:string;
  datetime:string;
}

// 銘柄情報
export interface IProductInfo{
  cfdProductCode:string,					        // CFD銘柄コード		
  meigaraSeiKanji:string,                 // 銘柄正称・漢字		
  meigaraSeiKana:string,					        // 銘柄正称・カナ		
  meigaraSeiBkana:string,				          // 銘柄正称・倍角カナ			
  meigaraRyakuKanji:string, 				      // 銘柄略称・漢字			
  meigaraRyakuKana:string, 				        // 銘柄略称・カナ			
  meigaraEiji:string, 					          // 銘柄名称・英字		
  securitiesCode:string, 				          // 証券コード		
  companyName1:string, 					          // 省略社名１		
  companyName2:string, 					          // 省略社名２		
  companyName3:string, 					          // 省略社名３		
  displayOrder:number, 					          // 表示順位		
  classificationCode:string,				      // 大分類コード			
  categoryCode:string,					          // 中分類コード		
  subCategoryCode:string,				          // 小分類コード		
  classificationName:string,				      // 大分類名			
  categoryName:string,					          // 中分類名		
  subCategoryName:string,				          // 小分類名		
  boUnit:number, 						              // 呼値単位
  tradeUnit:number, 						          // 取引単位	
  currency:string, 						            // 通貨	
  tradeStartDatetime:string,				      // 取引開始日時			
  tradeEndDatetime:string,				        // 取引終了日時			
  eachTradeTimeList:IEachTradeTime[],	    // 取引可能時間リスト			
  leverageRatio:number,					          // レバレッジ
  accountType:string,					            // 原資産区分
  dividendExistenceFlg:string,			      // 配当金有無FLG
  volatility:number,						          // ボラティリティ
}

// 取引可能時間リスト
export interface IEachTradeTime{
  eachTradeStartTime:string,              // 取引可能開始時間
  eachTradeEndTime:string,                // 取引可能終了時間
}