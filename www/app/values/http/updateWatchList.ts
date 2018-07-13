export interface IReqUpdateWatchList {
    productCodes:string | string[];
}

export interface IReqUpdateWatch {
    productCodes:string;
}

export interface IResUpdateWatchList {
    status:string;
    message:string;
    datetime:string;
    result:null;
}