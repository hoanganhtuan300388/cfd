/**-----------------------------------------------------------------------------
 * 注文詳細要求
 * 
 *----------------------------------------------------------------------------*/
export interface IReqChartTick{
  cfdProductCode:string		// 銘柄コード      PathVariable
  count?:number				    // 本数           RequestParam
                          //                上限値=1000。上限値以上を指定した場合は、上限値を指定した場合と同じ挙動になる。
}
  
/**-----------------------------------------------------------------------------
 * 注文詳細応答
 * 
 *----------------------------------------------------------------------------*/
export interface IResChartTick {
  indexNo:number;       // ティックプライス連番
  tickTime:string;		  // ティックプライス時刻   yyyyMMddHHmmss 形式
  tickPrice:string;	    // ティックプライス値    
  businessDate:string;	// 営業日                yyyyMMdd 形式
}
  
/*
  ■　HTTPレスポンスステータスコード
      200(OK)							正常なデータ返却
      400(Bad Request)				引数が不正
      500(Internal Server Error)		想定外のエラー
*/