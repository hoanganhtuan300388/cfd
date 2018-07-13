export interface IReqFundInfo {
    cfdProductCode:string;
}

export interface IResFundInfo {
    status:string;
    message:string;
    datetime:string;
    result:{
        fundSummary:string;
        etfName:string;
        tickerCode:string;
        exchange:string;
        fundManagersBenchmarkName:string;
        latestNav:number;
        latestNavCurrency:string;
        latestNavDate:string;
        totalNetAsset:number;
        totalNetAssetCurrency:string;
        totalNetAssetDate:string;
        assetClass:string;
        geographicFocus:string;
        launchDate:string;
        domicile:string;
        percentageGrowthPerMonth:number;
        percentageGrowthPer3Months:number;
        percentageGrowthPer6Months:number;
        percentageGrowthPer9Months:number;
        percentageGrowthPerYear:number;
        percentageGrowthPer2Years:number;
        percentageGrowthPer3Years:number;
        percentageGrowthPer5Years:number;
        percentageGrowthYtd:number;
        percentageGrowthLtd:number;
        topHoldingBoList:TopHoldingBoList[];
        url:string;
        updateDatetime:string;
    };
}

interface TopHoldingBoList {
    name:string;
    ratio:number;
}