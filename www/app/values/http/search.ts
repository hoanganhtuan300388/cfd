export interface IReqSearch {
    id:number;                      // ニュース記事ID	
}

export interface IResSearch {
    status:string;
    message:string;
    relevant_products:IRelevantProducts[];
}

export interface IRelevantProducts {
    product_name:string;            // 銘柄名                  CFD_PRODUCTテーブルのMEIGARA_SEI_KANJIカラム値
    relevance_distance:string;      // 関連度スコア            ニュース記事と銘柄の間で計算された関連度
    product_cpc:string;             // CFD銘柄コード           CFD_PRODUCTテーブルのCFD_PRODUCT_CODEカラム値
}