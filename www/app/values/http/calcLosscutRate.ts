export interface IReqCalcLosscutRate {
    positionKeys:string | string[];
    losscutRate?:string;
    addCancelAmount?:string;
}

export interface IResCalcLosscutRate {
    status:string;
    message:string;
    datetime:string;
    clientInfoMessage:clientInfoMessage[];
    result:{
        powerAmount:number;
        optionalMargin:number;
        optionalMarginvariance:number;
        optionalMarginAfterTotal:number;
        losscutRate:number;
        currentPowerAmount:number;
        minQuotationPrice:number;
        maxQuotationPrice:number;
        minLosscutRate:number;
        maxLosscutRate:number;
        currentOptionalMargin:number;
        currentMargin:number;
        currentOrderQuantity:number;
        currentLosscutRate:number;
    };
}
interface clientInfoMessage {
    messageCode:string;
    message:string;
    returnType:string;
}