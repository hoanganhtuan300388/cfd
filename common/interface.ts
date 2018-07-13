
// IRequestApi
export interface IRequestApi{
  api?:string;
  // method?:string;
  // cache?:boolean;
	sequence?:number;
	input?:any;
  // flexible?:boolean;
  // include?:string;
}

// IResponseApi
export interface IResponseApi{
	sequence:number;
	output:any;
}

export interface IBusinessApi{               // アラート設定
  name:string;
  service:string;
  method:string;
  flexible?:boolean;
  cache?:boolean;
  include?:string;
  error?:{
      NG:IAPIError;
      WARN?:IAPIError;
      NETWORK:IAPIError
  }
}

export interface IAPIError{
  code:string;
  retry:boolean;
  continue:boolean;
  handler?:Function;
}

//　BrowserWindow管理
export interface IWindowInfo{
  panelId:string;
  windowId:number;
  loaded:boolean;
  browserWindow:any;        // Electron.BrowserWindow
  option:IWindowOption;
}

//　BrowserWindow間データー連携
export interface IWindowOption{
  callback?:Function;
  params?:any;
  modal?:boolean;
  parentWindow?:any;        // Electron.BrowserWindow : #2408
}


export interface IEnvironment{
  // version number
  version?:string,
  // connected demo server
  demoTrade?:boolean,

  // debug mode.
  debug?:boolean,

  // スピード注文同意事項モーダル表示可否（false:表示, true：非表示）
  confirmHideSpeedOrderAgreement?:boolean,
  // speedOrderAgreement?:boolean,
  
  
  // メイン画面閉じる時、自動画面レイアウト保存モーダル表示可否（false:表示, true：非表示）
  confirmHideAutoLayoutSave?:boolean,

  // ウォッチリストから削除する際、モーダル表示可否（false:表示, true：非表示）
  confirmHideDeleteWatch?:boolean,
  // isOpenDeleteWatchConfirm?:boolean,

  session?:ISessionValue;

  clientConfig?:IResClientConfig;

};

export interface ISessionValue{
  sessionId?:string;
  jsessionId?:string;
  userId?:string;
}

export interface IResClientConfig{
  serviceStatus:string;							      // サービスステータス
  operationManualURI:string;						  // 操作マニュアルURL
  disclaimerURL:string;							      // ディスクレイマーURL
  maintenanceURL:string;							    // メンテナンス情報URL
  sysstatURL:string;								      // システム稼動状況URL
  keyIndicatorDataRetentionPeriod:number;	// 経済カレンダーデータ保持期間.	経済カレンダーのデータをstoreに保持する期間（日）
  keyIndicatorAppealTime:number;					// 経済カレンダー強調時間       	経済カレンダーのデータを強調表示する時間（分）
  newsNumber:number;								      // ニュース取得本数             	ニュースを取得する件数
  regCfdShop:string;								      // 利用規約URL                  	ログイン画面にある利用規約のリンク先
  toolInformationURL:string;						  // ツール紹介URL
  conversionRateURL:string;						    // コンバージョンレート画面URL 
  tradeRuleURL:string;							      // 取引ルールURL
  reportKindSelectURL:string;						  // 電子書類閲覧リダイレクトURL 
  platinumChartCfdURL:string;						  // プラチナチャートCFD画面URL
  cashManagementURL:string;						    // 入出金リダイレクトURL
  QAURL:string;									          // お問い合わせリダイレクトURL
  riskInfoURL:string;								      // 重要事項URL
  kouzaOpenURL:string;							      // 口座開設URL
  platinumChartCfdInfoURL:string;					// プラチナチャートCFDの紹介ページのリンク 
}

// 当日：2018/01/16
// 　　　分割TO　　　分割FROM
// 初回　2018/01/16　2018/01/10
// 2回目 2018/01/09　2018/01/03
// 3回目 2018/01/02　2017/12/27
// 4回目 2017/12/26　2017/12/20
// 最終　2017/12/19　2017/12/16　分割用FROMが当日-1ヶ月になったら最後
export interface IReqListItem {
  targetDateFrom  : string;     // 対象期間FROM   20180110
  targetDateTo    : string;     // 対象期間TO     20180116
}

// serviceStatus
// 【0の場合】
// ・ログインさせない。
// ・ログイン中であれば緊急ログアウト
// ※ツールのみ緊急メンテなどの場合を想定
// 【1の場合】
// ・ログインできる。
// ・ログイン中であれば操作可能状態

// 経済カレンダーのデータをstoreに保持する期間（日）
// 経済カレンダーのデータを強調表示する時間（分）
// ニュースを取得する件数
// ログイン画面にある利用規約のリンク先
