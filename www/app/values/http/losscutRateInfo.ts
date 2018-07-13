export interface IReqLosscutRateInfoList {
    positionKeys:string | string[];
}

export interface IReqLosscutRateInfo {
    positionKeys:string;
}

export interface IResLosscutRateInfo {
    status:string;
    message:string;
    datetime:string;
    clientInfoMessage:clientInfoMessage[];
    result:{
        losscutRateCalcBefore:number;
        margin:number;
        optionalMarginBeforeTotal:number;
        optionalMarginBefore:number;
        marketPowerBefore:number;
        minQuotationPrice:number;
        maxQuotationPrice:number;
        minLosscutRate:number;
        maxLosscutRate:number;
        quotationQuantity:number;						
        orderQuantity:number;
        quotationPrice:number;
    };
}
interface clientInfoMessage {
    messageCode:string;
    message:string;
    returnType:string;
}