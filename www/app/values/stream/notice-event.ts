
// event data format
export interface IEventNotice{
  guid : string,                        // 	
  eventType : string,						        // イベントタイプ					
  eventMessage : {					            // イベントメッセージ						
    eventDate : string,					        // 	イベント日時				
    eventMessage : string,			        // 	イベントメッセージ					
  },      
  cfdOrders : IEventOrder[],			      // 変更対象注文					
  cfdPositions : IEventPosition[]	      // 変更対象ポジション
  orderKeys:string[],						        // 削除対象注文キー					
  positionKeys:string[],				        // 削除対象ポジションキー						
  cfdProductCode : string,			        // 銘柄コード						
  executionKeys: string[]				        // 約定キー					
}
  
export interface IEventOrder{
  orderKey : string,					  	      // 注文キー 			
  changeNumber : number,			  	      // 変更回数				
  cfdProductCode : string,              // 銘柄コード				
  underlierCode : string,               // 原資産コード				
  productType : string,                 // CFD種別			
  buySellType : string,                 // 売買区分			
  settleType : string,                  // 仕切区分			
  executionType : string,               // 執行区分				
  orderType : string,                   // 注文方式			
  orderPrice : number,                  // 注文価格			
  orderQuantity : number,					      // 注文数量				
  allowedSlippage : number,				      // 許容スリッページ				
  trailWidth : number,						      // トレール幅			
  trailPrice : number,						      // トレール価格			
  invalidDatetime	: string,				      // 有効期限				
  invalidDate	: string,					        // 有効期限タイプ			
  invalidBusinessDate : string,		      // 有効期限業務日付					
  orderDatetime : string,					      // 注文日時				
  orderBusinessDate	: string,			      // 注文業務日付					
  orderStatus : string,						      // 注文タイプ			
  signal : string,							        // シグナル		
  failureReason : string,				        // 注文失効理由				
  cancelDatetime : string,				      // 注文取消日時				
  primaryOrderKey : string,				      // 主注文キー				
  ocoPairOrderKey : string,				      // ＯＣＯペアキー				
  orderMargin	: number,					        // 注文中必要証拠金			
  lossCutRate : number,						      // ロスカットレート			
  optionalMargin : number,				      // 注文中任意証拠金				
  peakPrice : number,						        // ピーク価格			
  triggerPriceId : string,				      // トリガー処理プライスID				
  lastTrailPriceId : string,			      // トレール処理プライスID					
  orderJointId : string,					      // 連結ID				
}
  
export interface IEventPosition{
  positionKey : string,				        	// ポジションキー			
  executionKey : string,				      	// 約定キー 				
  cfdProductCode : string,			    		// CFD銘柄コード				
  underlierCode : string,				      	// 原資産コード 				
  buySellType : string,					        // 売買区分			
  originalQuantity : number,	    			// 元数量					
  currentQuantity : number,		    			// 現在数量				
  orderQuantity : number,			      		// 注文中数量				
  quotationPrice : number,		    			// 建値				
  boUnit : number,						        	// 呼び値単位		
  margin : number,						        	// 必要証拠金		
  lossCutOrderKey : string,		    			// ロスカット注文キー				
  currency : string,					        	// 通貨名			
  tradeEndDatetime : string,		    		// 取引期日（決済期限）					
  tradeUnit : number,					        	// 取引単位			
  executionDate : string,				      	// 約定日時				
  interestRateAmount : number,		  		// 金利付与額					
  interestRateBalance : number,			  	// 金利残高					
  losscutRateCalc:{				              // ロスカットレート計算情報				
    powerAmout : number,						    // 		取引余力		
    optionalMargin : number,					  // 		任意証拠金			
    optionalMarginvariance : number,		// 		任意証拠金差異					
    optionalMarginAfterTotal : number,	// 		拘束証拠金(計算後)						
    losscutRate : number,						    // 		ロスカットレート		
  },
  dividendAmount : number,					    // 		配当金付与額				
  dividendBalance : number,					    // 		配当金残高				
}