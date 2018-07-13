/**
 * 
 * BusinessService
 * 
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Deferred } from "../util/deferred";

import { Subject } from 'rxjs/Subject';
import { CommonConst } from '../core/common';

import { SymbolManage } from '../core/symbolManage';
import { Notification } from '../core/notification';

import { IRequestApi, IResponseApi} from "../../../common/interface";
import * as api from "../../../common/businessApi";
import * as commonApp from "../../../common/commonApp";

import * as values from "../values/Values";

const electron = (window as any).electron;

interface QUERY{
  data:IRequestApi;
  subject:Deferred<any>;
}

//-----------------------------------------------------------------------------
// SERVICE : BusinessService
// ----------------------------------------------------------------------------
@Injectable()
export class BusinessService {

  //---------------------------------------------------------------------------
  // property
	// --------------------------------------------------------------------------  
	private _sequence = 0;
	private _querys:QUERY[] = [];

  // 銘柄管理
  public symbols:SymbolManage = null;
	
  // 通知管理
	public notifyer:Notification = null;
		
	// private businessHelper:BusinessHelper;
	//---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------	
  constructor( ){

  }
  
  public init(){
		if( electron ){
			this.listen();
    }

    this.notifyer = new Notification();
    this.symbols = new SymbolManage(this);
  }
  
  /**
   * receive query result
   */
	private listen(){
    // receive query result.
		electron.ipcRenderer.on( commonApp.IPC_BUSINESS_REPLY, (event, arg) => {
			for( var i=0; i < this._querys.length; i++ ){
				var query = this._querys[i];

        // find query info.
				if( query.data.sequence == arg.sequence ){
          var result = arg.output;

          console.log("[response] ", arg);

          if(result){
            if(result.status == api.ERROR_CODE.NETWORK){
              // network error.
              query.subject.error(result);
            }else if(result.status == api.ERROR_CODE.HTTP){
              // http status error
              query.subject.error(result);
            }else{
              // send result.
              query.subject.next(result);
              query.subject.complete();
            }
          }else{
            query.subject.error(result);
          }

					// remove query
					query.subject = null;
          this._querys.splice(i,1);

					break;
				}
			}
		})
  }
  
  /**
   * send query to main process
   * 
   * @param data 
   * @param def 
   * @param api 
   */
	private queryData( data:IRequestApi, def:Deferred<any>, api:string ){
    // set api info.
    data.api = api; // api name
    data.sequence = this.sequence;

    // send query to main process
		if( electron ){
      console.log("[request] ", data);
			electron.ipcRenderer.send( commonApp.IPC_BUSINESS_QUERY, data );

      // push query info
			this._querys.push( {data:data, subject:def} );
		}
		
		return def;
	}

	/**
	 * get request sequence number
	 */
	get sequence(){
		var seq = this._sequence++;

		seq = seq >= Number.MAX_SAFE_INTEGER?0:seq;

		return seq;
	}

	//---------------------------------------------------------------------------
  // member
	//---------------------------------------------------------------------------
	// 取引注意銘柄リスト
	public getAttentionInfoList(input: values.IReqAttentionInfo ):Observable<values.IResAttentionInfo> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResAttentionInfo>(), api.BusinessApi.API.attentionInfo.name );
  }
	
	// 注文一覧取得
	public getOrderList(input: values.IReqOrderList ):Observable<values.IResOrderList> {
		var query:IRequestApi = {input:input};

		return this.queryData( query, new Deferred<values.IResOrderList>(), api.BusinessApi.API.getOrderList.name );
  }
  
	public getOrderListDirect(input: values.IReqOrderList ):Observable<values.IResOrderList> {
		var query:IRequestApi = {input:input};

		return this.queryData( query, new Deferred<values.IResOrderList>(), api.BusinessApi.API.getOrderListDirect.name );
	}  

	public orderProductList():Observable<values.IResOrderProductList> {
    var query:IRequestApi = {input:null};

    return this.queryData( query, new Deferred<values.IResOrderProductList>(), api.BusinessApi.API.orderProductList.name );
  }
	
	// 注文詳細取得
	public getOrderDetail(input: values.IReqOrderDetail ):Observable<values.IResOrderDetail> {
		var query:IRequestApi = {input:input};

		return this.queryData( query, new Deferred<values.IResOrderDetail>(), api.BusinessApi.API.orderDetail.name );
	}

	// 約定一覧取得
	public getExecutionList( input: values.IReqExecutionList ):Observable<values.IResExecutionList> {
		var query:IRequestApi = {input:input};

		return this.queryData( query, new Deferred<values.IResExecutionList>(), api.BusinessApi.API.getExecutionList.name );
  }
  
	// 約定一覧取得
	public getExecutionListDirect( input: values.IReqExecutionList ):Observable<values.IResExecutionList> {
		var query:IRequestApi = {input:input};

		return this.queryData( query, new Deferred<values.IResExecutionList>(), api.BusinessApi.API.getExecutionListDirect.name );
	}  
	
	//約定銘柄一覧取得
  public getExecutionProductList():Observable<values.IResExecutionProductList> {
    var query:IRequestApi = {input:null};

    return this.queryData( query, new Deferred<values.IResExecutionList>(), api.BusinessApi.API.getExecutionProductList.name );
  }

	// 銘柄一覧取得
	public getProductList():Observable<values.IResProductList> {
	var query:IRequestApi = {input:null};

		return this.queryData( query, new Deferred<values.IResProductList>(), api.BusinessApi.API.getProductList.name );
	}

	// 分類済み銘柄一覧取得
	public getClassifiedProducts():Observable<any> {
		var query:IRequestApi = {input:null};

		return this.queryData( query, new Deferred<any>(), api.BusinessApi.API.classifiedProducts.name );
	}

	// 建玉一覧取得
	public getPositionList(input: values.IReqPositionList):Observable<values.IResPositionList> {
		var query:IRequestApi = {input:input};

		return this.queryData( query, new Deferred<values.IResPositionList>(), api.BusinessApi.API.getPositionList.name );
  }
  
	public getPositionListDirect(input: values.IReqPositionList):Observable<values.IResPositionList> {
		var query:IRequestApi = {input:input};

		return this.queryData( query, new Deferred<values.IResPositionList>(), api.BusinessApi.API.getPositionListDirect.name );
	}
	
	// 建玉取得
	// 正式サーバー電文では無く、内部cacheから取得する。
	public getProductPositionList(input: values.IReqProductPosition):Observable<values.IResPositionList> {
		var def = new Deferred<values.IResPositionList>();
		
		this.getPositionList({listdataGetType:'1',pageCnt:200}).subscribe(val=>{
			var data=val;

			data.status='0';
			data.result.positionList = val.result.positionList.filter((v)=>v.cfdProductCode == input.cfdProductCode);
		
			def.next(data);
		});

		return def;
	}	

	// レート取得
	public getPriceList(input: values.IReqPriceList):Observable<values.IResPriceList> {
		var query:IRequestApi = {input:input};

		return this.queryData( query, new Deferred<values.IResPriceList>(), api.BusinessApi.API.getPriceList.name );
	}
	
	// ウォッチリスト取得
	public getWatchList():Observable<values.IResWatchList> {
    var query:IRequestApi = {input:null};
		return this.queryData( query, new Deferred<values.IResWatchList>(), api.BusinessApi.API.getWatchList.name );
  }
  
  // ウォッチリスト更新
  public putWatchList(input:values.IReqPutWatchList):Observable<values.IResPutWatchList> {
    var query:IRequestApi = {input:input};
		return this.queryData( query, new Deferred<values.IResPutWatchList>(), api.BusinessApi.API.putWatchList.name );
  }

  // ウォッチリスト追加
  public addWatchList(input:values.IReqAddWatchList):Observable<values.IResAddWatchList> {
    var query:IRequestApi = {input:input};
		return this.queryData( query, new Deferred<values.IResAddWatchList>(), api.BusinessApi.API.addWatchList.name );
  }

  // ウォッチリスト削除
  public delWatchList(input:values.IReqDelWatchList):Observable<values.IResDelWatchList> {
    var query:IRequestApi = {input:input};
		return this.queryData( query, new Deferred<values.IResDelWatchList>(), api.BusinessApi.API.delWatchList.name );
	}
  
  // speedOrder
	public speedOrder(input:values.IReqSpeedOrder):Observable<values.IResSpeedOrder> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResSpeedOrder>(), api.BusinessApi.API.speedOrder.name );
  }
  
  // speedAllSettleOrder
	public speedAllSettleOrder(input:values.IReqSpeedAllSettleOrder ):Observable<values.IResSpeedAllSettleOrder> {
    var query:IRequestApi = {input:input};

        return this.queryData( query, new Deferred<values.IResSpeedAllSettleOrder>(), api.BusinessApi.API.speedAllSettleOrder.name );
    }
	
	//コンバージョンレート取得
  public getConversionRate():Observable<values.IResconversionRate> {
    var query:IRequestApi = {input:null};

    return this.queryData( query, new Deferred<values.IResconversionRate>(), api.BusinessApi.API.getConversionRate.name );
  }

  // getNewsList
  public getNewsList(input:values.IReqNewsList):Observable<values.IResNewsList> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResNewsList>(), api.BusinessApi.API.getNewsList.name );
  }

  public getNewsListDirect(input:values.IReqNewsList):Observable<values.IResNewsList> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResNewsList>(), api.BusinessApi.API.getNewsListDirect.name );
  }  

  public getProductDetail(input:values.IReqProductDetail):Observable<values.IResProductDetail> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResProductDetail>(), api.BusinessApi.API.getProductDetail.name );
  }

  public ifdocoOrder(input:values.IReqIfdocoOrder):Observable<values.IResIfdocoOrder> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResIfdocoOrder>(), api.BusinessApi.API.ifdocoOrder.name );
  }

  public ifdOrder(input:values.IReqIfdOrder):Observable<values.IResIfdOrder> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResIfdOrder>(), api.BusinessApi.API.ifdOrder.name );
  }

  public ocoOrder(input:values.IReqOcoOrder):Observable<values.IResOcoOrder> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResOcoOrder>(), api.BusinessApi.API.ocoOrder.name );
  }

  public singleOrder(input:values.IReqSingleOrder):Observable<values.IResSingleOrder> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResSingleOrder>(), api.BusinessApi.API.singleOrder.name );
  }

  public changeOrder(input:values.IReqChangeOrder):Observable<values.IResChangeOrder> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResChangeOrder>(), api.BusinessApi.API.changeOrder.name );
  }

  public cancelOrder(input:values.IReqCancelOrder):Observable<values.IResCancelOrder> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResCancelOrder>(), api.BusinessApi.API.cancelOrder.name );
  }

  public getPowerAmount():Observable<values.IResPowerAmount> {
    var query:IRequestApi = {input:null};

    return this.queryData( query, new Deferred<values.IResPowerAmount>(), api.BusinessApi.API.getPowerAmount.name );
  }

  public getPowerAmountDirect():Observable<values.IResPowerAmount> {
    var query:IRequestApi = {input:null};

    return this.queryData( query, new Deferred<values.IResPowerAmount>(), api.BusinessApi.API.getPowerAmountDirect.name );
  }

  public getMarketCalendarInfo():Observable<values.IResMarketCalendarInfo> {
    var query:IRequestApi = {input:null};

    return this.queryData( query, new Deferred<values.IResMarketCalendarInfo>(), api.BusinessApi.API.getMarketCalendarInfo.name );
  }

  public getMarketCalendarInfoDirect():Observable<values.IResMarketCalendarInfo> {
    var query:IRequestApi = {input:null};

    return this.queryData( query, new Deferred<values.IResMarketCalendarInfo>(), api.BusinessApi.API.getMarketCalendarInfoDirect.name );
  }  

  public getInformationList():Observable<values.IResInformationList> {
    var query:IRequestApi = {input:null};

    return this.queryData( query, new Deferred<values.IResInformationList>(), api.BusinessApi.API.getInformationList.name );
  }

  public getInformationMessage(input:values.IReqInformationMessage):Observable<values.IResInformationMessage> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResInformationMessage>(), api.BusinessApi.API.getInformationMessage.name );
  }

  public getCashTransferInfo():Observable<values.IResGetCashTransferInfo> {
    var query:IRequestApi = {input:null};

    return this.queryData( query, new Deferred<values.IResGetCashTransferInfo>(), api.BusinessApi.API.getCashTransferInfo.name );
  }

  public cashTransfer(input:values.IReqCashTransfer):Observable<values.IResCashTransfer> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResCashTransfer>(), api.BusinessApi.API.cashTransfer.name );
  }
  
  public getCashTransferHistory(input:values.IReqCashTransferHistory):Observable<values.IResCashTransferHistory> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResCashTransferHistory>(), api.BusinessApi.API.getCashTransferHistory.name );
  }

  public orderDetail(input:values.IReqOrderDetail):Observable<values.IResOrderDetail> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResOrderDetail>(), api.BusinessApi.API.orderDetail.name );
  }

  public getLosscutRateInfo(input:values.IReqLosscutRateInfoList):Observable<values.IResLosscutRateInfo> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResLosscutRateInfo>(), api.BusinessApi.API.getLosscutRateInfo.name );
  }

  public calcLosscutRate(input:values.IReqCalcLosscutRate):Observable<values.IResCalcLosscutRate> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResCalcLosscutRate>(), api.BusinessApi.API.calcLosscutRate.name );
  }

  public changeLosscutRate(input:values.IReqChangeLosscutRate):Observable<values.IResChangeLosscutRate> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResChangeLosscutRate>(), api.BusinessApi.API.changeLosscutRate.name );
  }  

  public getUserInfo():Observable<values.IResUserInfo> {
    var query:IRequestApi = {input:null};

    return this.queryData( query, new Deferred<values.IResUserInfo>(), api.BusinessApi.API.userInfo.name );
  }

  public ohlc(input:values.IReqOHLC):Observable<values.IResOHLC[]> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResOHLC[]>(), api.BusinessApi.API.ohlc.name );
  }

  // #2090
  public chartTick(input:values.IReqChartTick):Observable<values.IResChartTick[]> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResChartTick[]>(), api.BusinessApi.API.chartTick.name );
  }
  // 

  public corporateInfo(input:values.IReqCorporateInfo):Observable<values.IResCorporateInfo> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResCorporateInfo>(), api.BusinessApi.API.corporateInfo.name );
  }

  public fundInfo(input:values.IReqFundInfo):Observable<values.IResFundInfo> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResFundInfo>(), api.BusinessApi.API.fundInfo.name );
  }

  // ニュース関連銘柄検索
  public search(input:values.IReqSearch):Observable<values.IResSearch> {
    var query:IRequestApi = {input:input};
    var encode = `%7B%22id%22%3A${input.id}%7D`;

    query.input.id = encode;
                              
    return this.queryData( query, new Deferred<values.IResSearch>(), api.BusinessApi.API.search.name );
  }

  // ニュース関連銘柄送信
  public feedback(input:values.IReqFeedback):Observable<values.IResFeedback> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<values.IResFeedback>(), api.BusinessApi.API.feedback.name );
  }  

  public marketSummary():Observable<values.IResMarketSummary> {
    var query:IRequestApi = {input:null};

    return this.queryData( query, new Deferred<values.IResMarketSummary>(), api.BusinessApi.API.marketSummary.name );
  }

  // アラート設定
  public setAlert(input:any):Observable<any> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<any>(), api.BusinessApi.API.setAlert.name );
  }

  // アラート取得
  public getAlert():Observable<any> {
    var query:IRequestApi = {input:null};

    return this.queryData( query, new Deferred<any>(), api.BusinessApi.API.getAlert.name );
  }
  
  // Layout保存
  public setLayout(input:any):Observable<any> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<any>(), api.BusinessApi.API.setLayout.name );
  }

  // Layout取得
  public getLayout():Observable<any> {
    var query:IRequestApi = {input:null};

    return this.queryData( query, new Deferred<any>(), api.BusinessApi.API.getLayout.name );
  }

  // 設定画面情報
  public setSettings(input:any):Observable<any> {
    var query:IRequestApi = {input:input};

    return this.queryData( query, new Deferred<any>(), api.BusinessApi.API.setSettings.name );
  }

  // 設定画面情報取得
  public getSettings():Observable<any> {
    var query:IRequestApi = {input:null};

    return this.queryData( query, new Deferred<any>(), api.BusinessApi.API.getSettings.name );
  }

  // ツール設定API全体取得
  public getAllSettings():Observable<any> {
    var query:IRequestApi = {input:null};

    return this.queryData( query, new Deferred<any>(), api.BusinessApi.API.getAllSetting.name );
  }

  public logout(){
    var query:IRequestApi = {input:null};
    
    return this.queryData( query, new Deferred<any>(), api.BusinessApi.API.logout.name );        
  }

  public getNoticeList(){
    var query:IRequestApi = {input:null};
    
    return this.queryData( query, new Deferred<any>(), api.BusinessApi.API.getNoticeList.name );    
  }
}