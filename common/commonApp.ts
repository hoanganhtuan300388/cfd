
// user-agent prefix 
export const PREFIX_USER_AGENT                      = 'HatchukunCFD_';

// event notifier id
export const IPC_NOTIFICATION_REPLY_NEWS            = 'Notification.reply-news';
export const IPC_NOTIFICATION_REPLY_EVENT           = 'Notification.reply-event';
export const IPC_NOTIFICATION_REPLY_CALENDAR        = 'Notification.reply-calendar';
export const IPC_NOTIFICATION_REPLY_EOD             = 'Notification.reply-eod';
export const IPC_NOTIFICATION_REPLY_CONVERSION_RATE = 'Notification.reply-conversionRate';
export const IPC_NOTIFICATION_REPLY_POWERAMOUNT     = 'Notification.reply-poweramount';

// reload api
export const IPC_NOTIFICATION_RELOAD                = 'Notification.reload-api';
export const RELOAD_BY_EVENT                        = 'notification.event';
export const RELOAD_BY_PRICE                        = 'notification.price';
export const RELOAD_BY_EOD                          = 'notification.eod';

// expend notifier
export const IPC_NOTIFICATION_EVENT_ORDER           = 'Notification.event-order';
export const IPC_NOTIFICATION_EVENT_POSITION        = 'Notification.event-position';
export const IPC_NOTIFICATION_EVENT_EXECUTION       = 'Notification.event-execution';

// business
export const IPC_BUSINESS_QUERY                     = 'business.service-query';
export const IPC_BUSINESS_REPLY                     = 'business.service-reply';

export const IPC_SYMBOLE_OPEN                       = 'symbole.price-open';
export const IPC_SYMBOLE_CLOSE                      = 'symbole.price-close';
export const IPC_SYMBOLE_DATA                       = 'symbole.price-data';

// resource
export const IPC_RESOURCE_QUERY_ENVIRONMENT         = 'resource.query-environment';
export const IPC_RESOURCE_QUERY_CLIENTCFG           = 'resource.query-clientconfig';
export const IPC_RESOURCE_QUERY_SPEEDORDER          = 'resource.query-speedorder';
export const IPC_RESOURCE_UPDATE_SETTING            = 'resource.update-setting';
export const IPC_RESOURCE_UPDATE_ALERT              = 'resource.update-alert';
export const IPC_RESOURCE_UPDATE_SPEEDORDER         = 'resource.update-speedorder';

// local storage
export const IPC_LOCAL_STORAGE_ROOT_SET             = 'local.storage.root-set';
export const IPC_LOCAL_STORAGE_ROOT_GET             = 'local.storage.root-get';
export const IPC_LOCAL_STORAGE_USER_SET             = 'local.storage.user-set';
export const IPC_LOCAL_STORAGE_USER_GET             = 'local.storage.user-get';

// layout
export const IPC_LAYOUTINFO_CLEAR                   = 'layoutInfo.service:clear';
export const IPC_LAYOUTINFO_SET                     = 'layoutInfo.service:set';
export const IPC_LAYOUTINFO_GET                     = 'layoutInfo.service:get';
export const IPC_LAYOUTINFO_QUERY                   = 'layoutInfo.service:query';

// find panels
export const IPC_FINDPANEL_QUERY                    = 'panel-mng.find:query';
export const IPC_FINDPANEL_REPLY                    = 'panel-mng.find:reply';

// auto updater
export const IPC_AUTOUPDATE_NOTICE                  = 'autoUpdate.helper-notice';

// login
export const IPC_LOGINHELP_NOTICE                   = 'login.helper-notice';

// socket retry
export const IPC_CONNECTION_RETRY                   = 'socket.connection.retry';


// event notifier type
export const NoticeType = {
  NOTIFY_EXECUTION          : 'NOTIFY_EXECUTION',         // 約定通知（通知イベント）
  NOTIFY_ORDER_INVALIDAION  : 'NOTIFY_ORDER_INVALIDAION', // 注文失効通知（通知イベント）
  EXECUTION                 : 'EXECUTION',                // 約定
  ORDER_INVALIDATION        : 'ORDER_INVALIDATION',       // 注文失効
  NEW_ORDER                 : 'NEW_ORDER',                // 新規注文
  SETTLE_ORDER              : 'SETTLE_ORDER',             // 決済注文
  ORDER_UPDATE              : 'ORDER_UPDATE',             // 注文変更
  ORDER_CANCEL              : 'ORDER_CANCEL',             // 注文取消
  INTEREST_ADJUSTMENT       : 'INTEREST_ADJUSTMENT',      // 金利調整受払
  LOSSCUT_RATE_UPDATE       : 'LOSSCUT_RATE_UPDATE',      // ロスカットレート変更
  LOSSCUT_RATE_SETTLE       : 'LOSSCUT_RATE_SETTLE',      // ロスカットレート決済
  SQ_SETTLE                 : 'SQ_SETTLE',                // SQ決済
  TRAIL                     : 'TRAIL',                    // トレール注文
  SPEED_EXECUTION           : 'SPEED_EXECUTION',          // スピード注文約定
  SPEED_EXPIRE              : 'SPEED_EXPIRE',             // スピード注文失効
  EXPIRE                    : 'EXPIRE',                   // 失効
  UNEXPECTED_INCIDENT       : 'UNEXPECTED_INCIDENT',      // 約定異常
  NOTIFY_SPEED_EXPIRE       : 'NOTIFY_SPEED_EXPIRE',      // スピード注文失効通知（通知イベント）
  NOTIFY_EXPIRE             : 'NOTIFY_EXPIRE',            // 失効通知（通知イベント）
  REFRESH                   : 'REFRESH',                  // リフレッシュ
  CHART_REFRESH             : 'CHART_REFRESH',            // チャートリフレッシュ
}

export const DEFALUT_SOUND_EXECUTION    = "ベル01.mp3";
export const DEFALUT_SOUND_ALERT        = "お知らせ01.mp3";