export interface IReqWatchList {
}

export interface IResWatchList {
    status:string;
    message:string;
    datetime:string;
    result:{
        watchList:string[];
    };
}