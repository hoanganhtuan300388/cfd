export interface IReqMarketCalendarInfo {
}

export interface IResMarketCalendarInfo {
    status:string;
    message:string;
    datetime:string;
    result:{
        clientInfoMessage:string;
        marketCalendarList:MarketCalendarList[];
    };
}

export interface MarketCalendarList {
    marketCalendarId:number;
    contentId:number;
    importantType:string;
    countryCode:string;
    text:string;
    marketCalendarDatetime:string;
    unit:string;
    lastTime:string;
    expected:string;
    result:string;
    holiday:string;
}