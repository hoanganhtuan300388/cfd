export interface IReqInformationMessage {
    mode:string;
    seqno:string;
}

export interface IResInformationMessage {
    status:string;
    message:string;
    datetime:string;
    result:{
        message:string;
        startupDatetime:string;
        seqno:string;
        importantLevel:string;
        checkFlag:string;
     };
}