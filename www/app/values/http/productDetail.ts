export interface IReqProductDetailList {
    productCodes:string | string[];
}

export interface IReqProductDetail {
    productCodes:string | string[];
}

export interface IResProductDetail {
    status:string;
    message:string;
    datetime:string;
    result:{
        productDetailList:ProductDetailList[];
        tradeTimeRangeList:TradeTimeRangeList[];
        interestRateBuySellList:InterestRateBuySellList[];
        priceAdjustmentList:PriceAdjustmentList[];
        floatingpos:Floatingpos[];
    };
}

interface ProductDetailList {
    cfdProductCode:string;
    maxOrderQuantity:number;
    accountType:string;
    settleCompulsionDate:string;
    leverageRatio:number;
    margin:number;
    losscutRange:number;
    losscutAlertRange:number;
    invalidDatetimeToday:string;
    invalidDatetimeThisWeekEnd:string;
    invalidDatetimeNextWeekEnd:string;    
}

interface TradeTimeRangeList {
    cfdProductCode:string;
    tradeStartDatetime:string;
    tradeEndDatetime:string;
}

interface InterestRateBuySellList {
    cfdProductCode:string;
    businessDate:string;
    sellInterestAjustValueYen:number;
    buyInterestAjustValueYen:number;
    grantDays:number;
}

interface PriceAdjustmentList {
    cfdProductCode:string;
    priceAdjustmentDate:string;
    sellPriceAdjustValue:number;
    buyPriceAdjustValue:number;
    nearbyMid:number;
    forwardMid:number;
    conversionRate:number;
    floatingpos:number;
}

interface Floatingpos {
    cfdProductCode:string;
    applyDate:string;
    sellDividendAdjustValue:number;
    buyDividendAdjustValue:number;
}