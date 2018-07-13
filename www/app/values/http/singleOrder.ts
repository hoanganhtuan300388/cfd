export interface IReqSingleOrder {
    cfdProductCode:string;
    orderType:string;
    buySellType:string;
    settleType:string;
    executionType:string;
    orderQuantity:string;
    priceId?:string;
    orderPrice?:string;
    allowedSlippage?:string;
    trailWidth?:string;
    invalidDate?:string;
    shiteiUmes?:ShiteiUmes[];
    orderBidPrice?:string;
    orderAskPrice?:string;
}

export interface ShiteiUmes {
    positionKey:string;
    orderQuantity:string;
}

export interface IResSingleOrder {
    status:string;
    message:string;
    datetime:string;
    result:{
        orderJointId:string;
    };
    clientInfoMessage:ClientInfoMessage[];
}

interface ClientInfoMessage {
    messageCode:string;
    message:string;
    returnType:string;
}