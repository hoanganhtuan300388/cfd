/**
 * ウォッチリスト：追加
 */
export interface IReqAddWatchList {
    cfdProductCode:string
}

export interface IResAddWatchList {
    status:string;
    message:string;
    datetime:string;
    result:{
        watchList:string[];
    };
}

/**
 * ウォッチリスト：更新　（リスト）
 */
export interface IReqPutWatchList {
    productCodes:string[];
}

export interface IResPutWatchList {
    status:string;
    message:string;
    datetime:string;
    result:any;
}