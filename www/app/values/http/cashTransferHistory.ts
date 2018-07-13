export interface IReqCashTransferHistory {
    receiptDateCode:string;
}

export interface IResCashTransferHistory {
    status:string;
    message:string;
    datetime:string;
    result:{
        transferHistoryList:TransferHistoryList[];
    };
}

interface TransferHistoryList {
    settleDate:string;
    receiptDatetime:string;
    cashTransferType:string;
    cashTransferAmount:string;
}