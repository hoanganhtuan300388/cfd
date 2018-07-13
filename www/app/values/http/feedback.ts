export interface IReqFeedback {
    news_id:number;
    product_cpc:string;
    datetime:string;
}

export interface IResFeedback {
    status:string;
    message:string;
    datetime:string;
    result:{
        news_id:number;
        product_cpc:string;
        datetime:string;
    };
}