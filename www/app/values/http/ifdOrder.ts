export interface IReqIfdOrder {
    cfdProductCode:string;
    orderType:string;
    buySellTypeNew:string;
    executionTypeNew:string;
    orderQuantityNew:string;
    orderPriceNew:string;
    invalidDateNew:string;
    buySellTypeSettle:string;
    executionTypeSettle:string;
    orderQuantitySettle:string;
    orderPriceSettle:string;
    invalidDateSettle:string;
}

export interface IResIfdOrder {
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