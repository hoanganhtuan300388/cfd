import { Component, OnInit, Input, ElementRef, Output, ViewChild, EventEmitter, HostListener, SimpleChange } from '@angular/core';
import { CommonEnum, CommonConst } from '../core/common';

import { Observable } from 'rxjs/Rx';
import { TimeZoneInfos } from "../const/businessDatetimes";

import * as values from "../values/Values";

import { GetProductTypeFromSymbolCode, DeepCopy, ConvertSimpleDateFromBusinessDate, FormatDate, GetDateOfTheWeekAtDate, IsArray } from "../util/commonUtil";

import { Deferred } from "../util/deferred";
import { ManagerService } from "../service/manager.service";

import { iTickPrice } from '../core/interface';
//import { IConfigChartSeries, IConfigChart, IConfigChartBasic } from '../core/configinterface';

import { didConvertDatetimeFromServer, MakeChartDataForTickData, didCheckFixedChartData } from './chartTypeInterface';
import { StartingPoint, StartingPointForInput, ChartRequestData, ChartSymbolInfo } from './chartTypeInterface';
import { ITimeType } from './chartTypeInterface';
import { TimeZoneItem, TimeZoneInfo } from './chartTypeInterface';
import { OrderData, PositData } from './chartTypeInterface';
import { ChartData } from './chartTypeInterface';
import { GetChartChartTimeTypeCode, GetTimeTypeNameFromCode, GetChartTypeTitleFromTimeInfo } from './chartTypeInterface';
import { TIME_TYPE_CODES } from './chartTypeInterface';

import { ChartTransactionBaseHandler } from './chartTransactionBaseHandler';

import * as ChartConst from '../const/chartConst';

import { ChartCFDDeployData, ChartCFDRequestInfo, ConvertTimeinfoToRequestOhlcTypeCode, GetDateTimeFromDatetime, CalcPrice, GetDecimalPointValueFromBoUnit } from './chartCFDInterface';
import { GetTimeZoneInfo, MakeChartDatasForTickData } from './chartCFDInterface';

// #2318
import { ERROR_CODE } from "../../../common/businessApi";
import { ChartCFDErrorInfo } from "./chartCFDInterface";
//

declare var $:any;
declare var __utils__;

//
// TODO: DEBUG
//
function debug_getDateInfo() {
	let xToday = new Date();
	let workingDate  = FormatDate(xToday, "YYYY/MM/DD");
	let xWeekOfDay = GetDateOfTheWeekAtDate(xToday);
	let businessDate = FormatDate(xWeekOfDay, "YYYY/MM/DD");

	return({
		workingDate: workingDate,
		businessDate:businessDate
	});
}

function debug_MakeEmptyRawData(chartRawData:any) {
	if(chartRawData) {
		// debug
		chartRawData[ChartConst.epdfPVOpen		] = 0;
		chartRawData[ChartConst.epdfPVHigh		] = 0;
		chartRawData[ChartConst.epdfPVLow		  ] = 0;
		chartRawData[ChartConst.epdfPVClose	  ] = 0;
		chartRawData[ChartConst.epdfPVVolume	] = 0;
		chartRawData[ChartConst.epdfPVAmount	] = 0;
	}
}

export class ChartTransactionHandler extends ChartTransactionBaseHandler {
	// /* 銘柄コード */
  protected symbolCode:string;

  //
  // added by choi sunwoo at 2017.03.31 for #591
  protected isShowChildElement:boolean = false;

  // ポャート
  protected chartDeployData:ChartCFDDeployData = {} as ChartCFDDeployData;

	// Order list
	protected orderHistoryItem: any[] = [];

	// 足種別
  protected timeTypeCodes:Array<ITimeType> = TIME_TYPE_CODES;

	// FIXME: DEBUG
	protected DEBUG_REAL_STOP:boolean = false;

	//
	protected deferred: Deferred<any> = new Deferred<any>();

	// #2034
	protected businessDate:string;

	//
  constructor(protected managerService: ManagerService, protected uniqueId:number) {
		super(managerService, uniqueId);

		let self = this;

		self.didClearChartDeployDatas(false, true);
  }

  /**
   * ディレクティブ・コンポーポントを破棄
   * @return {[type]}
   */
  public didDestroy() {
		let self = this;

    self.prepareForRequestingData(true);

		super.didDestroy();
  }

	public didGetChartRequestInfo() : ChartCFDRequestInfo {
		let self = this;

		var requestInfo:ChartCFDRequestInfo = {} as ChartCFDRequestInfo;

    let requestData:ChartRequestData = self.chartDeployData.requestData;
		let receiveInfo:ChartSymbolInfo  = self.chartDeployData.receiveInfo;
		if(requestData === undefined || requestData == null) {
      requestInfo.timeType     = '0';
      requestInfo.timeInterval = '1';
		}
		else {
			requestInfo.symbolCode = self.chartDeployData.requestData.symbolCode;
      requestInfo.marketCode = self.chartDeployData.requestData.marketCode;
      requestInfo.timeType = self.chartDeployData.requestData.timeType;
      requestInfo.timeInterval = self.chartDeployData.requestData.timeInterval;
		}

		if(receiveInfo !== undefined && receiveInfo != null) {
			requestInfo.symbolName   = receiveInfo.name;
      requestInfo.displayTitle = receiveInfo.display;
		}
		else {
			requestInfo.symbolName   = '';
      requestInfo.displayTitle = '未設定';
		}

    requestInfo.chartType    			= self.chartDeployData.chartType;
    requestInfo.useOrderLine 			= self.chartDeployData.useOrderLine;
		requestInfo.usePositLine 			= self.chartDeployData.usePositLine;
		requestInfo.useExecutionLine 	= self.chartDeployData.useExecutionLine;
    requestInfo.useAlertLine 			= self.chartDeployData.useAlertLine;

		return(requestInfo);
	}

  public didCloseRealData = () => {
		let self = this;

    self.prepareForRequestingData();
  }

	public didProcForRequestingChartDataCFD(componentIndex:number, requestData:ChartRequestData, def:Deferred<any>, useOption?:any, seriesInfo?:string) {
		let self = this;

		let useOrderLine:boolean;
		let usePositLine:boolean;
		let useAlertLine:boolean;
		let useExecutionLine:boolean;

		if(useOption) {
			useOrderLine = useOption.useOrderLine;
			usePositLine = useOption.usePositLine;
			useAlertLine = useOption.useAlertLine;
			useExecutionLine = useOption.useExecutionLine;
		}

		return(self.didProcForRequestingChartData(componentIndex, requestData, def, useOrderLine, usePositLine, seriesInfo, useAlertLine, useExecutionLine));
	}

	public didProcForRequestingChartData(componentIndex:number, requestData:ChartRequestData, def:Deferred<any>, useOrderLine?:boolean, usePositLine?:boolean, seriesInfo?:string, useAlertLine?:boolean, useExecutionLine?:boolean) {
		let self = this;

    //
    self.prepareForRequestingData();

    // New request
    // console.debug(requestData);

		// 営業日を取得する。
		
		let businessService:any = self.didGetBusinessService();
		if(businessService && businessService.getUserInfo) {
			businessService.getUserInfo().subscribe(
				(userInfo) => {
					let businessDate:string = "";
					try {
						businessDate = 
						self.businessDate = userInfo.result.businessDate;
					}
					catch(e) {
						console.error("[CHART] Fail to get business date information.");
						console.error(e);
					}

					// 照会情報を取得する。
					let code = requestData.symbolCode;
					let symbolManage:any = self.managerService.didGetSymbolManage();
					if(symbolManage && symbolManage.getSymbolInfo) {
						let productInfo:values.IProductInfo = symbolManage.getSymbolInfo(code);
						if(productInfo) {
							let symbolCode:string = "";
							let symbolName:string = "";
							let meigaraCode:string = "";
							let lotSize:number = 0;
							let pointValue:number = 0;

							let isFop:boolean = false;
							let productType:string = "";

							let isValid:boolean = false;
							// #1131
							let chartType:string = self.chartDeployData.chartType;
							//

							symbolCode 		= requestData.symbolCode; // product code
							symbolName 		= productInfo.meigaraSeiKanji;
							meigaraCode		= productInfo.cfdProductCode;
							isFop			 		= false;

							pointValue 		= GetDecimalPointValueFromBoUnit(productInfo.boUnit);
							lotSize    		= productInfo.tradeUnit;
							isValid		 		= true;

							// 銘柄情報を設定する。
							var displayTitle =
								self.didSetSymbolInfoToChartDeployDatas(
										requestData, requestData.symbolCode, symbolName,
										meigaraCode,
										lotSize, pointValue,
										isFop, productType, businessDate,
										useOrderLine, usePositLine, seriesInfo,
										useAlertLine, useExecutionLine
									);

							if(self.chartDeployData.receiveInfo) {
								self.chartDeployData.receiveInfo.originalInfo = DeepCopy(productInfo);
							}

							if(self.deferred) {
								let notifyData:any = {
									uniqueId: self.uniqueId,
									type : ChartConst.NOTIFY_TYPE_SYMBOLINFO,
									def : def,
									info : {
										componentIndex:componentIndex,
										symbolCode:symbolCode,
										symbolName:symbolName, // #2256
										timeType:requestData.timeType,
										timeInterval:requestData.timeInterval,
										displayTitle:displayTitle,
										chartType:chartType	// #1131
									},
									deployData : self.chartDeployData
								};

								self.deferred.next(notifyData);
							}

							// 有効である時のみ照会する。
							// レート取得
							// let businessService:any = self.didGetBusinessService();
							// if(isValid === true && businessService && businessService.getPriceList) {
							// 	var input = {productCodes:symbolCode};
							// 	businessService.getPriceList(input).subscribe(
							// 		(val) => {
							// 			if( val && val.result.priceList ){
							// 				var price = val.result.priceList[0];
							// 				console.log(price)

							// 				// 照会データ
							// 				self.didRequestChartData();
							// 			}
							// 		});
							// }

							// 有効である時のみ照会する。
							if(isValid === true) {
								// 照会データ
								self.didRequestChartData();
							}
						}
					}
				});
		}

    return(true);
	}

	/**
	 * データリクエスト
	 * @param  {[type]} preRequestData
	 * @return {[type]}
	 */
  protected prepareForRequestingData = (isDestory?:boolean) => {
    let self = this;
    let symbolCode:string;
    let marketCode:string;

    let preRequestData:ChartRequestData = self.chartDeployData.requestData;
		let hisitorySubscription;
		let tickSubscription;
    if(preRequestData) {
      symbolCode = preRequestData.symbolCode;
      marketCode = preRequestData.marketCode;

			tickSubscription = preRequestData.tickSubscription;
			hisitorySubscription = preRequestData.hisitorySubscription;
    }

    self.didClearChartDeployDatas(true);

		// #1281
		if(hisitorySubscription) {
			hisitorySubscription.unsubscribe();
		}

		// #888
		if(tickSubscription) {
			tickSubscription.unsubscribe();
		}

    if(symbolCode && marketCode) {
			let symbolManage:any = self.didGetSymbolManage();
			if(symbolManage && symbolManage.clearTickInfo) {
      	symbolManage.clearTickInfo(marketCode, symbolCode);
			}
    }

    self.didClearChartDeployDatas(false);

		//
    return(true);
  }

	protected didGetDateAndTimeFromTickPriceDatetime(dateTime:string) {
		// YYYY/mm/dd
	}

	protected didKeepTickData() {
		let self = this;
	}

	/**
	 * [if description]
	 * @param  {[type]} !self.chartDeployData.requestData
	 * @return {[type]}
	 */
	protected didDeployTickData() {
		let self = this;

		self.chartDeployData.historyIsRequested = false;

		if(!self.chartDeployData.requestData) {
			console.error("[LOG:CCVB] [ERROR:REALDATA] There is no information requested!!! => " + self.chartDeployData.requestData);

			return;
		}

		let orgTickDatas = self.chartDeployData.tickDatas;
		self.chartDeployData.tickDatas = [];

		//
		if(!self.chartDeployData.lastData) {
			self.chartDeployData.lastData = self.chartDeployData.snapshotData;
		}

		let lastBusinessDate:number;
		if(self.chartDeployData.lastData) {
			lastBusinessDate = self.chartDeployData.lastData.bdate_n_ori; // #3425
		}
		else {
			if(self.businessDate) {
				lastBusinessDate = parseInt(self.businessDate);
			}
		}

		let askBidData:any;

		try {
			let nCount = orgTickDatas.length;

			let timeType = self.chartDeployData.requestData.timeType;
			let pointValue:number = self.chartDeployData.receiveInfo.pointValue;

			let chartDatas = [];
			for(var ii = 0; ii < nCount; ii++) {
				let tickData = orgTickDatas[ii];
			
				let multiDatas:any = MakeChartDatasForTickData(tickData, timeType);
				if(!multiDatas) {
					continue;
				}

				if(multiDatas.askBidData) {
					askBidData = multiDatas.askBidData;
				}

				// #2034
				//【pushのプライスリストのプライス有効フラグが無効の場合】
				// チャートを更新しない。
				// チャートに足を追加しない。
				// ただし、【プライス有効フラグが無効の場合】グレー文字で表示する。
				// のでaskBidDataはそのまま使用する。
				if(tickData.validFlag != "1") {
					console.debug("#2034: プライス有効フラグが無効");
					continue;
				}
				//

				let chartData:ChartData = multiDatas.chartData as ChartData;
				if(!chartData) {
					continue;
				}

				// #3425
				if (lastBusinessDate !== undefined && lastBusinessDate != null && lastBusinessDate > chartData.bdate_n_ori) {
					console.warn("[#3425] Business date is reversed. => " + lastBusinessDate + " -> " + chartData.bdate_n_ori);
					continue;
				}
				// [end] #3425

				self.chartDeployData.lastData = chartData;

				// reverse insert
				chartDatas.push(chartData);
			}

			if(chartDatas.length < 1) {
				chartDatas = undefined;
			}

			if(chartDatas && chartDatas.length && chartDatas.length > 0) {
				//
				// console.debug(chartDatas);

				// TODO: send to chart
				// 1. Make
				let stPrices = [];
				let nCount:number = chartDatas.length;

				for(var ii = 0; ii < nCount; ii++) {
					let chartData:ChartData = chartDatas[ii] as ChartData;

					var stPrice = {
						ymd		: chartData.date_n,
						hms		: chartData.time_n,
						open	: 0,
						high	: 0,
						low		: 0,
						close	: CalcPrice(chartData.close, pointValue),
						volume: chartData.volumeTick,
						amount: chartData.amountTick,
						oi		: 0,
						tno		: 0,
						seqNo	: chartData.seq_no,
						flag	: true,

						bdate : chartData.bdate_n,
						bdate_n_ori: chartData.bdate_n_ori, // #3425
					};

					// #1252, #3425
					if (lastBusinessDate === undefined || lastBusinessDate == null || lastBusinessDate < chartData.bdate_n_ori) {
						self.didNotifyRealData(stPrices);
						stPrices = [];

						self.businessDate = chartData.businessDate; // #3414
						lastBusinessDate = parseInt(self.businessDate); // #3425

						// #3414
						let newTimeZoneInfo: TimeZoneInfo = self.chartDeployData.eodTimeZoneInfo;
						self.didNotifyUpdateBusinessDate(lastBusinessDate, newTimeZoneInfo);
						// 
					}
					//

					// #2374
					if(timeType == ChartConst.TIME_TYPE_TICK) {
						//console.debug("\n\n#2374: Last data(" + self.chartDeployData.lastPriceForTick + "), Incoming(" + JSON.stringify(chartData) + "), " + JSON.stringify(stPrice));
						if(self.chartDeployData.lastPriceForTick) {
							if(self.chartDeployData.lastPriceForTick == stPrice.close) {
								//console.debug("#2374: Skip data => " + JSON.stringify(stPrice));
								continue;
							}
						}
						self.chartDeployData.lastPriceForTick = stPrice.close;
						//console.debug("#2374: Last data is now(" + self.chartDeployData.lastPriceForTick + ")");
						//console.debug("#2374: Add new chart data is " + JSON.stringify(stPrice));
					}					
					//

					stPrices.push(stPrice);


				}

				// 2. Send
				// console.debug("[LOG#1395:SIMPLE] SEND TO TICKDATA TO CHART >>>>>");
				// TODO: REAL
				self.didNotifyRealData(stPrices);
			}
			else {
				// console.debug("[LOG#1395:SIMPLE] NO SEND TICKDATA TO CHART >>>>>");
			}

			// #2007
			if(askBidData) {
				self.didNotifyUpdateAskBidData(CalcPrice(askBidData.ask, pointValue), CalcPrice(askBidData.bid, pointValue), askBidData.validFlag);
			}
			//
		}
		catch(e) {
			console.error(e);
		}
	}

	// #1252
	protected didNotifyUpdateBusinessDate(businessDate:number, timeZoneInfo?: TimeZoneInfo) { // #3414
		let self = this;
		if(self.deferred) {
			let notifyData:any = {
				uniqueId: self.uniqueId,
				type  : ChartConst.NOTIFY_TYPE_BDATE_CHANGED,
				businessDate : businessDate,
				timeZoneInfo : timeZoneInfo, // #3414
			}

			self.deferred.next(notifyData);
		}
	}

	protected didNotifyRealData(priceDatas:any) {
		let self = this;
		if(!priceDatas || priceDatas.length === undefined || priceDatas.length < 1) {
			return;
		}

		if(self.deferred) {
			let notifyData:any = {
				uniqueId: self.uniqueId,
				type  : ChartConst.NOTIFY_TYPE_REAL,
				deployData : self.chartDeployData,
				receiveRawData : priceDatas
			}

			self.deferred.next(notifyData);
		}
	}

	protected didNotifyHistoryData(receiveRawData:any, isNext:boolean, timeZoneInfo?:TimeZoneInfo) {
		let self = this;
		if(self.deferred) {
			let notifyType:number = ChartConst.NOTIFY_TYPE_HISTORY;
			if(isNext === true) {
				notifyType = ChartConst.NOTIFY_TYPE_HISTORY_NEXT;
			}

			let notifyData:any = {
				uniqueId: self.uniqueId,
				type  : notifyType,
				deployData : self.chartDeployData,
				receiveRawData : receiveRawData,
				timeZoneInfo : timeZoneInfo
			}

			self.deferred.next(notifyData);
		}
	}

	/**
	 * receive real data
	 * @param  {any} tickPrice	tick price(see TickPrice in SymbolManage)
	 * @return {any}
	 */
  protected didReceiveTickPrice(tickPrice:any) {
    let self = this;

		// console.log("対顧客プライスID:" + tickPrice.priceId);

		// Tickデータを追加
    self.chartDeployData.tickDatas.push(tickPrice);

		//
		self.didDeployTickData();
	}
	
	protected didRequestTickPrice(code:string) {
		let self = this;
		try {
			let requestData:ChartRequestData = self.chartDeployData.requestData;
			let businessService:any = self.didGetBusinessService();
			if(businessService) {
				requestData.tickSubscription = businessService.symbols.tick(code).subscribe(
					(val) => {
						self.didReceiveTickPrice(val);
					});
			}
		}
		catch(e) {
			console.error(e);
		}
	}

	protected didNotifyUpdateAskBidData = (ask:number, bid:number, validFlag:string) => {
		let self = this;
		if(self.deferred) {
			let notifyData:any = {
				uniqueId: self.uniqueId,
				type : ChartConst.NOTIFY_TYPE_UPDATE_ASKBID,
				ask: ask,
				bid: bid,
				validFlag: (validFlag == "1") ? true : false
			};

			self.deferred.next(notifyData);
		}
	}

	protected didGetCurrentPrice(code:string) {
		let self = this;
		// レート取得
		let businessService:any = self.didGetBusinessService();
		if(businessService && businessService.getPriceList) {
			var input = {productCodes:code};
			businessService.getPriceList(input).subscribe(
				(val) => {
					if( val && val.result.priceList ){
						var price = val.result.priceList[0];
						// console.log(price)

						// #2007
						var pointValue = self.didGetPointValue();
						self.didNotifyUpdateAskBidData(CalcPrice(price.ask, pointValue), CalcPrice(price.bid, pointValue), price.validFlag);
						//
					}
				});
		}
	}

	protected didDoStepForRealdataAfterRecevingHistory(securityCode:string) {
		let self = this;

		self.didGetCurrentPrice(securityCode);

		self.didRequestTickPrice(securityCode);
	}

	protected didDoStepAfterRecevingHistory(securityCode:string) {
		let self = this;

		if(self.deferred) {
			let notifyData:any = {
				uniqueId: self.uniqueId,
				type : ChartConst.NOTIFY_TYPE_AFTER_HISTORY,
				deployData: self.chartDeployData,
				seriesInfo: self.chartDeployData.seriesInfo,
				securityCode:securityCode
			};

			self.deferred.next(notifyData);
		}
	}

	protected prepareToSendDataToChart(requestData:ChartRequestData, receiveInfo:ChartSymbolInfo, receiveRawData:any, isNext?:boolean) {
		let securityCode:string = requestData.symbolCode;
		let marketCode:string   = requestData.marketCode;
		let businessDate:string = receiveInfo.businessDate;
		let isFop:boolean		    = receiveInfo.isFop;
		let productType:string	= receiveInfo.productType;

		let timeType:string			= requestData.timeType;			// #2034
		let timeInterval:string	= requestData.timeInterval;	// #2034

		let timeZoneInfo:TimeZoneInfo;
		try {
			timeZoneInfo = GetTimeZoneInfo(receiveInfo.originalInfo, businessDate, timeType, timeInterval); // #2034
		}
		catch(e) {
			console.error(e);
		}

		return(timeZoneInfo);
	}

	//
	//
	//
	protected didGetRequestTimeInfo() {
		let self = this;

		let receiveInfo:ChartSymbolInfo = self.chartDeployData.receiveInfo;
		if(receiveInfo) {
			return({
				timeType: receiveInfo.timeType,
				timeGap : receiveInfo.timeGap
			});
		}
	}

	protected didGetPointValue() : number {
		let self = this;

		let pointValue:number = 0;
		try {
			pointValue = self.chartDeployData.receiveInfo.pointValue;
		}
		catch(e) {
			console.error(e);
			pointValue = 0;
		}

		return(pointValue);
	}

	// protected didGetPointPower() : number {
	// 	let self = this;

	// 	let pointPower:number = 1;
	// 	try {
	// 		pointPower = self.chartDeployData.receiveInfo.lotSize;
	// 	}
	// 	catch(e) {
	// 		console.error(e);
	// 		pointPower = 1;
	// 	}

	// 	return(pointPower);
	// }

	protected didGetSnapshotData() : ChartData {
		let self = this;

		return(self.chartDeployData.snapshotData);
	}

	/**
	 * [didMakeLastHistoryDataForDWMRequest description]
	 * @param  {any}    receiveRawData
	 * @return {[type]}
	 */
	protected didMakeLastHistoryDataForDWMRequest(receiveRawData:any) {
		return(true);
	}

	protected didProcForHistoryData(requestData:ChartRequestData, receiveInfo:ChartSymbolInfo, receiveRawData:any, isNext?:boolean) {
		let self = this;

		// console.debug(receiveRawData);
		var __requestInfo = receiveInfo;

		let securityCode:string = requestData.symbolCode;
		let marketCode:string   = requestData.marketCode;
		let businessDate:string = receiveInfo.businessDate;
		let isFop:boolean		    = receiveInfo.isFop;
		let productType:string	= receiveInfo.productType;

		self.chartDeployData.historyIsReceived = true;

		self.didMakeLastHistoryDataForDWMRequest(receiveRawData);

		let timeZoneInfo:TimeZoneInfo = self.prepareToSendDataToChart(requestData, receiveInfo, receiveRawData, isNext);

		self.didNotifyHistoryData(receiveRawData, isNext, timeZoneInfo);
		self.didDoStepForRealdataAfterRecevingHistory(securityCode);
		self.didDoStepAfterRecevingHistory(securityCode);
	}

	protected didReceiveHistoryData(requestData:ChartRequestData, receiveInfo:ChartSymbolInfo, val:any, isNext?:boolean) {
		let self = this;

		try {
			var elements = val;
			if(elements) {
				let receiveElements;
				if(IsArray(elements)) {
					receiveElements = elements;
				}
				else {
					receiveElements = [];
					receiveElements.push(elements);
				}

				var nCount = receiveElements.length;

				var receiveRawData = [];
				let pointValue:number = receiveInfo.pointValue;

				let lastClose:any;
				// ASC
				//for(var ii = nCount - 1; ii >= 0; ii--) {
				for(var ii = 0; ii < nCount; ii++) {
					var xElement = receiveElements[ii];
					var chartRawData;
					chartRawData = xElement;
					if(chartRawData === undefined || chartRawData == null) {
						continue;
					}

					try {
						var chartData = [];

						if(chartRawData.indexNo) { // Tick
							let dateTime:any = GetDateTimeFromDatetime(chartRawData.tickTime);
							if(dateTime) {
								chartData.push(dateTime.date);
								chartData.push(dateTime.time);
							}
							else {
								chartData.push(null);
								chartData.push(null);
							}

							let tickPrice:number = CalcPrice(chartRawData.tickPrice, pointValue);

							self.chartDeployData.lastPriceForTick = tickPrice; // #2374

							chartData.push(tickPrice);
							chartData.push(tickPrice);
							chartData.push(tickPrice);
							chartData.push(tickPrice);
	
							chartData.push(0);	// volume
							chartData.push(0);	// amount
							chartData.push(0);	// oi
							chartData.push(chartRawData.indexNo);	// seq_no

							// chartData.push(chartRawData.businessDate);	// business date
						}
						else {
							let dateTime:any = GetDateTimeFromDatetime(chartRawData.datetime);
							if(dateTime) {
								chartData.push(dateTime.date);
								chartData.push(dateTime.time);
							}
							else {
								chartData.push(null);
								chartData.push(null);
							}

							chartData.push(CalcPrice(chartRawData.open , pointValue));
							chartData.push(CalcPrice(chartRawData.high , pointValue));
							chartData.push(CalcPrice(chartRawData.low  , pointValue));
							chartData.push(CalcPrice(chartRawData.close, pointValue));
	
							chartData.push(0);	// volume
							chartData.push(0);	// amount
							chartData.push(0);	// oi
							chartData.push(0);	// seq_no
						}

						// TODO: #1271
						// lastClose = didCheckFixedChartData(chartData, lastClose);
						//

						receiveRawData.push(chartData);
					}
					catch(e) {
						// console.debug("[LOG#1395:SIMPLE] \n\n==================================>>>>>");
						// console.debug("[LOG#1395:SIMPLE] receive history data error at [" + ii + "].");
						// console.debug("[LOG#1395:SIMPLE] Data is:");
						// console.debug(chartRawData);
						console.error(e);
					}
				}

				nCount = receiveRawData.length;

				self.didProcForHistoryData(requestData, receiveInfo, receiveRawData, isNext);
			}
		}
		catch(e) {
			console.error(e);
		}
	}

	protected didRequestHistoryData() {
		//
    let self = this;

    // request
    var requestData:ChartRequestData = self.chartDeployData.requestData;
    var receiveInfo  = self.chartDeployData.receiveInfo;
    var requestCount = requestData.dataCount; // #2548

		self.chartDeployData.historyIsRequested = true;
		self.chartDeployData.historyIsReceived  = false;

	// 	this.business.ohlc({ ohlcTypeCode: 3, cfdProductCode: cfdProductCode, count: 10 }).subscribe(function (val) {
	// 		if (val && Array.isArray(val)) {
	// 				val.forEach(function (el) {
	// 						_this.chart1.AddData('bid', el.datetime, el.close);
	// 				});
	// 				_this.chart1.run();
	// 		}
	// });

		let businessService:any = self.didGetBusinessService();
		// #2090
		if(businessService) {
			let ohlcInputParam:any = {
				cfdProductCode: requestData.symbolCode,
				count:requestCount
			};

			let isTick:boolean = false; // #2318
			let observable:Observable<any>;
			if(requestData.timeType == ChartConst.TIME_TYPE_TICK) { // #2090
				isTick = true; // #2318
				if(businessService.chartTick) {
					observable = businessService.chartTick(ohlcInputParam);
				}
			}
			else {
				isTick = false; // #2318
				if(businessService.ohlc) {
					ohlcInputParam.ohlcTypeCode = ConvertTimeinfoToRequestOhlcTypeCode(requestData.timeType, requestData.timeInterval);
					observable = businessService.ohlc(ohlcInputParam);
				}
			}
			
			//console.debug("[LOG#1277] Request start ===> " + new Date().toString());
			//console.debug("[LOG#1277] ======================================================================================");
			//console.debug("[LOG#1277] Code(" + requestData.symbolCode + "), Time:(" + requestData.timeType + "), Interval(" + requestData.timeInterval + ")");
			// #1281
			if(observable) {
				requestData.hisitorySubscription = observable.subscribe(
					(val) => {
						// #1281
						requestData.hisitorySubscription.unsubscribe();
						requestData.hisitorySubscription = undefined;

						//
						self.didReceiveHistoryData(requestData, receiveInfo, val, false);
					} ,
					(err) => {
						// #1281
						requestData.hisitorySubscription.unsubscribe();
						requestData.hisitorySubscription = undefined;
						
						// #2318
						switch(err.status) {
							case ERROR_CODE.NETWORK:
							case ERROR_CODE.HTTP: {
									let errorInfo:ChartCFDErrorInfo = {
										status:err.status,
										isPrice:true,
										isTick:isTick,
									} as ChartCFDErrorInfo;
									self.didNotifyResponseError(err.statusCode, null, errorInfo);
								}
								break;
						}
						//
					} ,
					() => {
						// console.debug("[LOG#1395:SIMPLE] [LOG:CCVB] complete");
					}
				);
			}
		}
		// [end] #2090
	}

  /**
   *
   * @param argRcc
   * @param requestData
   * @param symbolInfo
   */
  protected didRequestChartData() {
    //
    let self = this;

    // request
    var requestData:ChartRequestData = self.chartDeployData.requestData;
    var requestInfo  = self.chartDeployData.receiveInfo;
    var requestCount = requestData.dataCount; // #2548

		// リアルデータ
		self.chartDeployData.stopReceiveReal = false;

		// 
		self.didRequestHistoryData();
  }

	/**
	 * デプロイ情報をクリア
	 * @param  {boolean} onlyFlag	フラグ情報
	 * @return {[type]}
	 */
  protected didClearChartDeployDatas(onlyFlag?:boolean, initFlag?:boolean) {
		let self = this;

    if(onlyFlag === true) {
      self.chartDeployData.stopReceiveReal = true;
      self.chartDeployData.historyIsRequested = false;
			self.chartDeployData.historyIsReceived  = false;

      return;
    }

		// #1131
		// once when init
		if(initFlag === true) {
			self.chartDeployData.chartType = "Candle";
			// #1546
			self.chartDeployData.useOrderLine = null;
			self.chartDeployData.usePositLine = null;
			self.chartDeployData.useExecutionLine = null;
			self.chartDeployData.useAlertLine = null;
			//
		}
		//


    self.chartDeployData.tickDatas = [];
    self.chartDeployData.receiveInfo = null;
    self.chartDeployData.receiveRawDatas = [];

		self.chartDeployData.orderDatas = [];
		self.chartDeployData.positionDatas = [];

		self.chartDeployData.lastData = undefined;
		self.chartDeployData.snapshotData = undefined;

		self.chartDeployData.lastPriceForTick = undefined; // #2374
  }

	protected didConvertDisplayTitle(symbolName:string, timeType?:any, timeInterval?:any, symbolCode?:string) {
		let self = this;
		if(symbolName && symbolName.length > 0) {
			let displayTitle = symbolName;

			if(symbolCode && symbolCode != "") {
				displayTitle +=  '(' + symbolCode + ')';
			}

			if(timeType && timeInterval) {
					displayTitle += ' ' + self.didGetChartTypeTitleFromTimeInfo(timeType, timeInterval);
			}

			return(displayTitle);
		}

		return("未設定");
	}

	protected didGetChartChartTimeTypeCode(argType) {
		return(GetChartChartTimeTypeCode(argType));
	}

  protected didSetSymbolInfoToChartDeployDatas(
		requestData:ChartRequestData, symbolCode:string, symbolName:string,
		meigaraCode:string,
		lotSize:number, pointValue:number,
		isFop:boolean, productType:string, businessDate:string,
		useOrderLine?:boolean, usePositLine?:boolean, seriesInfo?:string,
		useAlertLine?:boolean, useExecutionLine?:boolean) {

    if(requestData === undefined || requestData == null) {
      return;
    }

		let self = this;

    let receiveInfo:ChartSymbolInfo = {} as ChartSymbolInfo;
    receiveInfo.code      	= symbolCode;
    receiveInfo.name      	= symbolName
    receiveInfo.timeGap   	= parseInt(requestData.timeInterval);
    receiveInfo.timeType  	= self.didGetChartChartTimeTypeCode(requestData.timeType);
		receiveInfo.lotSize		  = lotSize;
    receiveInfo.pointValue  = pointValue;
		receiveInfo.display	  	= self.didConvertDisplayTitle(symbolName, requestData.timeType, requestData.timeInterval, symbolCode);
		receiveInfo.isFop				= isFop;
		receiveInfo.productType	= productType;
		receiveInfo.businessDate= businessDate;
		receiveInfo.meigaraCode	= meigaraCode;

    self.chartDeployData.receiveInfo = receiveInfo;

    self.chartDeployData.requestData = {} as ChartRequestData;
    self.chartDeployData.requestData.symbolCode   = requestData.symbolCode;
    self.chartDeployData.requestData.marketCode   = requestData.marketCode;
    self.chartDeployData.requestData.timeType     = requestData.timeType;
    self.chartDeployData.requestData.timeInterval = requestData.timeInterval;
    self.chartDeployData.requestData.dataCount    = requestData.dataCount;

		//
		// #2023
		//
		self.chartDeployData.useOrderLine = useOrderLine == true ? true : false;
		self.chartDeployData.usePositLine = usePositLine == true ? true : false;
		self.chartDeployData.useExecutionLine = useExecutionLine == true ? true : false;
		self.chartDeployData.useAlertLine = useAlertLine == true ? true : false;
		//

		self.chartDeployData.seriesInfo	  = seriesInfo;

		//
    return(receiveInfo.display);
  }

	/**
	 * convert time type code to time type name(display)
	 * @param  {string} code
	 * @return {string}
	 */
  protected didGetTimeTypeNameFromCode(code:string) : string {
		return(GetTimeTypeNameFromCode(code));
  }

	/**
   * 時間情報から表示する文字列へ変換する。
   * @param  {any}    timeType
   * @param  {any}    timeInterval
   * @return {string}
   */
  protected didGetChartTypeTitleFromTimeInfo (timeType:any, timeInterval:any) : string {
		return(GetChartTypeTitleFromTimeInfo(timeType, timeInterval));
  }

	//
	//
	//
	public IsHistoryDataReceived() {
		let self = this;
		return(self.chartDeployData.historyIsReceived);
	}

	// #3414
	public didNotifiedEODFromServer = (val?: any) => {
		let self = this;
		let requestData: ChartRequestData = self.chartDeployData.requestData;
		let businessService: any = self.didGetBusinessService();
		if (requestData && businessService && businessService.getUserInfo) {
			businessService.getUserInfo().subscribe(
				(userInfo) => {
					try {
						let businessDate: string = "";
						try {
							businessDate =
								self.businessDate = userInfo.result.businessDate;
						}
						catch (e) {
							console.error("[CHART] Fail to get business date information.");
							console.error(e);
						}

						let timeType: string = requestData.timeType;
						let timeInterval: string = requestData.timeInterval;
					
						// 照会情報を取得する。
						let code = requestData.symbolCode;
						let symbolManage: any = self.managerService.didGetSymbolManage();
						if (symbolManage && symbolManage.getSymbolInfo) {
							let productInfo: values.IProductInfo = symbolManage.getSymbolInfo(code);
							if (productInfo) {
								if (self.chartDeployData.receiveInfo) {
									self.chartDeployData.receiveInfo.originalInfo = DeepCopy(productInfo);
								}

								let timeZoneInfo: TimeZoneInfo;
								try {
									timeZoneInfo = GetTimeZoneInfo(productInfo, businessDate, timeType, timeInterval);

									self.chartDeployData.eodTimeZoneInfo = timeZoneInfo;

									// console.debug("[#3414] EOD timeZoneInfo: " + JSON.stringify(self.chartDeployData.eodTimeZoneInfo));
								}
								catch (e) {
									console.error(e);
								}
							}
						}
					}
					catch(e) {
						console.error("[CHART] Fail to update for EOD.");
						console.error(e);
					}
				}
			);
		}
		else {
			console.debug("[CHART] there is no request data. or business service or user info.");
		}
	}
	//
}
