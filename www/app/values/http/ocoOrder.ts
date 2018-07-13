export interface IReqOcoOrder {
    cfdProductCode:string;
    orderType:string;
    buySellType:string;
    settleType:string;
    orderQuantity:string;
    orderPriceLimit:string;
    orderPriceStop:string;
    invalidDate:string;
    shiteiUmeParamList?:shiteiUmeParamList[];
}

export interface shiteiUmeParamList {
    positionKey:string;                           
    orderQuantity:string;                               

}
export interface IResOcoOrder {
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