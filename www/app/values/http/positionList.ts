/**-----------------------------------------------------------------------------
 * 情報取得要求 - 建玉一覧
 *
 *----------------------------------------------------------------------------*/
export interface IReqPositionList {
    listdataGetType:string;
    pageCnt:number;
}
    
// 正式サーバー電文では無く、内部cacheから取得する。
export interface IReqProductPosition {
    cfdProductCode:string;
}

/**-----------------------------------------------------------------------------
 * 情報取得応答 - 建玉一覧
 *
 *----------------------------------------------------------------------------*/
export interface IResPositionList {
    message:string;
    result:{
        positionList:IResPositionInfo[];
    };
    status:string;
    datetime:string;
 }

// 正式サーバー電文では無く、内部cacheから取得する。
export interface IResPositionInfo{
    positionKey:string;					// ポジションキー
    cfdProductCode:string;				// CFD銘柄コード
    buySellType:string;					// 売買区分
    currentQuantity:number;				// 現在数量
    orderQuantity:number;				// 注文中数量
    quotationPrice:number;				// 建値
    margin:number;						// 必要証拠金
    executionDate:string;				// 約定日時
    interestRateBalance:number;			// 金利残高
    losscutRate:number;					// ロスカットレート
    dividenedBalance:number;			// 配当金残高
    optionalMargin:number;				// 任意証拠金
}