export interface IReqCancelOrder {
    orderJointId: string;
}

export interface IResCancelOrder {
    status: string;
    message: string;
    datetime: string;
    result: null;
		clientInfoMessage:clientInfoMessage[];
}
interface clientInfoMessage {
  messageCode:string;
  message:string;
  returnType:string;
}