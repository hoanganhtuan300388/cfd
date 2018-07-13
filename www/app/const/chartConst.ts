
export const NOTIFY_TYPE_SYMBOLINFO:number = 0;
export const NOTIFY_TYPE_SNAPSHOT:number = 1;
export const NOTIFY_TYPE_HISTORY:number = 2;
export const NOTIFY_TYPE_REAL:number = 3;
export const NOTIFY_TYPE_HISTORY_NEXT:number = 4;
export const NOTIFY_TYPE_AFTER_HISTORY:number = 5;
export const NOTIFY_TYPE_OEP_HISTORY:number = 10;
export const NOTIFY_TYPE_BDATE_CHANGED:number = 11;
export const NOTIFY_TYPE_UPDATE_ASKBID:number = 20; // #2007
export const NOTIFY_TYPE_ALERT_HISTORY:number = 21; // #2009
export const NOTIFY_TYPE_EXECUTION_HISTORY:number = 22; // #2009

// #1544
export const NOTIFY_TYPE_RESPONSE_ERROR:number = 99;
//

export const TIME_TYPE_MINUTE :string = '0';
export const TIME_TYPE_DAY		:string = '1';
export const TIME_TYPE_WEEK	  :string = '2';
export const TIME_TYPE_MONTH	:string = '3';
export const TIME_TYPE_TICK	  :string = '4';
export const TIME_TYPE_HOUR	  :string = '5'; // #2230

export const epdfPVDate		:number	= 0	;
export const epdfPVTime		:number	= 1	;
export const epdfPVOpen		:number	= 2	;
export const epdfPVHigh		:number	= 3	;
export const epdfPVLow		:number	= 4	;
export const epdfPVClose	:number	= 5	;
export const epdfPVVolume	:number	= 6	;
export const epdfPVAmount	:number	= 7	;
export const epdfPVOI			:number	= 8	;
export const epdfPVSeqNo	:number	= 9	;
export const epdfPVFlag		:number	= 10;
export const epdfPVBDate	:number	= 11;
export const epdfPVBFixed	:number	= 12;

export const REQUEST_COUNT:number	= 1000; // #2585
export const DEBUG_MODE:boolean = false;

export const REQUEST_MODE_DWM_VER	= 2;

// #1815
export const ERROR_CODE_OVER_TRENDLINE:number = 101;

export const ERROR_MAX_TRENDLINES = "トレンドラインの制限を超えています。";

export const CHANNEL_EVENT_ON_CLOSE_TECHNICAL:string = 'closeTechnical';
export const CHANNEL_EVENT_ON_OPEN_TECHNICAL:string = 'openTechnical';
export const CHART_TECHNICAL_SCREEN_NO:string = "03030601"; // #2994

// #2925
export const CHANNEL_EVENT_CLOSE_TECHNICAL_VIEW: string = 'closeTechnicalView';
export const CHANNEL_EVENT_OPEN_TECHNICAL_VIEW: string = 'openTechnicalView';
//