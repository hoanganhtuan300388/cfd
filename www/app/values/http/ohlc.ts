/**-----------------------------------------------------------------------------
 * 注文詳細要求
 * 
 *----------------------------------------------------------------------------*/
export interface IReqOHLC{
  ohlcTypeCode:number			// チャートタイプ   PathVariable
  cfdProductCode:string		// 銘柄コード      PathVariable
  count?:number				    // 本数           RequestParam
                          //                上限値=1000。上限値以上を指定した場合は、上限値を指定した場合と同じ挙動になる。
}
  
/**-----------------------------------------------------------------------------
 * 注文詳細応答
 * 
 *----------------------------------------------------------------------------*/
export interface IResOHLC {
  datetime:string		// 日時
  open:string			// 始値
  high:string			// 高値
  low:string			// 低値
  close:string		// 終値
}
  
/*
  ■　HTTPレスポンスステータスコード
      200(OK)							正常なデータ返却
      400(Bad Request)				引数が不正
      500(Internal Server Error)		想定外のエラー
  
  ■　チャートタイプ(ohlcTypeCode)の有効値一覧
      1		分足
      2		3分足
      3		5分足
      4		10分足
      5		15分足
      6		20分足
      7		30分足
      8		1時間足
      9		2時間足
      10		4時間足
      11		6時間足
      12		8時間足
      13		12時間足
      14		日足
      15		週足
      16		月足
      17		年足
*/