export interface IReqChangeLosscutRate {
    positionKeys:string | string[];
    losscutRate?:string;
    addCancelAmount?:string;
    optionalMarginAfterCalc:string;
}

export interface IResChangeLosscutRate {
    status:string;
    message:string;
    datetime:string;
    result:null;
    clientInfoMessage:clientInfoMessage[];
}
interface clientInfoMessage {
    messageCode:string;
    message:string;
    returnType:string;
}