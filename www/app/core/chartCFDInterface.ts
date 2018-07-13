// #1542
import { CommonEnum, CommonConst } from '../core/common';
import { OrderData, PositData, didConvertDatetimeFromServer } from "./chartTypeInterface";
import { ChartDeployData, ChartRequestInfo, ChartRequestData, TimeZoneInfo, TimeZoneItem, ChartData } from "./chartTypeInterface";

import { IConfigSetting, IConfigChartTechnical } from '../core/configinterface';
import { DeepCopy, ConvertSimpleDateFromBusinessDate, ConvertNumberToDate, ConvertDateToNumber, GetDateOfTheWeekAtDate, GetDateOfTheMonthAtDate } from "../util/commonUtil";
import { FormatDate } from "../util/commonUtil";


import * as ChartConst from '../const/chartConst';
import * as ChartCFDConst from "../const/chartCFDConst";

import { IProductInfo, IEachTradeTime } from '../values/http/productList'; // #1301

/* チャート指標に関するInterface */
export interface IIndicaterInfo {
  code : string;
  info : any;
	show : boolean;

	trend?: boolean;
	item?: any;
}

export interface ChartCFDDeployData extends ChartDeployData {
	lastPriceForTick?:any; // #2374

  useExecutionLine:boolean;
	useAlertLine:boolean;
	executionDatas:Array<any>;
	alertDatas:Array<any>;

	showCrossline?:boolean;

	// #2216
	showGrid?:boolean;
	showCurrentPrice?:boolean;
	showDetailInfo?:boolean;
	showHighLowPrice?:boolean;

	gridColor?:string;
	positiveLineFillColor?:string;
	hiddenLineFillColor?:string;

	// #3414
	eodTimeZoneInfo?: TimeZoneInfo;
}

export interface ChartCFDRequestInfo extends ChartRequestInfo {
	// non symbol info
	useExecutionLine:boolean;
	useAlertLine:boolean;

	showCrossline?:boolean;

	// #2216
	showGrid?:boolean;
	showCurrentPrice?:boolean;
	showDetailInfo?:boolean;
	showHighLowPrice?:boolean;

	gridColor?:string;
	positiveLineFillColor?:string;
	hiddenLineFillColor?:string;
}

export interface OrderDataCFD extends OrderData {
	toolTipText					: string;
	menuText						: string;
	extraPrice					: number;

	orderJointId				: string;	// #1927
}

export interface PositDataCFD extends PositData {
	toolTipText					: string;
	menuText						: string;
	orderType						: string;

	positionKeyRaw			: string; // #2441
}

// #2009
export interface ExecutionData {
	ask									: boolean;
	buysell 						: string;
	price 							: number;
	volume 							: number;			// jyuchuuSuuryo
	dateTime 						: string;			// YYYYMMDDHHMMSS
	availableFlag				:	boolean;
	id									: string;

	isKv								: boolean;
	display							: string;
	executionKey				: string;
	securityCode				: string;
	dateTime2						: string;			// YYYYMMDD
	pointValue 					: number;
	orderKey						: string;
	settleAmount				: number;

	originalData				: any;
	dummy								: string;

	toolTipText					: string;
	menuText						: string;
}

// #2009
export interface AlertData {
	price 							: number;
	dateTime 						: string;			// YYYYMMDDHHMMSS
	availableFlag				:	boolean;
	id									: string;

	isKv								: boolean;
	display							: string;
	alertKey						: string;
	securityCode				: string;
	dateTime2						: string;			// YYYYMMDD
	pointValue 					: number;

	originalData				: any;
	dummy								: string;

	toolTipText					: string;
	menuText						: string;
}

// #2318
export interface ChartCFDErrorInfo {
	status:string;
	isPrice?:boolean;
	isTick?:boolean;
	isOrder?:boolean;
	isPosition?:boolean;
	isExecution?:boolean;
	isAlert?:boolean;
}
//

// #2009
export function IsValidOrderStatus(orderStatus:string) {
	// 注文ステータス1：有効、4：執行中かつ注文方式が7:ロスカットではない注文
	if(orderStatus == ChartCFDConst.ORDER_STATUS_VALID ||	orderStatus == ChartCFDConst.ORDER_STATUS_EXECUTING) {
			return(true);
	}

	return(false);
}

export function IsTrailStatusOn(trailPrice:number, orderPrice:number, isAsk:boolean) {
	// ※ トレール追跡状態
	// 	・トレール価格がNaN → トレール追跡前
	// 	・売買区分が「買」
	// 		トレール価格＜注文価格 → トレール追跡中
	// 		それ以外 → トレール追跡前
	// 	・売買区分が「売」
	// 		トレール価格＞注文価格 → トレール追跡中
	// 		それ以外 → トレール追跡前
	if(trailPrice === undefined || trailPrice == null) {
		return(false);
	}

	if(isAsk == true) {
		if(trailPrice > orderPrice) {
			return(true);
		}
	}
	else {
		if(trailPrice < orderPrice) {
			return(true);
		}
	}

	return(false);
}

/**
 * [didMakeOrderDataFromRawData description]
 * @param  {[type]} rawData
 * @return {[type]}
 */
export function MakeOrderDataFromRawData(rawData:any, productCode:string, pointValue?:number) {
	if(rawData === undefined || rawData == null) {
		return;
	}

	if(rawData.orderType == ChartCFDConst.ORDER_METHOD_TYPE_OCO) {
		// console.log(rawData);
	}

	// チェック銘柄コード
	if(productCode && productCode != "" && productCode !== rawData.cfdProductCode) {
		return;
	}

	// #2545
	let validFlag:boolean = IsValidOrderStatus(rawData.orderStatus);
	/*
		【表示対象について】
			※注文ステータス1：有効、4：執行中かつ注文方式が7:ロスカットではない注文
		*/
	if(rawData.orderType === ChartCFDConst.ORDER_METHOD_TYPE_LOSSCUT) {
		validFlag = false;
	}
	//

	let self = this;
	let orderData:OrderDataCFD = {} as OrderDataCFD;

	orderData.cancelableFlag	= false;
	orderData.correctableFlag	= false;

	/*
		変更・取消
		有効注文かつ、注文方式「強制決済」以外の場合
			変更ボタンを表示する
		有効注文以外、または、注文方式「強制決済」の場合
			変更ボタンを表示しない
		*/
	if(rawData.orderType !== ChartCFDConst.ORDER_METHOD_TYPE_SETTLE_FORCE && true == validFlag) {
		orderData.correctableFlag = true;
		orderData.cancelableFlag  = true;
	}

	pointValue 								= pointValue || 0; // #1443
	pointValue								= Math.max(0, pointValue);
	let pow:number						= Math.pow(10, pointValue);

	orderData.ask							= (ChartCFDConst.ORDER_BUYSELL_TYPE_SELL === rawData.buySellType) ? true : false;
	orderData.buysell					= (ChartCFDConst.ORDER_BUYSELL_TYPE_SELL === rawData.buySellType) ? "売" : "買";
	orderData.price						= Math.round(parseFloat(rawData.orderPrice) * pow);
	orderData.volume					= parseInt(rawData.orderQuantity);
	orderData.dateTime				= rawData.orderDatetime;
	orderData.id							= rawData.orderKey;

	orderData.isKv						= true;	// 必須
	orderData.orderKey 				= rawData.orderKey;
	orderData.displayOrderKey = rawData.orderKey;
	orderData.securityCode		= rawData.productCode;
	orderData.dateTime2				= rawData.invalidDatetime;
	if(rawData.orderType == ChartCFDConst.ORDER_METHOD_TYPE_NORMAL) {
		orderData.orderType	= ChartCFDConst.ORDER_EXECUTION_TYPE_LIST[rawData.executionType];
	}
	else {
		orderData.orderType	= ChartCFDConst.ORDER_METHOD_TYPE_LIST[rawData.orderType];
	}
	orderData.oi							= 0;

	orderData.orderJointId		= rawData.orderJointId; // #1927

	orderData.originalData		= rawData;

	let __orderData:any				= orderData;
	// Tooltip: 注文番号(下4桁) 注文タイプ 売買 発注数 注文価格[取引-執行条件]
	// #2449
	let displayKey:string = "";
	try {
		let nLen:number = rawData.orderKey.length;
		displayKey = rawData.orderKey.substring(nLen - 4, nLen);
	}
	catch(e) {
		console.error(e);
	}
	//

	orderData.toolTipText		= displayKey + "&nbsp;"; // #2449
	orderData.toolTipText	 += orderData.orderType + "&nbsp;";
	orderData.toolTipText	 += orderData.buysell + "&nbsp;";
	orderData.toolTipText	 += orderData.volume + "&nbsp;";
	orderData.toolTipText	 += rawData.orderPrice.toFixed(pointValue) + "&nbsp;"; // #2545
	if(rawData.orderType == ChartCFDConst.ORDER_METHOD_TYPE_TRAIL) {
		if(IsTrailStatusOn(rawData.trailPrice, rawData.orderPrice, orderData.ask)) {
			orderData.toolTipText += "[現在：" + rawData.trailPrice.toFixed(pointValue) + "]&nbsp;" // #2545
			orderData.extraPrice = Math.round(parseFloat(rawData.trailPrice) * pow);
		}

		orderData.toolTipText += "幅" + rawData.trailWidth;
	}
	orderData.toolTipText	 += "[" + ChartCFDConst.ORDER_SETTLE_TYPE_LIST_SHORT[rawData.settleType];
	orderData.toolTipText	 += "-";
	orderData.toolTipText	 += orderData.orderType	= ChartCFDConst.ORDER_EXECUTION_TYPE_LIST[rawData.executionType];
	orderData.toolTipText	 += "]";

	// Menu text
	orderData.menuText = orderData.toolTipText;
	orderData.menuText = orderData.menuText.replace(/\&nbsp;/g, " ");
	//

	// console.log(orderData);

	//
	return(orderData);
}

export function MakePositDataFromRawData(rawData:any, productCode:string, pointValue?:number) {
	if(rawData === undefined || rawData == null) {
		return;
	}

	// チェック銘柄コード
	if(productCode && productCode != "" && productCode !== rawData.cfdProductCode) {
		return;
	}

	let self = this;
	let positData:PositDataCFD	  = {} as PositDataCFD;

	positData.checkSettlementFlag	= true;

	pointValue										= pointValue || 0; // #1443
	pointValue										= Math.max(0, pointValue);
	let pow:number								= Math.pow(10, pointValue);

	positData.ask									= (ChartCFDConst.OEP_BUYSELL_TYPE_SELL === rawData.buySellType) ? true : false;
	positData.buysell							= (ChartCFDConst.OEP_BUYSELL_TYPE_SELL === rawData.buySellType) ? "売" : "買";

	positData.price								= Math.round(parseFloat(rawData.quotationPrice) * pow);
	positData.volume							= rawData.currentQuantity;
	positData.dateTime						= rawData.executionDate;

	//positData.id									= rawData.tatePositionKey;

	// #2441
	let positionKey:string = "";
	try {
		let nLen:number = rawData.positionKey.length;
		positionKey = rawData.positionKey.substring(nLen - 4, nLen);
	}
	catch(e) {
		console.error(e);
	}
	//
	positData.id									= rawData.positionKey;
	positData.positionKeyRaw			= rawData.positionKey;

	positData.isKv								= true;	// 必須
	positData.positionKey 				= rawData.positionKey;
	positData.securityCode				= rawData.cfdProductCode;
	positData.oi									= rawData.orderQuantity;

	positData.isCash							= false;

	positData.originalData				= rawData;

	// Tooltip: 建玉番号(下4桁) 売買 建玉数 建単価
	//          約定日時（YY/MM/DD hh24:mi） 

	positData.toolTipText					= positionKey + "&nbsp;"; // #2441
	positData.toolTipText	  		 += positData.buysell + "&nbsp;";
	positData.toolTipText	  		 += rawData.currentQuantity + "&nbsp;";
	positData.toolTipText	  		 += rawData.quotationPrice.toFixed(pointValue); // #2545

	// Menu text
	positData.menuText 						= positData.toolTipText; 
	positData.menuText 						= positData.menuText.replace(/\&nbsp;/g, " ");
	//

	try {
		let xDateTime = GetDateTimeFromDatetime(rawData.executionDate);
		let xDate:Date = ConvertDateTimeStringToDate(xDateTime.date, xDateTime.time);
		let dateTimeStr:string = FormatDate(xDate, "YYYY/MM/DD hh:mm");
		dateTimeStr = dateTimeStr.substr(2, dateTimeStr.length);
		positData.toolTipText	  	 += ("<br/>" + dateTimeStr);
	}
	catch(e) {
		console.error(e);
	}

	//
	return(positData);
}

export function MakeExecutionDataFromRawData(rawData:any, productCode:string, pointValue?:number) {
	if(rawData === undefined || rawData == null) {
		return;
	}

	// チェック銘柄コード
	if(productCode && productCode != "" && productCode !== rawData.cfdProductCode) {
		return;
	}

	let self = this;
	let executionData:ExecutionData = {} as ExecutionData;

	executionData.availableFlag		= true;

	pointValue										= pointValue || 0; // #1443
	pointValue										= Math.max(0, pointValue);
	let pow:number								= Math.pow(10, pointValue);

	executionData.ask							= (ChartCFDConst.OEP_BUYSELL_TYPE_SELL === rawData.buySellType) ? true : false;
	executionData.buysell					= (ChartCFDConst.OEP_BUYSELL_TYPE_SELL === rawData.buySellType) ? "売" : "買";
	executionData.price						= Math.round(parseFloat(rawData.executionPrice) * pow);
	executionData.volume					= rawData.executionQuantity;
	executionData.dateTime				= rawData.executionDatetime;

	//executionData.id						= rawData.executionKey;

	executionData.isKv						= true;	// 必須
	executionData.executionKey 		= rawData.executionKey;
	executionData.securityCode		= rawData.cfdProductCode;
	executionData.orderKey				= rawData.orderKey;
	executionData.dateTime2				= rawData.settleDate;

	executionData.originalData		= rawData;

	// Tooltip: 建玉番号(下4桁) 売買 建玉数 建単価
	//          約定日時（YY/MM/DD hh24:mi） 

	// #2449
	let displayKey:string = "";
	try {
		let nLen:number = rawData.orderKey.length;
		displayKey = rawData.orderKey.substring(nLen - 4, nLen);
	}
	catch(e) {
		console.error(e);
	}
	//

	executionData.toolTipText			= displayKey + "&nbsp;"; // #2449
	executionData.toolTipText		 += executionData.buysell + "&nbsp;";
	executionData.toolTipText		 += rawData.executionQuantity + "&nbsp;";
	executionData.toolTipText		 += rawData.executionPrice.toFixed(pointValue); // #2449, #2545

	// Menu text
	executionData.menuText 				= executionData.toolTipText; 
	executionData.menuText 				= executionData.menuText.replace(/\&nbsp;/g, " ");
	//

	try {
		let xDateTime = GetDateTimeFromDatetime(rawData.executionDatetime);
		let xDate:Date = ConvertDateTimeStringToDate(xDateTime.date, xDateTime.time);
		let dateTimeStr:string = FormatDate(xDate, "YYYY/MM/DD hh:mm");
		dateTimeStr = dateTimeStr.substr(2, dateTimeStr.length);
		executionData.toolTipText += ("<br/>" + dateTimeStr);
	}
	catch(e) {
		console.error(e);
	}

	//
	return(executionData);
}

export function MakeAlertDataFromRawData(rawData:any, productCode:string, pointValue?:number) {
	if(rawData === undefined || rawData == null) {
		return;
	}

	// チェック銘柄コード
	if(productCode && productCode != "" && productCode !== rawData.product) {
		return;
	}

	let self = this;
	let alertData:AlertData = {} as AlertData;

	alertData.availableFlag		= rawData.validFlag == "1" ?  true : false;
	if(alertData.availableFlag != true) {
		return;
	}

	pointValue								= pointValue || 0; // #1443
	pointValue								= Math.max(0, pointValue);
	let pow:number						= Math.pow(10, pointValue);

	alertData.price						= Math.round(parseFloat(rawData.basicRate) * pow);

	alertData.id							= rawData.alertKey;

	alertData.isKv						= true;	// 必須
	alertData.alertKey		 		= rawData.alertKey;
	alertData.securityCode		= rawData.product;

	alertData.originalData		= rawData;

	// Tooltip: 建玉番号 売買 建玉数 建単価
	//          約定日時（YY/MM/DD hh24:mi） 

	alertData.toolTipText			= "アラート（" + rawData.basicRate + "）";

	// Menu text
	alertData.menuText 				= rawData.basicRate; 
	//

	return(alertData);
}

/**
 * process for tick data
 * @param  {[type]} tickData===undefined||tickData==null
 * @return {[type]}
 */
export function MakeChartDatasForTickData(tickData:any, timeType:string) {
	if(tickData === undefined || tickData == null) {
		return;
	}

	let self = this;

	let tickPrice:any = tickData;

	let currentPrice;
	let workingDate;
	let businessDate;
	let tdDataTime;
	try {
		currentPrice 			= tickPrice.bid;

		tdDataTime 				= GetDateTimeFromDatetime(tickPrice.createDatetime);

		workingDate  = tdDataTime.date;
		businessDate = tickPrice.createBusinessDate;
	}
	catch(e) {
		console.debug("[LOG:CCVB] [ERROR:REAL] There is no element in TickPrice => " + e);
		return;
	}

	try {
		let tdPrice					= currentPrice;

		let tdBusinessDate	= parseInt(businessDate);
		let tdBDateAdjusted	= tdBusinessDate;
		let xBDate:Date			= ConvertNumberToDate(tdBusinessDate);
		if(ChartConst.TIME_TYPE_WEEK === timeType) {
			tdBDateAdjusted = ConvertDateToNumber(GetDateOfTheWeekAtDate(xBDate));
		}
		else if(ChartConst.TIME_TYPE_MONTH === timeType) {
			tdBDateAdjusted = ConvertDateToNumber(GetDateOfTheMonthAtDate(xBDate));
		}

		let tdDate 					= parseInt(workingDate);
		let tdTime 					= parseInt(tdDataTime.time);

		if(isNaN(tdDate) === true || isNaN(tdBusinessDate) === true || isNaN(tdBDateAdjusted) === true) {
			return;
		}

		let chartData:ChartData = {} as ChartData;

		chartData.date   			= workingDate;
		chartData.time   			= tdDataTime.time;
		chartData.close  			= tdPrice;

		chartData.businessDate= businessDate;

		chartData.date_n			= tdDate;
		chartData.time_n			= tdTime;
		chartData.bdate_n			= tdBDateAdjusted;

		//
		chartData.bdate_n_ori	= tdBusinessDate;

		//
		let result = {
			chartData: chartData,
			askBidData: {
				ask : tickPrice.ask,
				bid : tickPrice.bid,
				validFlag: tickPrice.validFlag
			}
		};

		return(result);
	}
	catch(e) {
		console.error(e);
	}

	return;
}

export function GetTimeTypeList() : any {
	const ohlcTypeCodes:any = ChartCFDConst.OHLC_TYPE_CODES;
	let keys:any = Object.keys(ohlcTypeCodes);
	const count:number = keys.length;
	let timeTypeList:any = [];
	for(var ii = 0; ii < count; ii++) {
		let key:string = keys[ii];
		let typeInfo:any = ohlcTypeCodes[key];
		timeTypeList.push({
			value: key,
			ohlcTypeCode: typeInfo.ohlcTypeCode,
			text: typeInfo.text
		});
	}

	return(timeTypeList);
}

export function ConvertTimeinfoToRequestOhlcTypeCode(timeType:string, timeInterval:string) : number {
	let ohlcTypeCode:number = 1;

	const ohlcTypeCodes:any = ChartCFDConst.OHLC_TYPE_CODES;

	try {
		let ttCode:string = timeType + "_" + timeInterval;
		let ohlcTypeInfo:any = ohlcTypeCodes[ttCode];
		return(ohlcTypeInfo.ohlcTypeCode);
	}
	catch(e) {
		console.error(e);

		ohlcTypeCode = 1;
	}

	return(ohlcTypeCode);
}

// #2230
export function ConvertRequestOhlcTypeCodeToTimeinfo(argTypeKey:string) : any {
	const ohlcTypeCodes:any = ChartCFDConst.OHLC_TYPE_CODES;

	try {
		let ohlcKeys:any = Object.keys(ohlcTypeCodes);
		for(var ii = 0; ii < ohlcKeys.length; ii++) {
			let ohlcKey:string = ohlcKeys[ii];
			let ohlcTypeCode:any = ohlcTypeCodes[ohlcKey];
			if(ohlcTypeCode && ohlcTypeCode.key == argTypeKey) {
				let timeInfos:any = ohlcKey.split("_");
				return({timeType:timeInfos[0], timeInterval:timeInfos[1]});
			}
		}
	}
	catch(e) {
		console.error(e);
	}
}
//

// #1587

export function ConvertToIndicatorInfo(configTechnical:IConfigChartTechnical, toChart?:boolean) : any {
	if(!configTechnical) {
		return;
	}

	let indicatorInfos:any = {
		trend : [],
		oscillator : []
	};

	let indicatorInfo:IIndicaterInfo;
	let indicatorItem:any = {
		code:"",
		params:[],
		plots:[]
	};

	// -------------------------------------------------------------------------
	// trend
	// -------------------------------------------------------------------------
	
	// 単純移動平均線
	indicatorInfo = {} as IIndicaterInfo;
	indicatorInfo.code = ChartCFDConst.INDICATOR_CODES.SMA_TRIPLE;
	indicatorInfo.trend= true;
	indicatorInfo.show = configTechnical.display.ma === true ? true : false;
	indicatorInfo.info = DeepCopy(indicatorItem);
	indicatorInfo.info.code = indicatorInfo.code;
	indicatorInfo.info.plots.push({name:"MA1", hide:configTechnical.parameters.ma1_disable});
	indicatorInfo.info.plots.push({name:"MA2", hide:configTechnical.parameters.ma2_disable});
	indicatorInfo.info.plots.push({name:"MA3", hide:configTechnical.parameters.ma3_disable});

	indicatorInfo.info.params.push({name:"Period1", value:parseInt(configTechnical.parameters.ma1)});
	indicatorInfo.info.params.push({name:"Period2", value:parseInt(configTechnical.parameters.ma2)});
	indicatorInfo.info.params.push({name:"Period3", value:parseInt(configTechnical.parameters.ma3)});

	indicatorInfos.trend.push(indicatorInfo);

	// 指数平滑移動平均
	indicatorInfo = {} as IIndicaterInfo;
	indicatorInfo.code = ChartCFDConst.INDICATOR_CODES.EMA_TRIPLE;
	indicatorInfo.trend= true;
	indicatorInfo.show = configTechnical.display.ema === true ? true : false;
	indicatorInfo.info = DeepCopy(indicatorItem);
	indicatorInfo.info.code = indicatorInfo.code;
	indicatorInfo.info.plots.push({name:"EMA1", hide:configTechnical.parameters.ema1_disable});
	indicatorInfo.info.plots.push({name:"EMA2", hide:configTechnical.parameters.ema2_disable});
	indicatorInfo.info.plots.push({name:"EMA3", hide:configTechnical.parameters.ema3_disable});

	indicatorInfo.info.params.push({name:"Period1", value:parseInt(configTechnical.parameters.ema1)});
	indicatorInfo.info.params.push({name:"Period2", value:parseInt(configTechnical.parameters.ema2)});
	indicatorInfo.info.params.push({name:"Period3", value:parseInt(configTechnical.parameters.ema3)});

	indicatorInfos.trend.push(indicatorInfo);

	// ボリンジャーバンド
	indicatorInfo = {} as IIndicaterInfo;
	indicatorInfo.code = ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE;
	indicatorInfo.trend= true;
	indicatorInfo.show = configTechnical.display.bollinger === true ? true : false;
	indicatorInfo.info = DeepCopy(indicatorItem);
	indicatorInfo.info.code = indicatorInfo.code;
	indicatorInfo.info.plots.push({name:"Middle", hide:configTechnical.parameters.bollingerMA_disable});
	
	if(configTechnical.parameters.bollinger1_disable === true) {
		indicatorInfo.info.plots.push({name:"Up1", hide:true});
		indicatorInfo.info.plots.push({name:"Dn1", hide:true});
	}
	else {
		indicatorInfo.info.plots.push({name:"Up1", hide:false});
		indicatorInfo.info.plots.push({name:"Dn1", hide:false});
	}

	if(configTechnical.parameters.bollinger2_disable === true) {
		indicatorInfo.info.plots.push({name:"Up2", hide:true});
		indicatorInfo.info.plots.push({name:"Dn2", hide:true});
	}
	else {
		indicatorInfo.info.plots.push({name:"Up2", hide:false});
		indicatorInfo.info.plots.push({name:"Dn2", hide:false});
	}
	
	if(configTechnical.parameters.bollinger3_disable === true) {
		indicatorInfo.info.plots.push({name:"Up3", hide:true});
		indicatorInfo.info.plots.push({name:"Dn3", hide:true});
	}
	else {
		indicatorInfo.info.plots.push({name:"Up3", hide:false});
		indicatorInfo.info.plots.push({name:"Dn3", hide:false});
	}
	
	indicatorInfo.info.params.push({name:"Period", value:parseInt(configTechnical.parameters.bollingerMA)});

	indicatorInfos.trend.push(indicatorInfo);

	// スーパーボリンジャーバンド
	indicatorInfo = {} as IIndicaterInfo;
	indicatorInfo.code = ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE_SUPER;
	indicatorInfo.trend= true;
	indicatorInfo.show = configTechnical.display.superBollinger === true ? true : false;
	indicatorInfo.info = DeepCopy(indicatorItem);
	indicatorInfo.info.code = indicatorInfo.code;
	indicatorInfo.info.plots.push({name:"Middle", hide:configTechnical.parameters.superBollingerMA_disable});
	indicatorInfo.info.plots.push({name:"BGSpan", hide:configTechnical.parameters.superBollingerLag_disable});
	
	if(configTechnical.parameters.superBollinger1_disable === true) {
		indicatorInfo.info.plots.push({name:"Up1", hide:true});
		indicatorInfo.info.plots.push({name:"Dn1", hide:true});
	}
	else {
		indicatorInfo.info.plots.push({name:"Up1", hide:false});
		indicatorInfo.info.plots.push({name:"Dn1", hide:false});
	}

	if(configTechnical.parameters.superBollinger2_disable === true) {
		indicatorInfo.info.plots.push({name:"Up2", hide:true});
		indicatorInfo.info.plots.push({name:"Dn2", hide:true});
	}
	else {
		indicatorInfo.info.plots.push({name:"Up2", hide:false});
		indicatorInfo.info.plots.push({name:"Dn2", hide:false});
	}
	
	if(configTechnical.parameters.superBollinger3_disable === true) {
		indicatorInfo.info.plots.push({name:"Up3", hide:true});
		indicatorInfo.info.plots.push({name:"Dn3", hide:true});
	}
	else {
		indicatorInfo.info.plots.push({name:"Up3", hide:false});
		indicatorInfo.info.plots.push({name:"Dn3", hide:false});
	}
	
	indicatorInfo.info.params.push({name:"Period", value:parseInt(configTechnical.parameters.superBollingerMA)});
	indicatorInfo.info.params.push({name:"BGSpan", value:parseInt(configTechnical.parameters.superBollingerLag)});
	indicatorInfo.info.params.push({name:"Band1", value:parseInt(configTechnical.parameters.superBollinger1)});
	indicatorInfo.info.params.push({name:"Band2", value:parseInt(configTechnical.parameters.superBollinger2)});
	indicatorInfo.info.params.push({name:"Band3", value:parseInt(configTechnical.parameters.superBollinger3)});

	indicatorInfos.trend.push(indicatorInfo);

	// スパンモデル
	indicatorInfo = {} as IIndicaterInfo;
	indicatorInfo.code = ChartCFDConst.INDICATOR_CODES.SPANMODEL;
	indicatorInfo.trend= true;
	indicatorInfo.show = configTechnical.display.span === true ? true : false;
	indicatorInfo.info = DeepCopy(indicatorItem);
	indicatorInfo.info.code = indicatorInfo.code;
	// #2519
	indicatorInfo.info.plots.push({name:"TenkanSen", hide:configTechnical.parameters.spanPrecede1_disable});
	indicatorInfo.info.plots.push({name:"KizyunSen", hide:configTechnical.parameters.spanPrecede2_disable});
	indicatorInfo.info.plots.push({name:"ChikouSen", hide:configTechnical.parameters.spanLater1_disable});

	indicatorInfo.info.params.push({name:"Period1", value:parseInt(configTechnical.parameters.spanPrecede1)});
	indicatorInfo.info.params.push({name:"Period2", value:parseInt(configTechnical.parameters.spanPrecede2)});
	indicatorInfo.info.params.push({name:"Period3", value:parseInt(configTechnical.parameters.spanLater1)});
	// [end] #2519
	
	indicatorInfos.trend.push(indicatorInfo);

	// 一目均衡表
	indicatorInfo = {} as IIndicaterInfo;
	indicatorInfo.code = ChartCFDConst.INDICATOR_CODES.ICHIMOKU_CFD;
	indicatorInfo.trend= true;
	indicatorInfo.show = configTechnical.display.ichimoku === true ? true : false;
	indicatorInfo.info = DeepCopy(indicatorItem);
	indicatorInfo.info.code = indicatorInfo.code;
	indicatorInfo.info.plots.push({name:"TenkanSen", hide:configTechnical.parameters.ichimokuTransit_disable});
	indicatorInfo.info.plots.push({name:"KizyunSen", hide:configTechnical.parameters.ichimokuBase_disable});
	indicatorInfo.info.plots.push({name:"ChikouSen", hide:configTechnical.parameters.ichimokuLater1_disable});
	indicatorInfo.info.plots.push({name:"SenkouSpan1", hide:configTechnical.parameters.ichimokuPrecede1_disable});
	indicatorInfo.info.plots.push({name:"SenkouSpan2", hide:configTechnical.parameters.ichimokuPrecede2_disable});

	indicatorInfo.info.params.push({name:"Period1", value:parseInt(configTechnical.parameters.ichimokuTransit)});
	indicatorInfo.info.params.push({name:"Period2", value:parseInt(configTechnical.parameters.ichimokuBase)});
	indicatorInfo.info.params.push({name:"Period5", value:parseInt(configTechnical.parameters.ichimokuLater1)});
	indicatorInfo.info.params.push({name:"Period3", value:parseInt(configTechnical.parameters.ichimokuPrecede1)});
	indicatorInfo.info.params.push({name:"Period4", value:parseInt(configTechnical.parameters.ichimokuPrecede2)});
	
	indicatorInfos.trend.push(indicatorInfo);

	// 平均足
	indicatorInfo = {} as IIndicaterInfo;
	indicatorInfo.code = ChartCFDConst.INDICATOR_CODES.HEIKINASHI;
	indicatorInfo.trend= true;
	indicatorInfo.show = configTechnical.display.average === true ? true : false;
	indicatorInfo.info = DeepCopy(indicatorItem);
	indicatorInfo.info.code = indicatorInfo.code;

	indicatorInfo.info.params.push({name:"Period", value:parseInt(configTechnical.parameters.average)});
	
	indicatorInfos.trend.push(indicatorInfo);

	// -------------------------------------------------------------------------
	// ocillator
	// -------------------------------------------------------------------------

	// MACD
	indicatorInfo = {} as IIndicaterInfo;
	indicatorInfo.code = ChartCFDConst.INDICATOR_CODES.MACD;
	indicatorInfo.trend= false;
	indicatorInfo.show = configTechnical.display.macd === true ? true : false;
	indicatorInfo.info = DeepCopy(indicatorItem);
	indicatorInfo.info.code = indicatorInfo.code;
	indicatorInfo.info.plots.push({name:"MACD", hide:configTechnical.parameters.macdShort_disable});
	indicatorInfo.info.plots.push({name:"Signal", hide:configTechnical.parameters.macdSignal_disable});

	indicatorInfo.info.params.push({name:"ShortPeriod", value:parseInt(configTechnical.parameters.macdShort)});
	indicatorInfo.info.params.push({name:"LongPeriod", value:parseInt(configTechnical.parameters.macdLong)});
	indicatorInfo.info.params.push({name:"Period", value:parseInt(configTechnical.parameters.macdSignal)});
	
	indicatorInfos.oscillator.push(indicatorInfo);

	// ストキャスティック
	indicatorInfo = {} as IIndicaterInfo;
	indicatorInfo.code = ChartCFDConst.INDICATOR_CODES.STOCHASTIC_CFD;
	indicatorInfo.trend= false;
	indicatorInfo.show = configTechnical.display.stochastic === true ? true : false;
	indicatorInfo.info = DeepCopy(indicatorItem);
	indicatorInfo.info.code = indicatorInfo.code;
	indicatorInfo.info.plots.push({name:"FastK", hide:configTechnical.parameters.perK_disable});
	indicatorInfo.info.plots.push({name:"FastD", hide:configTechnical.parameters.perD_disable});
	indicatorInfo.info.plots.push({name:"SlowD", hide:configTechnical.parameters.slowPerD_disable});

	indicatorInfo.info.params.push({name:"KPeriod", value:parseInt(configTechnical.parameters.perK)});
	indicatorInfo.info.params.push({name:"DPeriod", value:parseInt(configTechnical.parameters.perD)});
	indicatorInfo.info.params.push({name:"SPeriod", value:parseInt(configTechnical.parameters.slowPerD)});
	
	indicatorInfos.oscillator.push(indicatorInfo);

	// RCI
	indicatorInfo = {} as IIndicaterInfo;
	indicatorInfo.code = ChartCFDConst.INDICATOR_CODES.RCI;
	indicatorInfo.trend= false;
	indicatorInfo.show = configTechnical.display.rci === true ? true : false;
	indicatorInfo.info = DeepCopy(indicatorItem);
	indicatorInfo.info.code = indicatorInfo.code;

	indicatorInfo.info.params.push({name:"Period1", value:parseInt(configTechnical.parameters.rciShort)});
	indicatorInfo.info.params.push({name:"Period2", value:parseInt(configTechnical.parameters.rciMiddle)});
	indicatorInfo.info.params.push({name:"Period3", value:parseInt(configTechnical.parameters.rciLong)});
	
	indicatorInfos.oscillator.push(indicatorInfo);

	// RSI
	indicatorInfo = {} as IIndicaterInfo;
	indicatorInfo.code = ChartCFDConst.INDICATOR_CODES.RSI_TRIPLE;
	indicatorInfo.trend= false;
	indicatorInfo.show = configTechnical.display.rsi === true ? true : false;
	indicatorInfo.info = DeepCopy(indicatorItem);
	indicatorInfo.info.code = indicatorInfo.code;
	// #3069
	indicatorInfo.info.plots.push({name:"RSI_S", hide:configTechnical.parameters.cutlerRSIShort_disable});
	indicatorInfo.info.plots.push({name:"RSI_M", hide:configTechnical.parameters.cutlerRSIMiddle_disable});
	indicatorInfo.info.plots.push({name:"RSI_L", hide:configTechnical.parameters.cutlerRSILong_disable});

	indicatorInfo.info.params.push({name:"Period1", value:parseInt(configTechnical.parameters.cutlerRSIShort)});
	indicatorInfo.info.params.push({name:"Period2", value:parseInt(configTechnical.parameters.cutlerRSIMiddle)});
	indicatorInfo.info.params.push({name:"Period3", value:parseInt(configTechnical.parameters.cutlerRSILong)});
	//
	
	indicatorInfos.oscillator.push(indicatorInfo);

	if(toChart == true) {
		indicatorInfos.osl = [];

		//
		let nOslCount = indicatorInfos.oscillator.length;
		for(var ii = 0; ii < nOslCount; ii++) {
			let __temp__ = indicatorInfos.oscillator[ii];
			if(__temp__ && __temp__.show === true) {
				let oslList = [];
				oslList.push(__temp__.code);
				indicatorInfos.osl.push(oslList);
			}
		}
	}

	//
	return(indicatorInfos);
}

export function GetIndicatorInfoFromConfigByCode(configTechnical:IConfigChartTechnical, indicatorCode:string) : IIndicaterInfo {
	if(!configTechnical) {
		return;
	}

	let indicatorInfo:IIndicaterInfo;
	let indicatorItem:any = {
		code:"",
		params:[],
		plots:[]
	};

	// -------------------------------------------------------------------------
	// trend
	// -------------------------------------------------------------------------

	// 単純移動平均線
	if(ChartCFDConst.INDICATOR_CODES.SMA_TRIPLE == indicatorCode) {
		indicatorInfo = {} as IIndicaterInfo;
		indicatorInfo.code = indicatorCode;
		indicatorInfo.trend= true;
		indicatorInfo.show = configTechnical.display.ma === true ? true : false;
		indicatorInfo.info = DeepCopy(indicatorItem);
		indicatorInfo.info.code = indicatorInfo.code;
		indicatorInfo.info.plots.push({name:"MA1", hide:configTechnical.parameters.ma1_disable});
		indicatorInfo.info.plots.push({name:"MA2", hide:configTechnical.parameters.ma2_disable});
		indicatorInfo.info.plots.push({name:"MA3", hide:configTechnical.parameters.ma3_disable});

		indicatorInfo.info.params.push({name:"Period1", value:parseInt(configTechnical.parameters.ma1)});
		indicatorInfo.info.params.push({name:"Period2", value:parseInt(configTechnical.parameters.ma2)});
		indicatorInfo.info.params.push({name:"Period3", value:parseInt(configTechnical.parameters.ma3)});
	}
	// 指数平滑移動平均
	else if(ChartCFDConst.INDICATOR_CODES.EMA_TRIPLE == indicatorCode) {
		indicatorInfo = {} as IIndicaterInfo;
		indicatorInfo.code = indicatorCode;
		indicatorInfo.trend= true;
		indicatorInfo.show = configTechnical.display.ema === true ? true : false;
		indicatorInfo.info = DeepCopy(indicatorItem);
		indicatorInfo.info.code = indicatorInfo.code;
		indicatorInfo.info.plots.push({name:"EMA1", hide:configTechnical.parameters.ema1_disable});
		indicatorInfo.info.plots.push({name:"EMA2", hide:configTechnical.parameters.ema2_disable});
		indicatorInfo.info.plots.push({name:"EMA3", hide:configTechnical.parameters.ema3_disable});

		indicatorInfo.info.params.push({name:"Period1", value:parseInt(configTechnical.parameters.ema1)});
		indicatorInfo.info.params.push({name:"Period2", value:parseInt(configTechnical.parameters.ema2)});
		indicatorInfo.info.params.push({name:"Period3", value:parseInt(configTechnical.parameters.ema3)});
	}
	// ボリンジャーバンド
	else if(ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE == indicatorCode) {
		indicatorInfo = {} as IIndicaterInfo;
		indicatorInfo.code = indicatorCode;
		indicatorInfo.trend= true;
		indicatorInfo.show = configTechnical.display.bollinger === true ? true : false;
		indicatorInfo.info = DeepCopy(indicatorItem);
		indicatorInfo.info.code = indicatorInfo.code;
		indicatorInfo.info.plots.push({name:"Middle", hide:configTechnical.parameters.bollingerMA_disable});
		
		if(configTechnical.parameters.bollinger1_disable === true) {
			indicatorInfo.info.plots.push({name:"Up1", hide:true});
			indicatorInfo.info.plots.push({name:"Dn1", hide:true});
		}
		else {
			indicatorInfo.info.plots.push({name:"Up1", hide:false});
			indicatorInfo.info.plots.push({name:"Dn1", hide:false});
		}

		if(configTechnical.parameters.bollinger2_disable === true) {
			indicatorInfo.info.plots.push({name:"Up2", hide:true});
			indicatorInfo.info.plots.push({name:"Dn2", hide:true});
		}
		else {
			indicatorInfo.info.plots.push({name:"Up2", hide:false});
			indicatorInfo.info.plots.push({name:"Dn2", hide:false});
		}
		
		if(configTechnical.parameters.bollinger3_disable === true) {
			indicatorInfo.info.plots.push({name:"Up3", hide:true});
			indicatorInfo.info.plots.push({name:"Dn3", hide:true});
		}
		else {
			indicatorInfo.info.plots.push({name:"Up3", hide:false});
			indicatorInfo.info.plots.push({name:"Dn3", hide:false});
		}
		
		indicatorInfo.info.params.push({name:"Period", value:parseInt(configTechnical.parameters.bollingerMA)});
	}
	// スーパーボリンジャーバンド
	else if(ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE_SUPER == indicatorCode) {
		indicatorInfo = {} as IIndicaterInfo;
		indicatorInfo.code = indicatorCode;
		indicatorInfo.trend= true;
		indicatorInfo.show = configTechnical.display.superBollinger === true ? true : false;
		indicatorInfo.info = DeepCopy(indicatorItem);
		indicatorInfo.info.code = indicatorInfo.code;
		indicatorInfo.info.plots.push({name:"Middle", hide:configTechnical.parameters.superBollingerMA_disable});
		indicatorInfo.info.plots.push({name:"BGSpan", hide:configTechnical.parameters.superBollingerLag_disable});
		
		if(configTechnical.parameters.superBollinger1_disable === true) {
			indicatorInfo.info.plots.push({name:"Up1", hide:true});
			indicatorInfo.info.plots.push({name:"Dn1", hide:true});
		}
		else {
			indicatorInfo.info.plots.push({name:"Up1", hide:false});
			indicatorInfo.info.plots.push({name:"Dn1", hide:false});
		}

		if(configTechnical.parameters.superBollinger2_disable === true) {
			indicatorInfo.info.plots.push({name:"Up2", hide:true});
			indicatorInfo.info.plots.push({name:"Dn2", hide:true});
		}
		else {
			indicatorInfo.info.plots.push({name:"Up2", hide:false});
			indicatorInfo.info.plots.push({name:"Dn2", hide:false});
		}
		
		if(configTechnical.parameters.superBollinger3_disable === true) {
			indicatorInfo.info.plots.push({name:"Up3", hide:true});
			indicatorInfo.info.plots.push({name:"Dn3", hide:true});
		}
		else {
			indicatorInfo.info.plots.push({name:"Up3", hide:false});
			indicatorInfo.info.plots.push({name:"Dn3", hide:false});
		}
		
		indicatorInfo.info.params.push({name:"Period", value:parseInt(configTechnical.parameters.superBollingerMA)});
		indicatorInfo.info.params.push({name:"BGSpan", value:parseInt(configTechnical.parameters.superBollingerLag)});
		indicatorInfo.info.params.push({name:"Band1", value:parseInt(configTechnical.parameters.superBollinger1)});
		indicatorInfo.info.params.push({name:"Band2", value:parseInt(configTechnical.parameters.superBollinger2)});
		indicatorInfo.info.params.push({name:"Band3", value:parseInt(configTechnical.parameters.superBollinger3)});
	}
	// スパンモデル
	else if(ChartCFDConst.INDICATOR_CODES.SPANMODEL == indicatorCode) {
		indicatorInfo = {} as IIndicaterInfo;
		indicatorInfo.code = indicatorCode;
		indicatorInfo.trend= true;
		indicatorInfo.show = configTechnical.display.span === true ? true : false;
		indicatorInfo.info = DeepCopy(indicatorItem);
		indicatorInfo.info.code = indicatorInfo.code;
		// #2519
		indicatorInfo.info.plots.push({name:"TenkanSen", hide:configTechnical.parameters.spanPrecede1_disable});
		indicatorInfo.info.plots.push({name:"KizyunSen", hide:configTechnical.parameters.spanPrecede2_disable});
		indicatorInfo.info.plots.push({name:"ChikouSen", hide:configTechnical.parameters.spanLater1_disable});

		indicatorInfo.info.params.push({name:"Period1", value:parseInt(configTechnical.parameters.spanPrecede1)});
		indicatorInfo.info.params.push({name:"Period2", value:parseInt(configTechnical.parameters.spanPrecede2)});
		indicatorInfo.info.params.push({name:"Period3", value:parseInt(configTechnical.parameters.spanLater1)});
		// [end] #2519
	}
	// 一目均衡表
	else if(ChartCFDConst.INDICATOR_CODES.ICHIMOKU_CFD == indicatorCode) {
		indicatorInfo = {} as IIndicaterInfo;
		indicatorInfo.code = indicatorCode;
		indicatorInfo.trend= true;
		indicatorInfo.show = configTechnical.display.ichimoku === true ? true : false;
		indicatorInfo.info = DeepCopy(indicatorItem);
		indicatorInfo.info.code = indicatorInfo.code;
		indicatorInfo.info.plots.push({name:"TenkanSen", hide:configTechnical.parameters.ichimokuTransit_disable});
		indicatorInfo.info.plots.push({name:"KizyunSen", hide:configTechnical.parameters.ichimokuBase_disable});
		indicatorInfo.info.plots.push({name:"ChikouSen", hide:configTechnical.parameters.ichimokuLater1_disable});
		indicatorInfo.info.plots.push({name:"SenkouSpan1", hide:configTechnical.parameters.ichimokuPrecede1_disable});
		indicatorInfo.info.plots.push({name:"SenkouSpan2", hide:configTechnical.parameters.ichimokuPrecede2_disable});

		indicatorInfo.info.params.push({name:"Period1", value:parseInt(configTechnical.parameters.ichimokuTransit)});
		indicatorInfo.info.params.push({name:"Period2", value:parseInt(configTechnical.parameters.ichimokuBase)});
		indicatorInfo.info.params.push({name:"Period5", value:parseInt(configTechnical.parameters.ichimokuLater1)});
		indicatorInfo.info.params.push({name:"Period3", value:parseInt(configTechnical.parameters.ichimokuPrecede1)});
		indicatorInfo.info.params.push({name:"Period4", value:parseInt(configTechnical.parameters.ichimokuPrecede2)});
	}
	// 平均足
	else if(ChartCFDConst.INDICATOR_CODES.HEIKINASHI == indicatorCode) {
		indicatorInfo = {} as IIndicaterInfo;
		indicatorInfo.code = indicatorCode;
		indicatorInfo.trend= true;
		indicatorInfo.show = configTechnical.display.average === true ? true : false;
		indicatorInfo.info = DeepCopy(indicatorItem);
		indicatorInfo.info.code = indicatorInfo.code;

		indicatorInfo.info.params.push({name:"Period", value:parseInt(configTechnical.parameters.average)});
	}

	// -------------------------------------------------------------------------
	// ocillator
	// -------------------------------------------------------------------------

	// MACD
	else if(ChartCFDConst.INDICATOR_CODES.MACD == indicatorCode) {
		indicatorInfo = {} as IIndicaterInfo;
		indicatorInfo.code = indicatorCode;
		indicatorInfo.trend= false;
		indicatorInfo.show = configTechnical.display.macd === true ? true : false;
		indicatorInfo.info = DeepCopy(indicatorItem);
		indicatorInfo.info.code = indicatorInfo.code;
		indicatorInfo.info.plots.push({name:"MACD", hide:configTechnical.parameters.macdShort_disable});
		indicatorInfo.info.plots.push({name:"Signal", hide:configTechnical.parameters.macdSignal_disable});

		indicatorInfo.info.params.push({name:"ShortPeriod", value:parseInt(configTechnical.parameters.macdShort)});
		indicatorInfo.info.params.push({name:"LongPeriod", value:parseInt(configTechnical.parameters.macdLong)});
		indicatorInfo.info.params.push({name:"Period", value:parseInt(configTechnical.parameters.macdSignal)});
	}
	// ストキャスティック
	else if(ChartCFDConst.INDICATOR_CODES.STOCHASTIC_CFD == indicatorCode) {
		indicatorInfo = {} as IIndicaterInfo;
		indicatorInfo.trend= false;
		indicatorInfo.show = configTechnical.display.stochastic === true ? true : false;
		indicatorInfo.info = DeepCopy(indicatorItem);
		indicatorInfo.info.code = indicatorInfo.code;
		indicatorInfo.info.plots.push({name:"FastK", hide:configTechnical.parameters.perK_disable});
		indicatorInfo.info.plots.push({name:"FastD", hide:configTechnical.parameters.perD_disable});
		indicatorInfo.info.plots.push({name:"SlowD", hide:configTechnical.parameters.slowPerD_disable});

		indicatorInfo.info.params.push({name:"KPeriod", value:parseInt(configTechnical.parameters.perK)});
		indicatorInfo.info.params.push({name:"DPeriod", value:parseInt(configTechnical.parameters.perD)});
		indicatorInfo.info.params.push({name:"SPeriod", value:parseInt(configTechnical.parameters.slowPerD)});
	}
	// RSI
	else if(ChartCFDConst.INDICATOR_CODES.RSI_TRIPLE == indicatorCode) {
		indicatorInfo = {} as IIndicaterInfo;
		indicatorInfo.code = indicatorCode;
		indicatorInfo.trend= false;
		indicatorInfo.show = configTechnical.display.rsi === true ? true : false;
		indicatorInfo.info = DeepCopy(indicatorItem);
		indicatorInfo.info.code = indicatorInfo.code;
		// #3069
		indicatorInfo.info.plots.push({name:"RSI_S", hide:configTechnical.parameters.cutlerRSIShort_disable});
		indicatorInfo.info.plots.push({name:"RSI_M", hide:configTechnical.parameters.cutlerRSIMiddle_disable});
		indicatorInfo.info.plots.push({name:"RSI_L", hide:configTechnical.parameters.cutlerRSILong_disable});

		indicatorInfo.info.params.push({name:"Period1", value:parseInt(configTechnical.parameters.cutlerRSIShort)});
		indicatorInfo.info.params.push({name:"Period2", value:parseInt(configTechnical.parameters.cutlerRSIMiddle)});
		indicatorInfo.info.params.push({name:"Period3", value:parseInt(configTechnical.parameters.cutlerRSILong)});
		//
	}
	// RCI
	else if(ChartCFDConst.INDICATOR_CODES.RCI == indicatorCode) {
		indicatorInfo = {} as IIndicaterInfo;
		indicatorInfo.code = indicatorCode;
		indicatorInfo.trend= false;
		indicatorInfo.show = configTechnical.display.rci === true ? true : false;
		indicatorInfo.info = DeepCopy(indicatorItem);
		indicatorInfo.info.code = indicatorInfo.code;

		indicatorInfo.info.params.push({name:"Period1", value:parseInt(configTechnical.parameters.rciShort)});
		indicatorInfo.info.params.push({name:"Period2", value:parseInt(configTechnical.parameters.rciMiddle)});
		indicatorInfo.info.params.push({name:"Period3", value:parseInt(configTechnical.parameters.rciLong)});
	}

	//
	return(indicatorInfo);
}

export function ConvertToIConfigChartTechnical(config:any) : IConfigChartTechnical {
	if(!config) {
		return;
	}

	let configTechnical:IConfigChartTechnical = {} as IConfigChartTechnical;
	configTechnical.favItem = {
		description : ""
	};

	configTechnical.display = {

	};

	configTechnical.parameters = {

	};

	let rawConfig:any;
	if(typeof config == "string") {
		rawConfig = JSON.parse(config);
	}
	else {
		rawConfig = config;
	}

	let trends:any = rawConfig.trend;
	let oscillators:any = rawConfig.oscillator;
	if(trends && trends.length) {
		let indicators:any = trends;
		for(var ii = 0; ii < indicators.length; ii++) {
			let item:any = indicators[ii];
			if(ChartCFDConst.INDICATOR_CODES.SMA_TRIPLE == item.code) {
				configTechnical.display.ma = item.show;
				
				configTechnical.parameters.ma1 = '' + item.info.params[0].value;
				configTechnical.parameters.ma2 = '' + item.info.params[1].value;
				configTechnical.parameters.ma3 = '' + item.info.params[2].value;

				configTechnical.parameters.ma1_disable = item.info.plots[0].hide;
				configTechnical.parameters.ma2_disable = item.info.plots[1].hide;
				configTechnical.parameters.ma3_disable = item.info.plots[2].hide;
			}
			else if(ChartCFDConst.INDICATOR_CODES.EMA_TRIPLE == item.code) {
				configTechnical.display.ema = item.show;
				
				configTechnical.parameters.ema1 = '' + item.info.params[0].value;
				configTechnical.parameters.ema2 = '' + item.info.params[1].value;
				configTechnical.parameters.ema3 = '' + item.info.params[2].value;

				configTechnical.parameters.ema1_disable = item.info.plots[0].hide;
				configTechnical.parameters.ema2_disable = item.info.plots[1].hide;
				configTechnical.parameters.ema3_disable = item.info.plots[2].hide;
			}
			else if(ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE == item.code) {
				configTechnical.display.bollinger = item.show;
				
				configTechnical.parameters.bollingerMA = '' + item.info.params[0].value;
				configTechnical.parameters.bollinger1 = '1';
				configTechnical.parameters.bollinger2 = '2';
				configTechnical.parameters.bollinger3 = '3';
				
				configTechnical.parameters.bollingerMA_disable = item.info.plots[0].hide;
				configTechnical.parameters.bollinger1_disable = item.info.plots[1].hide;
				configTechnical.parameters.bollinger2_disable = item.info.plots[3].hide;
				configTechnical.parameters.bollinger3_disable = item.info.plots[5].hide;
			}
			else if(ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE_SUPER == item.code) {
				configTechnical.display.superBollinger = item.show;
				
				configTechnical.parameters.superBollingerMA  = '' + item.info.params[0].value;
				configTechnical.parameters.superBollingerLag = '' + item.info.params[1].value;
				configTechnical.parameters.superBollinger1   = '' + item.info.params[2].value;
				configTechnical.parameters.superBollinger2   = '' + item.info.params[3].value;
				configTechnical.parameters.superBollinger3   = '' + item.info.params[4].value;
				
				configTechnical.parameters.superBollingerMA_disable  = item.info.plots[0].hide;
				configTechnical.parameters.superBollingerLag_disable = item.info.plots[1].hide;
				configTechnical.parameters.superBollinger1_disable   = item.info.plots[2].hide;
				configTechnical.parameters.superBollinger2_disable   = item.info.plots[4].hide; // #2829
				configTechnical.parameters.superBollinger3_disable   = item.info.plots[6].hide;
			}
			else if(ChartCFDConst.INDICATOR_CODES.SPANMODEL == item.code) {
				configTechnical.display.span = item.show;
				
				configTechnical.parameters.spanPrecede1 = '' + item.info.params[0].value;
				configTechnical.parameters.spanPrecede2 = '' + item.info.params[1].value;
				configTechnical.parameters.spanLater1   = '' + item.info.params[2].value;
				
				configTechnical.parameters.spanPrecede1_disable = item.info.plots[0].hide; // #2519
				configTechnical.parameters.spanPrecede2_disable = item.info.plots[1].hide; // #2519
				configTechnical.parameters.spanLater1_disable   = item.info.plots[2].hide; // #2519
			}
			else if(ChartCFDConst.INDICATOR_CODES.ICHIMOKU_CFD == item.code) {
				configTechnical.display.ichimoku = item.show;
				
				configTechnical.parameters.ichimokuTransit  = '' + item.info.params[0].value;
				configTechnical.parameters.ichimokuBase     = '' + item.info.params[1].value;
				configTechnical.parameters.ichimokuPrecede1 = '' + item.info.params[2].value; // #2829
				configTechnical.parameters.ichimokuPrecede2 = '' + item.info.params[3].value; // #2829
				configTechnical.parameters.ichimokuLater1   = '' + item.info.params[4].value; // #2829
				
				configTechnical.parameters.ichimokuTransit_disable  = item.info.plots[0].hide;
				configTechnical.parameters.ichimokuBase_disable     = item.info.plots[1].hide;
				configTechnical.parameters.ichimokuPrecede1_disable = item.info.plots[2].hide; // #2829
				configTechnical.parameters.ichimokuPrecede2_disable = item.info.plots[3].hide; // #2829
				configTechnical.parameters.ichimokuLater1_disable   = item.info.plots[4].hide; // #2829
			}
			else if(ChartCFDConst.INDICATOR_CODES.HEIKINASHI == item.code) {
				configTechnical.display.average = item.show;
				
				configTechnical.parameters.average = '' + item.info.params[0].value;
			}
		}
	}

	if(oscillators && oscillators.length) {
		let indicators:any = oscillators;
		for(var ii = 0; ii < indicators.length; ii++) {
			let item:any = indicators[ii];
			if(ChartCFDConst.INDICATOR_CODES.MACD == item.code) {
				configTechnical.display.macd = item.show;
				
				configTechnical.parameters.macdShort = '' + item.info.params[0].value;
				configTechnical.parameters.macdLong  = '' + item.info.params[1].value;
				configTechnical.parameters.macdSignal= '' + item.info.params[2].value;

				configTechnical.parameters.macdShort_disable = item.info.plots[0].hide;
				configTechnical.parameters.macdSignal_disable = item.info.plots[1].hide;
			}
			else if(ChartCFDConst.INDICATOR_CODES.STOCHASTIC_CFD == item.code) {
				configTechnical.display.stochastic = item.show;
				
				configTechnical.parameters.perK     = '' + item.info.params[0].value;
				configTechnical.parameters.perD     = '' + item.info.params[1].value;
				configTechnical.parameters.slowPerD = '' + item.info.params[2].value;

				configTechnical.parameters.perK_disable = item.info.plots[0].hide;
				configTechnical.parameters.perD_disable = item.info.plots[1].hide;
				configTechnical.parameters.slowPerD_disable = item.info.plots[2].hide;
			}
			else if(ChartCFDConst.INDICATOR_CODES.RCI == item.code) {
				configTechnical.display.rci = item.show;
				
				configTechnical.parameters.rciShort = '' + item.info.params[0].value;
				configTechnical.parameters.rciMiddle = '' + item.info.params[1].value;
				configTechnical.parameters.rciLong = '' + item.info.params[2].value;

				// always show
				// configTechnical.parameters.rciShort_disable = item.info.plots[0].hide;
				// configTechnical.parameters.rciMiddle_disable = item.info.plots[1].hide;
				// configTechnical.parameters.ema3_disable = item.info.plots[2].hide;
			}
			else if(ChartCFDConst.INDICATOR_CODES.RSI_TRIPLE == item.code) {
				configTechnical.display.rsi = item.show;
				
				configTechnical.parameters.cutlerRSIShort  = '' + item.info.params[0].value;
				configTechnical.parameters.cutlerRSIMiddle = '' + item.info.params[1].value;
				configTechnical.parameters.cutlerRSILong   = '' + item.info.params[2].value;

				configTechnical.parameters.cutlerRSIShort_disable  = item.info.plots[0].hide;
				configTechnical.parameters.cutlerRSIMiddle_disable = item.info.plots[1].hide;
				configTechnical.parameters.cutlerRSILong_disable   = item.info.plots[2].hide;
			}
		}
	}
	// console.log(configTechnical);

	// console.log("----------------------------------------");

	// console.log(ConvertToIndicatorInfo(configTechnical));

	return(configTechnical);
}
//

// #2216
export function IsShowDisplaySetting(settingValue:string) {
	if(settingValue == "on") {
		return(true);
	}

	return(false);
}
//

// #1301

export function ConvertDateTimeStringToDate(argDate:string, argTime?:string) : Date {
	if(!argDate) {
		return;
	}

	let nDate:number = parseInt(argDate);

	let year:number  = parseInt(String(nDate / 10000));
	// month is start with 0(0 ~ 11)
	let month:number = (parseInt(String(nDate / 100)) % 100) - 1;
	let day:number   = parseInt(String(nDate % 100));
	if(argTime) {
		let nTime:number   = parseInt(argTime);
		let hour:number    = parseInt(String(nTime / 10000));
		let minute:number  = parseInt(String(nTime / 100)) % 100;
		let second:number  = parseInt(String(nTime % 100));

		return(new Date(year, month, day, hour, minute, second));
	}

	return(new Date(year, month, day));
}

export function GetDateTimeFromDatetime(arg:string) {
	if(arg === undefined || arg == null) {
		return;
	}

	return({date:arg.substring(0, 8), time:arg.substring(8, arg.length)});
}

export function CalcPrice(argPrice:any, pointValue:number, reverse?:boolean) {
	if(argPrice === undefined || argPrice == null) {
		return(0);
	}

	pointValue = pointValue ? pointValue : 0;

	var price = argPrice;

	var decimals = pointValue;
	//

	if(reverse === true) {
		return((price * Math.pow(0.1, decimals)));
	}
	else {
		return(Math.round(price * Math.pow(10, decimals)));
	}
}

export function GetDecimalPointValueFromBoUnit(boUnit:number) {
	try {
		// let temp:number = Math.log10(boUnit);
		// let pointValue:number = 0;
		// let power:number = 1;
		// pointValue = Math.abs(temp);
		// power = Math.pow(pointValue, 10);

		// return({power:power, pointValue:pointValue});
		let temp:number = Math.log10(boUnit);
		let pointValue:number = 0;
		pointValue = Math.abs(temp);

		return(pointValue);
	}
	catch(e) {

	}
}

export function GetTimeZoneItem(eachTradeTime:IEachTradeTime, timeType:string, timeInterval:string, tzName:string = "") {
	if(!eachTradeTime) {
		return;
	}

	let tzItem:TimeZoneItem = {} as TimeZoneItem;
	let nSTime = parseInt(eachTradeTime.eachTradeStartTime);
	let nETime = parseInt(eachTradeTime.eachTradeEndTime);

	// #2034
	let nTimeGap:number = parseInt(timeInterval);
	if(timeType == ChartConst.TIME_TYPE_HOUR) {
		nSTime = Math.floor(nSTime / 100)	* 100;
	}
	else if(timeType == ChartConst.TIME_TYPE_MINUTE) {
		let nSTimeHour:number = Math.floor(nSTime / 100)	* 100;
		let nSTimeMin:number  = nSTime % 100;
		let nMinFactor:number = Math.floor(nSTimeMin / nTimeGap);

		nSTime = nSTimeHour + nMinFactor * nTimeGap;
	}
	//
	
	const oneDayTime:number = 2400;

	if(nSTime >= oneDayTime) {
		tzItem.dateOffset = 1;
		tzItem.begin = nSTime - oneDayTime;
	}
	else {
		tzItem.dateOffset = 0;
		tzItem.begin = nSTime;
	}

	tzItem.begin = tzItem.begin * 100;
	tzItem.final = nETime * 100;
	tzItem.limit = nETime * 100;

	tzItem.name = tzName;
	tzItem.use  = true;

	return(tzItem);
}

/**
 * get time zone information
 * @param  {string}       symbolCode
 * @param  {string}       marketCode
 * @return {TimeZoneInfo}
 */
export function GetTimeZoneInfo(productInfo:IProductInfo, businessDate:string, timeType:string, timeInterval:string) : TimeZoneInfo {
	let self = this;

	// default
	let businessDatetime:any = {
		timeZones : [
			{	name : "zone1",	use : false },
			{	name : "zone2",	use : true , dateOffset :  0, begin :  90000,	final : 113000, limit : 123000 },
			{	name : "zone3",	use : true , dateOffset :  0, begin : 123000,	final : 150000, limit : 240000 },
		]
	};

	let xBdt:any = DeepCopy(businessDatetime);
	let xTzi:TimeZoneInfo = {} as TimeZoneInfo;
	xTzi.businessDate = parseInt(businessDate);
	xTzi.businessTime = 90000;
	xTzi.timeZones = xBdt.timeZones;

	try {
		if(!productInfo || !productInfo.eachTradeTimeList) {
			return;
		}
		
		businessDate = ConvertSimpleDateFromBusinessDate(businessDate);

		let __temp__ = {
			list: productInfo.eachTradeTimeList
		};

		let eachTradeTimeList:IEachTradeTime[] = DeepCopy(__temp__).list;
		eachTradeTimeList.sort(
			(a, b) => {
				return(parseInt(a.eachTradeStartTime) - parseInt(b.eachTradeStartTime));	
			});
		
		xTzi.timeZones = [];

		let nCount:number = eachTradeTimeList.length;
		for(var ii = 0; ii < nCount; ii++) {
			let eachTradeTime:IEachTradeTime = eachTradeTimeList[ii];
			let tzItem:TimeZoneItem = GetTimeZoneItem(eachTradeTime, timeType, timeInterval, "tzItem" + ii); // #2034

			xTzi.timeZones.push(tzItem);
		}

		// console.debug("[LOG:CCVB] Timezone info: " + JSON.stringify(xTzi));

		return(xTzi);
	}
	catch(e) {
		console.error(e);
	}

	return(xTzi);
}

//