/**
 * IVewDataの変更テータ
 */
export enum ViewDataFlag{
    SYMBOL      = 1,    // by changed symbol
    // BOTH        = 3,    // by changed dragdrop or symbol
    GROUP       = 2,    // by changed Group ID (画面グループ番号)
    DRAGDROP    = 4,    // by changed dragdrop
    BROADCAST   = 8,    // 画面間データ連携による
}

/**
 * view stateの変更イベント
 */
export enum ViewStateFlag{
    RESIZED = 1,     // 画面のサイズ変更
    CHANGE  = 2
}

// panelTypeタイプ
export enum panelType {
    OTHER = 0,  // 注文（その他）
    SPEED = 1,  // 信用スピード注文
    LASER = 2,  // レーザー注文
    BOARD = 3,  // 板
    CHART = 4   // チャート
}

// フォントサイズ
export enum fontSizeType {
    BIG     = 0,  // 大きいサイズ
    NORMAL  = 1,  // 標準
    SMALL   = 2,  // 小さい
}

// // 売買区分
// export enum sellbuyType {
//     NONE    = 0,
//     SELL    = 1,
//     BUY     = 2,
// }

// // 注文区分
// export enum orderType {
//     LIMIT_ORDER = 0,
//     STOP_ORDER  = 1,
// }

// //  設定区分
// export enum setType {
//     PANEL_SET = 0,  // 画面設定
//     ALL_SET = 1,  　// 一般設定
// }

// // price data type
// export enum giveMePrice {
//     BOTH    = 0,  // Tick and Board
//     TICK    = 1,  // only Tick
//     BOARD   = 2,  // only Board
// }

// // price up or down
// export enum movePrice {
//     UP      = 0,
//     DOWN    = 1,
// }

// blink type
export enum blinkCheck{
    PRICE           = 1,        // 現在値
    CHANGE_RATE     = 2,        // 前日比
    ASKBID_COUNT    = 3,        // 気配数　増減
    ASKBID_HIGHLOW  = 4,        // 気配値　高安値  
    PROFITLOSS      = 5,        // 評価損益
}