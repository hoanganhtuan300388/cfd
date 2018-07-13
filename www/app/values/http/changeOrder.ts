export interface IReqChangeOrder {
    orderJointId:string;
    orderPriceNew?:string;
    orderPriceSettle?:string;
    orderPriceOcoStop?:string;
    trailWidth?:string;
    invalidDateNew?:string;
    invalidDateSettle?:string;
    losscutRate?:string;
    losscutRateOcoStop?:string;
}

export interface IResChangeOrder {
    status:string;
    message:string;
    datetime:string;
    // result:
    clientInfoMessage:ClientInfoMessage[];
}

interface ClientInfoMessage {
    messageCode:string;
    message:string;
    returnType:string;
}