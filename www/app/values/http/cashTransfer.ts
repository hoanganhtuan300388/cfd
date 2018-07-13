/**
 * 
 */
// 振替
export interface IReqCashTransfer {
    transferWay:string;         // 振替先  "01：CFD口座から証券口座へ, 02：証券口座からCFD口座へ"													
    transferAmount:number;		// 振替金額					
}

/**
 * 
 */
// 振替
export interface IResCashTransfer {
    status:string;
    message:string;
    datetime:string;
    result:any;
    clientInfoMessage:ClientInfoMessage[];
}

interface ClientInfoMessage {
  messageCode:string;
  message:string;
  returnType:string;
}
