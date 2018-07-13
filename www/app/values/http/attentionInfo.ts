export interface IReqAttentionInfo {
    cfdProductCode:string;
}

export interface IResAttentionInfo {
    status:string;
    message:string;
    datetime:string;
    result:{
    	attentionProductList:AttentionProductList[];
    };
}

interface AttentionProductList {
    attentionType:string;
    ratio:string;
    applyDate:string;
    startDate:string;
    endDate:string;
}