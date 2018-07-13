export interface IReqIfdocoOrder {
    cfdProductCode:string;
    orderType:string;
    buySellTypeNew:string;
    executionTypeNew:string;
    orderQuantityNew:string;
    orderPriceNew:string;
    invalidDateNew:string;
    buySellTypeSettle:string;
    orderQuantitySettle:string;
    orderPriceSettleLimit:string;
    orderPriceSettleStop:string;
    invalidDateSettle:string;
}

export interface IResIfdocoOrder {
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