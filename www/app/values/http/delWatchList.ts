export interface IReqDelWatchList {
    cfdProductCode:string
}

export interface IResDelWatchList {
    status:string;
    message:string;
    datetime:string;
    result:{
        watchList:string[];
    };
}