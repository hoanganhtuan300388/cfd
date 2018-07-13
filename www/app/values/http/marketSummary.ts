export interface IReqMarketSummary {
}

export interface IResMarketSummary {
    status:string;
    message:string;
    datetime:string;
    result:{
        foreignMarketSummaryList:ForeignMarketSummaryList[];
        indexMarketSummaryList:IndexMarketSummaryList[];
    };
}

interface ForeignMarketSummaryList {
    productName:string;
    bid:number;
    ask:number;
    change:number;
    changePercentage:number;
    updateDatetime:string;
}

interface IndexMarketSummaryList {
    productName:string;
    current:number;
    change:number;
    changePercentage:number;
    updateDatetime:string;
}