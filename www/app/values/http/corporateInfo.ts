export interface IReqCorporateInfo {
    cfdProductCode:string
}

export interface IResCorporateInfo {
    status:string;
    message:string;
    datetime:string;
    result:{
        businessSummary:string;
        marketCapitalization:number;
        salesRevenue:number;
        netIncome:number;
        enterpriseValue:number;
        ebitda:number;
        per:number;
        employees:number;
        pbr:number;
        grossProfitMargin:number;
        roe:number;
        salesRevenuePerShare:number;
        netAssetPerShare:number;
        dividendPerShare:number;
        earningsPerShare:number;
        estimateSalesRevenue:number;
        estimateNetIncome:number;
        estimateEps:number;
        estimatePer:number;
        url:string;
        updateDatetime:string;
        priceCurrency:string;
        
    };
}

interface TopHoldingBoList {
    name:string;
    ratio:number;
}