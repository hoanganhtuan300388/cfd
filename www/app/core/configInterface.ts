
// moduleId{
// '001'：  // 注文設定情報
// '002'：  // 銘柄別注文設定情報
// '003'：  // サウンド設定情報
// '004'：  // 表示設定情報
// '005'：  // チャート表示設定情報
// '006'：  // チャート色設定情報
// '007'：  // テクニカル設定情報
// '008'：  // アラート設定情報
// }
// MODULE_ID			'alert'
// MODULE_ID			'general'


/**
 * 全般
 */
export interface IConfigComm {
  virtualScreen   ?:   string;          // 画面レイアウト切り替え
  fontSize        ?:   string;          // 文字フォント
  theme           ?:   string;          // 画面テーマ
  background      ?:   string;          // 画面の背景
  taskBarGroup    ?:   string;          // task-bar group button 0:false, 1:true
}

/**
 * 設定
 */
export interface IConfigSetting{
  order?:IConfigOrder;                  // 注文設定情報
  orderProduct?:IConfigOrderProduct;    // 銘柄別注文設定情報
  sound?:IConfigSound;                  // サウンド設定情報
  display?:IConfigDisplay;              // 表示設定情報
  chartDisplay?:IConfigChartDisplay;    // チャート表示設定情報
  chartTech?:IConfigChartTechnical;     // テクニカル設定情報
  chartColor?:IConfigChartColor;        // チャート色設定情報
  alert?:any;                           // アラート
}

// 注文設定情報
export interface IConfigOrder{
  orderSettings?:IConfigOrderSettings;
}
export interface IConfigOrderSettings{
  initProduct?:string;			          // 初期注文銘柄
  initOrderType?:string;              // 初期注文タイプ
  initConfirmOmit?:boolean;           // 注文確認省略（on：チェック、off：解除）
  initOrderFormDisplay?:boolean;      // 注文画面を残す（on：チェック、off：解除）
  initSpeedOrderProduct?:string;      // スピード注文初期銘柄
}

// 銘柄別注文設定情報
export interface IConfigOrderProduct{
  // [productOrderSettings]の実際値は銘柄コード
  // ex) '0000306000':IConfigOrderByProductItem
  productOrderSettings?:IConfigOrderProductItem;
}

export interface IConfigOrderProductItem{
  initOrderQuantity?:string;			      // 取引数量（注文画面）
  initAllowSlippage?:boolean;           // 許容スリッページ（on：チェック、off：解除）（注文画面）
  initAllowSlippageValue?:string;       // 許容スリッページ値（注文画面）
  initTrailValue?:string;               // トレール幅（注文画面）
  initSpeedOrderQuantity?:string;       // 取引数量（スピード注文画面）
  speedOrderAllowSlippage?:boolean;     // 許容スリッページ（on：チェック、off：解除）（スピード注文画面）
  speedOrderAllowSlippageValue?:string; // 許容スリッページ値（スピード注文画面）
}

// サウンド設定情報
export interface IConfigSound{
  soundSettings?:IConfigSoundSettings;
}
export interface IConfigSoundSettings{
    executionSound?:string;			      // 約定音（on：チェック、off：解除）
    executionSoundFolder?:string;       // 約定音格納フォルダ
    executionSoundFile?:string;         // 約定音ファイル名
    alertSound?:string;                // アラート音（on：チェック、off：解除）
    alertSoundFolder?:string;           // アラート音格納フォルダ
    alertSoundFile?:string;             // アラート音ファイル名
}

// 表示設定情報
export interface IConfigDisplay{
  displaySettings?:IConfigDisplaySettings;
}
export interface IConfigDisplaySettings{
  //displaySettings?:{
    priceFlashing?:string;			        // プライス点滅（on：チェック、off：解除）
    priceFlashingUpColor?:string;       // UP点滅カラー
    priceFlashingDownColor?:string;     // DOWN点滅カラー
    desktopNotify?:string;              // 約定・失効通知（on：チェック、off：解除）
    saveLayout?:string;                 // レイアウト保存（on：チェック、off：解除）
  //}
}

// チャート表示設定情報
export interface IConfigChartDisplay{
  chartSettings?:IConfigChartDisplaySettings;
}
export interface IConfigChartDisplaySettings{
  //chartSettings?:{
    gridDisplay?:string;				        // グリッドの表示（vertical：垂直、horizontal：水平、cross：クロス）
    detailPriceDisplay ?:string;       // 詳細価格情報の表示（on：チェック、off：解除）
    currentPriceDisplay?:string;       // 現在値の表示（on：チェック、off：解除）
    highLowPriceDisplay?:string;       // 高値・安値の表示（on：チェック、off：解除）
    initProduct?:string;                // 初期表示銘柄
    initFoot?:string;                   // 初期表示の足の種類
    orderLineDisplay?:string;          // 注文ライン表示（on：チェック、off：解除）
    positionDisplay?:string;           // 建玉情報表示（on：チェック、off：解除）
    executionDisplay?:string;          // 約定情報表示（on：チェック、off：解除）
    alertLineDisplay?:string;          // アラートライン表示（on：チェック、off：解除）
  //}
}

// チャート色設定情報
export interface IConfigChartColor{
  chartColorSettings?:IConfigChartColorSettings;
}
export interface IConfigChartColorSettings{
    //backgroundColor?:string;			      // 背景色
    gridColor?:string;                  // グリッド色
    positiveLineFillColor?:string;      // 陽線　塗りつぶし色
    //positiveLineFrameColor?:string;     // 陽線　枠線色
    hiddenLineFillColor?:string;        // 陰線　塗りつぶし色
    //hiddenLineFrameColor?:string;       // 陰線　枠線色
    sameColor?:boolean;                 // 塗りつぶし色と枠線色は同色にする（on：チェック、off：解除）
}

// テクニカル設定情報
export interface IConfigChartTechnical{
    favItem?:IConfigChartTechnicalFavItemSettings;
}
export interface IConfigChartTechnicalFavItemSettings{	
    description?:string;								// お気に入り名称（お気に入り名またはデフォルト）
}
export interface IConfigChartTechnical{
    display?:IConfigChartTechnicalDisplaySettings;
}
export interface IConfigChartTechnicalDisplaySettings{
    ma?:boolean;                         // 単純移動平均表示フラグ（true：表示、false：非表示）
    ema?:boolean;                        // 指数平滑移動平均表示フラグ（true：表示、false：非表示）
    bollinger?:boolean;                  // ボリンジャーバンド表示フラグ（true：表示、false：非表示）
    superBollinger?:boolean;             // スーパーボリンジャー表示フラグ（true：表示、false：非表示）
    span?:boolean;                       // スパンモデル表示フラグ（true：表示、false：非表示）
    ichimoku?:boolean;                   // 一目均衡表表示フラグ（true：表示、false：非表示）
    average?:boolean;                    // 平均足表示フラグ（true：表示、false：非表示）
    macd?:boolean;                       // MACD表示フラグ（true：表示、false：非表示）
    stochastic?:boolean;                 // ストキャスティクス表示フラグ（true：表示、false：非表示）
    rci?:boolean;                        // RCI表示フラグ（true：表示、false：非表示）
    rsi?:boolean;                        // RSI表示フラグ（true：表示、false：非表示）
}
export interface IConfigChartTechnical{
    parameters?:IConfigChartTechnicalParametersSettings;
}
export interface IConfigChartTechnicalParametersSettings{
    ma1?:string;                        // 単純移動平均　短期線日数
    ma1_disable?:boolean;               // 単純移動平均　短期線日数　無効フラグ（true：非表示、false：表示）
    ma2?:string;                        // 単純移動平均　中期線日数
    ma2_disable?:boolean;               // 単純移動平均　中期線日数　無効フラグ（true：非表示、false：表示）
    ma3?:string;                        // 単純移動平均　長期線日数
    ma3_disable?:boolean;               // 単純移動平均　長期線日数　無効フラグ（true：非表示、false：表示）
    ema1?:string;                       // 指数平滑移動平均　短期線日数
    ema1_disable?:boolean;              // 指数平滑移動平均　短期線日数　無効フラグ（true：非表示、false：表示）
    ema2?:string;                       // 指数平滑移動平均　中期線日数
    ema2_disable?:boolean;              // 指数平滑移動平均　中期線日数　無効フラグ（true：非表示、false：表示）
    ema3?:string;                       // 指数平滑移動平均　長期線日数
    ema3_disable?:boolean;              // 指数平滑移動平均　長期線日数　無効フラグ（true：非表示、false：表示）
    bollingerMA?:string;                // ボリンジャーバンド MA
    bollingerMA_disable?:boolean;       // ボリンジャーバンド MA　無効フラグ（true：非表示、false：表示）
    bollinger1?:string;                 // ボリンジャーバンド 1σ（固定で1）
    bollinger1_disable?:boolean;        // ボリンジャーバンド 1σ　無効フラグ（true：非表示、false：表示）
    bollinger2?:string;                 // ボリンジャーバンド 2σ（固定で2）
    bollinger2_disable?:boolean;        // ボリンジャーバンド 2σ　無効フラグ（true：非表示、false：表示）
    bollinger3?:string;                 // ボリンジャーバンド 3σ（固定で3）
    bollinger3_disable?:boolean;        // ボリンジャーバンド 3σ　無効フラグ（true：非表示、false：表示）
    superBollingerMA?:string;           // スーパーボリンジャー MA
    superBollingerMA_disable?:boolean;  // スーパーボリンジャー MA　無効フラグ（true：非表示、false：表示）
    superBollingerLag?:string;          // スーパーボリンジャー 遅行スパン
    superBollingerLag_disable?:boolean; // スーパーボリンジャー 遅行スパン　無効フラグ（true：非表示、false：表示）
    superBollinger1?:string;            // スーパーボリンジャー バンド1
    superBollinger1_disable?:boolean;   // スーパーボリンジャー バンド1　無効フラグ（true：非表示、false：表示）
    superBollinger2?:string;            // スーパーボリンジャー バンド2
    superBollinger2_disable?:boolean;   // スーパーボリンジャー バンド2　無効フラグ（true：非表示、false：表示）
    superBollinger3?:string;            // スーパーボリンジャー バンド3
    superBollinger3_disable?:boolean;   // スーパーボリンジャー バンド3　無効フラグ（true：非表示、false：表示）
    spanPrecede1?:string;               // スパンモデル 先行スパン1
    spanPrecede1_disable?:boolean;      // スパンモデル 先行スパン1　無効フラグ（true：非表示、false：表示）
    spanPrecede2?:string;               // スパンモデル 先行スパン2
    spanPrecede2_disable?:boolean;      // スパンモデル 先行スパン2　無効フラグ（true：非表示、false：表示）
    spanLater1?:string;                 // スパンモデル 遅行スパン
    spanLater1_disable?:boolean;        // スパンモデル 遅行スパン　無効フラグ（true：非表示、false：表示）
    ichimokuTransit?:string;            // 一目均衡表 転換線
    ichimokuTransit_disable?:boolean;   // 一目均衡表 転換線　無効フラグ（true：非表示、false：表示）
    ichimokuBase?:string;               // 一目均衡表 基準線
    ichimokuBase_disable?:boolean;      // 一目均衡表 基準線　無効フラグ（true：非表示、false：表示）
    ichimokuPrecede1?:string;           // 一目均衡表 先行スパン1
    ichimokuPrecede1_disable?:boolean;  // 一目均衡表 先行スパン1　無効フラグ（true：非表示、false：表示）
    ichimokuPrecede2?:string;           // 一目均衡表 先行スパン2
    ichimokuPrecede2_disable?:boolean;  // 一目均衡表 先行スパン2　無効フラグ（true：非表示、false：表示）
    ichimokuLater1?:string;             // 一目均衡表 遅行スパン
    ichimokuLater1_disable?:boolean;    // 一目均衡表 遅行スパン　無効フラグ（true：非表示、false：表示）
    average?:string;                    // 平均足
    macdShort?:string;                  // MACD 短期
    macdShort_disable?:boolean;         // MACD 短期　無効フラグ（true：非表示、false：表示）
    macdLong?:string;                   // MACD 長期
    macdSignal?:string;                 // MACD シグナル日数
    macdSignal_disable?:boolean;        // MACD シグナル日数　無効フラグ（true：非表示、false：表示）
    perK?:string;                       // ストキャスティクス ％K
    perK_disable?:boolean;              // ストキャスティクス ％K　無効フラグ（true：非表示、false：表示）
    perD?:string;                       // ストキャスティクス ％D
    perD_disable?:boolean;              // ストキャスティクス ％D　無効フラグ（true：非表示、false：表示）
    slowPerD?:string;                   // ストキャスティクス Slow％D
    slowPerD_disable?:boolean;          // ストキャスティクス Slow％D　無効フラグ（true：非表示、false：表示）
    cutlerRSIShort?:string;             // RSI 短期
    cutlerRSIShort_disable?:boolean;    // RSI 短期　無効フラグ（true：非表示、false：表示）
    cutlerRSIMiddle?:string;            // RSI 中期
    cutlerRSIMiddle_disable?:boolean;   // RSI 中期　無効フラグ（true：非表示、false：表示）
    cutlerRSILong?:string;              // RSI 長期
    cutlerRSILong_disable?:boolean;     // RSI 長期　無効フラグ（true：非表示、false：表示）
    rciShort?:string;                   // RCI 短期
    rciMiddle?:string;                  // RCI 中期
    rciLong?:string;                    // RCI 長期
}

// アラート設定情報
export interface IConfigAlert{
  display_n?:{
    product?:string;                    // 設定銘柄
    basicRate?:number;                  // 基準レート
    validFlag?:string;                  // 有効フラグ
    signal?:string;                     // シグナル
  }
}