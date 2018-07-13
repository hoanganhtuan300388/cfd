import { CommonEnum, CommonConst } from '../core/common';
import { TimeZoneInfos } from "../const/businessDatetimes";
import { DeepCopy, ConvertSimpleDateFromBusinessDate, ConvertNumberToDate, ConvertDateToNumber, GetDateOfTheWeekAtDate, GetDateOfTheMonthAtDate } from "../util/commonUtil";

import * as ChartConst from '../const/chartConst';

// 足種別
export const TIME_TYPE_CODES:Array<ITimeType> = [
	{code: ChartConst.TIME_TYPE_MINUTE	, name:"minute" , chartCode:1,	display: "分足"},
	{code: ChartConst.TIME_TYPE_DAY			, name:"day"    , chartCode:3,	display: "日足"},
	{code: ChartConst.TIME_TYPE_WEEK		, name:"week"   , chartCode:4,	display: "週足"},
	{code: ChartConst.TIME_TYPE_MONTH		, name:"month"  , chartCode:5,	display: "月足"},
	{code: ChartConst.TIME_TYPE_TICK		, name:"tick"   , chartCode:0,	display: "Tick足"},
	{code: ChartConst.TIME_TYPE_HOUR		, name:"hour"   , chartCode:2,	display: "時足"},	 // #2230
];

export function GetChartChartTimeTypeCode(argType:string) : number {
	return(TIME_TYPE_CODES[argType].chartCode);
}

export function GetTimeTypeNameFromCode(code:string) : string {
	var nCount = TIME_TYPE_CODES.length;
	for(var ii = 0; ii < nCount; ii++) {
		if(TIME_TYPE_CODES[ii].code === code) {
			return(TIME_TYPE_CODES[ii].name);
		}
	}

	return(null);
}

/**
 * 時間情報から表示する文字列へ変換する。
 * @param  {any}    timeType
 * @param  {any}    timeInterval
 * @return {string}
 */
export function GetChartTypeTitleFromTimeInfo(timeType:any, timeInterval:any) : string {
	let title = "";

	try {
		// #1628
		if(ChartConst.TIME_TYPE_MINUTE == timeType || ChartConst.TIME_TYPE_HOUR == timeType) { // #2230
			title = timeInterval + TIME_TYPE_CODES[timeType].display;
		}
		else {
			title = TIME_TYPE_CODES[timeType].display;
		}
		//
	}
	catch(e) {
		console.error(e);
	}

	return(title);
}

export function didCheckFixedChartData(argChartData:any, lastClose:number) : any {
	if(!argChartData) {
		return(lastClose);
	}

	let open  = argChartData[ChartConst.epdfPVOpen ];
	let high  = argChartData[ChartConst.epdfPVHigh ];
	let low   = argChartData[ChartConst.epdfPVLow  ];
	let close = argChartData[ChartConst.epdfPVClose];
	if((open  === undefined || open  == null || open  <= 0 ) ||
		 (high  === undefined || high  == null || high  <= 0 ) ||
		 (low   === undefined || low   == null || low   <= 0 ) ||
		 (close === undefined || close == null || close <= 0 ) ||
		 false
		) {
		argChartData[ChartConst.epdfPVOpen ]
		argChartData[ChartConst.epdfPVHigh ]
		argChartData[ChartConst.epdfPVLow  ]
		argChartData[ChartConst.epdfPVClose]  = lastClose;
		argChartData[ChartConst.epdfPVBFixed] = true;

		return(lastClose);
	}

	return(close);
}


//__requestInfo.nTType  = requestData.timeType;
export function didCalcPrice(argPrice:any, pointValue?:number, reverse?:boolean) {
	if(argPrice === undefined || argPrice == null) {
		return(0);
	}

	pointValue = pointValue ? pointValue : 0;

	var price = argPrice.price;

	var decimals = argPrice.decimals ? parseInt(argPrice.decimals) : 0;

	// #1266
	decimals = pointValue;//Math.max(pointValue, decimals, 0);
	//

	if(reverse === true) {
		return((price * Math.pow(0.1, decimals)));
	}
	else {
		return(Math.round(price * Math.pow(10, decimals)));
	}
}

export function didConvertDate(arg) {
	if(arg === undefined || arg == null) {
		return;
	}

	return(arg.replace(/\//g, ""));
}

export function didConvertTime(arg) {
	if(arg === undefined || arg == null) {
		return;
	}

	let temp = arg.replace(/:/g, "");
	if(temp.length < 6) {
		temp += "00";
	}

	return(temp);
}

export function didConvertDatetimeFromServer(rawData) {
	if(rawData === undefined || rawData == null) {
		return;
	}

	try {
		var dateTimes = rawData.split(" ");
		var newDatetime = dateTimes[0].replace(/-/g, "") + dateTimes[1].replace(/:/g, "");

		return(newDatetime);
	}
	catch(e) {
		console.error(e);
	}

	return;
}

/**
 * get time zone information
 * @param  {string}       symbolCode
 * @param  {string}       marketCode
 * @return {TimeZoneInfo}
 */
export function didGetTimeZoneInfo(symbolCode:string, marketCode:string, productType:string, businessDate:string) : TimeZoneInfo {
	let self = this;

	try {
		let timeZoneCode:string = productType;

		businessDate = ConvertSimpleDateFromBusinessDate(businessDate);

		let businessDatetime:any = TimeZoneInfos[timeZoneCode];
		if(!businessDatetime) {
			console.error("[LOG:CCVB] There is no business datetime information at session type [" + timeZoneCode + "] with symbol code => (" + symbolCode + ")");

			businessDatetime = {
				timeZones : [
					{	name : "zone1",	use : false },
					{	name : "zone2",	use : true , dateOffset :  0, begin :  90000,	final : 113000, limit : 123000 },
					{	name : "zone3",	use : true , dateOffset :  0, begin : 123000,	final : 150000, limit : 240000 },
				]
			};
		}

		let xBdt:any = DeepCopy(businessDatetime);

		let xTzi:TimeZoneInfo = {} as TimeZoneInfo;
		xTzi.businessDate = parseInt(businessDate);
		xTzi.businessTime = 90000;
		xTzi.timeZones = xBdt.timeZones;

		// console.debug("[LOG:CCVB] Timezone info: " + JSON.stringify(xTzi));

		return(xTzi);
	}
	catch(e) {
		console.error(e);
	}

	return;
}

/**
 * process for tick data
 * @param  {[type]} tickData===undefined||tickData==null
 * @return {[type]}
 */
export function MakeChartDataForTickData(tickData:any, timeType:string, lastData?:ChartData) {
	if(tickData === undefined || tickData == null) {
		return;
	}

	let self = this;

	let tickPrice:any = tickData;

	let currentPrice;
	let volume;
	let tradingValue;
	let workingDate;
	let businessDate;
	try {
		currentPrice = tickPrice.element.currentPrice;
		//lastTradingDate = tickPrice.element.lastTradingDate;
		volume = tickPrice.element.volume;
		tradingValue = tickPrice.element.tradingValue;

		// added by choi sunwoo at 2017.08.21 for #1238
		workingDate  = didConvertDate(tickPrice.element.dataDate.date);
		businessDate = didConvertDate(tickPrice.element.tradeDate.date);
	}
	catch(e) {
		console.debug("[LOG:CCVB] [ERROR:REAL] There is no element in TickPrice => " + e);
		return;
	}

	let	openPrice;
	let	highPrice;
	let	lowPrice;
	try {
		openPrice = tickPrice.element.openPrice;
		highPrice = tickPrice.element.highPrice;
		lowPrice = tickPrice.element.lowPrice;
	}
	catch(e) {
		console.error(e);
	}

	try {
		let tdPrice					= currentPrice;

		let tdBusinessDate	= parseInt(didConvertDate(businessDate));
		let tdBDateAdjusted	= tdBusinessDate;
		let xBDate:Date			= ConvertNumberToDate(tdBusinessDate);
		if(ChartConst.TIME_TYPE_WEEK === timeType) {
			tdBDateAdjusted = ConvertDateToNumber(GetDateOfTheWeekAtDate(xBDate));
		}
		else if(ChartConst.TIME_TYPE_MONTH === timeType) {
			tdBDateAdjusted = ConvertDateToNumber(GetDateOfTheMonthAtDate(xBDate));
		}

		let tdDate 					= parseInt(didConvertDate(workingDate));
		let tdTime 					= parseInt(didConvertTime(tdPrice.time));
		let tdSeqNo					= tickData.seq_no;
		let tdSnapshotFlag	= tickData.snapshot_flag;
		let tdVolume				= volume.volume.qty;
		let tdAmount				= tradingValue.tradingValue.qty;

		if(isNaN(tdDate) === true || isNaN(tdBusinessDate) === true || isNaN(tdBDateAdjusted) === true) {
			return;
		}

		let chartData:ChartData = {} as ChartData;

		chartData.date   			= workingDate;
		chartData.time   			= tdPrice.time;
		chartData.seq_no 			= tdSeqNo;
		chartData.close  			= DeepCopy(tdPrice.price);
		chartData.volume 			= tdVolume;
		chartData.amount 			= tdAmount;

		chartData.businessDate= businessDate;
		chartData.snapshotFlag= tdSnapshotFlag;

		chartData.date_n			= tdDate;
		chartData.time_n			= tdTime;
		chartData.bdate_n			= tdBDateAdjusted;

		//
		chartData.bdate_n_ori	= tdBusinessDate;

		if(openPrice) {
			chartData.open = DeepCopy(openPrice.price);
		}
		if(highPrice) {
			chartData.high = DeepCopy(highPrice.price);
		}
		if(lowPrice) {
			chartData.low	 = DeepCopy(lowPrice.price);
		}

		if(lastData === undefined || lastData == null) {
			chartData.volumeTick	= tdVolume;
			chartData.amountTick	= tdAmount;
		}
		else {
			chartData.volumeTick = (tdVolume - lastData.volume);
			chartData.amountTick = (tdAmount - lastData.amount);
		}

		//
		return(chartData);
	}
	catch(e) {
		console.error(e);
	}

	return;
}

//
// チャートモジュールで使用するデータ用インタフェース
//

//
// @see chart-setting
//

export interface StartingPoint {
	minuteChartStartingPoint?: {
		date:string;
		time:string;
	},
	dwmChartStartingPoint?: {
		date:string;
	},
	tickStartingPoint?: {
		date:string;
		seq_no:number;
	}
}

export interface StartingPointForInput {
	type:number;
	date?:string;
	time?:string;
	seq_no?:number;
}

export interface ChartRequestData {
  symbolCode:string;
  marketCode:string;
  timeType:string;
  timeInterval:string;
  dataCount:string;
	triggeredSymbol?:boolean;
	nextStartingPoint?:StartingPoint;

	tickSubscription?:any;
	hisitorySubscription?:any;

	meigaraInfo?:any;
}

export interface ChartRequestInfo {
	symbolCode:string;
  marketCode:string;
  timeType:string;
  timeInterval:string;
  dataCount:string;

	symbolName:string;
	displayTitle:string;
	meigaraCode:string;

	// non symbol info
	chartType:string;
	useOrderLine:boolean;
	usePositLine:boolean;
}

export interface ITimeType {
  code    	: string;
  name    	: string;
	chartCode	: number;
  display 	: string;
}

/**
 * 銘柄情報
 *
 * @export
 * @interface ChartSymbolInfo
 */
export interface ChartSymbolInfo {
  code        : string;
  name        : string;
  timeType    : number;
  timeGap     : number;
  pointValue  : number;
  lotSize     : number;
	display			: string;
  originalInfo: any;

	businessDate: string;
	isFop				: boolean;
	productType	: string;
	meigaraCode	: string;
}

export interface TimeZoneItem {
  name : string;
  use : boolean;
  dateOffset : number;
  date : number;
  begin : number;
  final : number;
  limit : number;
}

export interface TimeZoneInfo {
  businessDate : number;
  businessTime : number;
  timeZones : Array<TimeZoneItem>;
}

export interface OrderData {
	ask							: boolean,
	buysell 				: string,
	price 					: number,
	volume 					: number,			// jyuchuuSuuryo
	dateTime 				: string,			// YYYYMMDDHHMMSS
	cancelableFlag	:	boolean,
	correctableFlag	:	boolean,
	id							: string,

	isKv						: boolean,
	display					: string,
	orderKey 				: string,
	displayOrderKey	: string,
	securityCode		: string,
	dateTime2				: string,			// YYYY-MM-DD HH:MM:SS
	orderType 			: string,
	pointValue 			: number,
	oi 							: number,

	isCash					: boolean,
	isNISA					: boolean,

	originalData		: any,
	dummy						: string
}

export interface PositData {
	ask									: boolean,
	buysell 						: string,
	price 							: number,
	volume 							: number,			// jyuchuuSuuryo
	dateTime 						: string,			// YYYYMMDDHHMMSS
	checkSettlementFlag	:	boolean,
	id									: string,

	isKv								: boolean,
	display							: string,
	positionKey					: string,
	securityCode				: string,
	dateTime2						: string,			// YYYY-MM-DD HH:MM:SS
	pointValue 					: number,
	oi 									: number,
	isCash							: boolean,

	originalData				: any,
	dummy								: string
}

export interface ChartData {
	date:string;
	time:string;
	seq_no:number;
	close: {
		price:number;
		decimals:number;
	};
	volume:number;
	amount:number;

	volumeTick:number;
	amountTick:number;

	businessDate:string;	//
	snapshotFlag:boolean;

	date_n:number;
	time_n:number;
	bdate_n:number;

	decimals:number;

	open: {
		price:number;
		decimals:number;
	};

	high: {
		price:number;
		decimals:number;
	};

	low: {
		price:number;
		decimals:number;
	};

	bdate_n_ori:number;
}

export interface ChartDeployData {
  receiveRawDatas:Array<any>;
  receiveInfo:ChartSymbolInfo;
  requestData:ChartRequestData;

	chartType:string;
	useOrderLine:boolean;
	usePositLine:boolean;

  stopReceiveReal:boolean;
  historyIsRequested:boolean;
	historyIsReceived:boolean;

  tickDatas:Array<any>;

	orderDatas:Array<OrderData>;
	positionDatas:Array<any>;

	seriesInfo:string;

	lastData?:ChartData;
	snapshotData?:ChartData;
}
