export interface IReqUserInfo {
}

export interface IResUserInfo {
    status:string;
    message:string;
    datetime:string;
    result:{
        nickname:string;    // ニックネーム
        agreement:string;   // 同意事項有無  0：未同意事項なし、1：未同意事項あり
        cfdStatus:boolean;  // CFD口座開設済フラグ  true：開設済み、false：未開設

        // #2034
        // WebAPI設計書(JSON版).xlsxの1.1.30の内容に従って「業務日付」を追加する。
        businessDate:string;    // 日付区分「1:CFD業務日付」の業務日付を設定, YYYYMMDD
    };
}