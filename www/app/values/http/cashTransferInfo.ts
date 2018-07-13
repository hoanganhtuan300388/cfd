// 振替情報取得
export interface IReqGetCashTransferInfo{

}

// 振替情報取得
export interface IResGetCashTransferInfo {
    status:string;
    message:string;
    datetime:string;
    result:{
        secTransferPowerAmount:string;  // 証券取引口座振替可能額
        cfdTransferPowerAmount:string;  // CFD取引口座振替可能額
    };
}