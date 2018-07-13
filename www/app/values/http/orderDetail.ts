/**-----------------------------------------------------------------------------
 * 注文詳細要求
 * 
 *----------------------------------------------------------------------------*/
export interface IReqOrderDetail {

  // 注文番号
  orderKey:string;
}

/**-----------------------------------------------------------------------------
 * 注文詳細応答
 * 
 *----------------------------------------------------------------------------*/
export interface IResOrderDetail {

    status:string;                                
    message:string;                             
    datetime:string;                                

    result: {
        orderDetailList:orderDetailList[],
        orderOperationList:orderOperationList[],
        executionList:executionList[],
        settlePositionList:settlePositionList[]
    }
}

interface orderDetailList{
    orderKey:string;                                
    cfdProductCode:string;  
    buySellType:string; 
    settleType:string;  
    executionType:string;   
    orderType:string;   
    orderPrice:number;  
    trailWidth:number;
    stopPrice:number;
    orderQuantity:number;
    invalidDatetime:string; 
    orderDatetime:string;   
    orderStatus:string; 
    failureReason:string;   
    losscutRate:number;
    allowedSlippage:number;
}

interface orderOperationList{
    orderOperationType:string;                              
    orderOperationDatetime:string;                              
    orderType:string;   
    trailWidth:string;  
    orderPriceNew:string;                               
    orderPriceSettle:string;                                
    orderPriceOcoStop:string;                               
    losscutRate:string;                             
    losscutRateOcoStop:string;                              
    invalidDatetimeNew:string;                              
    invalidDatetimeSettle:string;                               

}
interface executionList{
    executionKey:string;
    cfdProductCode:string;
    buySellType:string; 
    settleType:string;  
    executionQuantity:string;   
    executionPrice:string;  
    executionDatetime:string;   
    settleDate:string;    
    settleAmount:string;    
    profitLoss:string;  
    interestRateAmount:string;  
    dividendAmount:string;  
    commission:string;  
    conversionRate:string;                              

}
interface settlePositionList{
    positionKey:string;                             
    cfdProductCode:string;                              
    buySellType:string;                             
    currentQuantity:string;                             
    quotationPrice:string;                              
    excutionDate:string;                                
    settlementDueDate:string;                               
    settlementQuantity:string;                              
    settlementPrice:string;                             
    settleAmount:string;
    profitLoss:string;
    interestRateAmount:string;
    dividendAmount:string;
    commission:string;
}
    