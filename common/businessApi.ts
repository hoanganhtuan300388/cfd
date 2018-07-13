import {Messages} from './message';
import {MessageBox} from '../app/util/messageBox';

export class ERROR_CODE{
    static OK      = "0";
    static WARN    = "1";
    static NG      = "2";
    
    static NETWORK = "100";
    static HTTP    = "101";
    static BLOCKED = "102";
    static UNKNOWN = "103";
};


export const BusinessApi = {
    /**
     *      stream server path
     */
    stream: {
        price:              { url:'stream/price'               },
        news:               { url:'stream/news'                },
        calendar:           { url:'stream/calendar'            },
        conversionRate:     { url:'stream/conversion-rate'     },
        event:              { url:'stream/event'               },
        eod:                { url:'stream/eod'                 },
    },        

    /**
     *  APIs
     */
    API : {
        ifdocoOrder:{               // IFD-OCO注文 -------------------------------------
            name: 'ifdocoOrder',
            service : 'ifdocoOrder',
            method:'POST',
            error:{
                NG:{
                    code:'CFDS3701T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS3702C',
                    retry:false,
                    continue:true
                }                
            }
        },
        ifdOrder:{                  // IFD注文 ----------------------------------------
            name: 'ifdOrder',
            service : 'ifdOrder',
            method:'POST',
            error:{
                NG:{
                    code:'CFDS3801T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS3802C',
                    retry:false,
                    continue:true
                }                
            }
        },
        ocoOrder:{                  // OCO注文 ------------------------------------------------
            name: 'ocoOrder',
            service : 'ocoOrder',
            method:'POST',
            error:{
                NG:{
                    code:'CFDS3901T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS3902C',
                    retry:false,
                    continue:true
                }                
            }
        },
        speedOrder:{                // スピード新規決済注文 --------------------------------------
            name: 'speedOrder',            
            service : 'speedOrder',
            method:'POST',
            error:{
                NG:{
                    code:'CFDS3401T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS3402C',
                    retry:false,
                    continue:true
                }                
            }
        },
        speedAllSettleOrder:{       // スピード全決済注文 ----------------------------------------
            name: 'speedAllSettleOrder',            
            service : 'speedAllSettleOrder',
            method:'POST',
            error:{
                NG:{
                    code:'CFDS3501T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS3502C',
                    retry:false,
                    continue:true
                }                
            }
        },
        singleOrder:{               // 通常注文 ----------------------------------------
            name: 'singleOrder',
            service : 'singleOrder',
            method:'POST',
            error:{
                NG:{
                    code:'CFDS3601T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS3602C',
                    retry:false,
                    continue:true
                }                
            }
        },
        changeOrder:{               // 注文変更 ----------------------------------------
            name: 'changeOrder',
            service : 'changeOrder',
            method:'POST',
            error:{
                NG:{
                    code:'CFDS4001T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS4002C',
                    retry:false,
                    continue:true
                }
            }
        },
        cancelOrder:{               // 注文取消 ----------------------------------------
            name: 'cancelOrder',
            service : 'cancelOrder',
            method:'POST',
            error:{
                NG:{
                    code:'CFDS4101T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS4102C',
                    retry:false,
                    continue:true
                }
            }
        },
        attentionInfo:{             // 取引注意情報取得 ---------------------------------
            name: 'attentionInfo',
            service : 'attentionInfo',
            method:'GET',
            flexible:true,
            error:{
                NG:{
                    code:'CFDS3301T',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS3302C',
                    retry:false,
                    continue:true
                }                
            }
        },
        getPriceList:{              // レート取得 --------------------------------------
            name: 'getPriceList',
            service : 'getPriceList',
            method:'GET',
            error:{
                NG:{
                    code:'',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'',
                    retry:false,
                    continue:true
                }                
            }
        },
        // getHighLowPriceList:{       // 銘柄別HighLow一覧取得
        //     name: 'getHighLowPriceList',
        //     service : 'getHighLowPriceList',
        //     method:'GET'
        // },
        getProductDetail:{          // 銘柄詳細取得 -------------------------------------
            name: 'getProductDetail',
            service : 'getProductDetail',
            method:'GET',
            error:{
                NG:{
                    code:'CFDS1401T',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS1402C',
                    retry:true,
                    continue:true
                }                
            }
        },
        getProductList:{            // 銘柄一覧取得 ------------------------------------
            name: 'getProductList',
            service : 'getProductList',
            method:'GET', 
            cache:true,
            error:{
                NG:{
                    code:'CFDS0101T',
                    retry:false,
                    continue:false,
                    handler:function(parent){
                        var text = `${Messages.ERR_0001}[${this.code}]`; 
                        MessageBox.show(Messages.STR_0001, text, parent, true, null);
                    }
                },
                NETWORK:{
                    code:'CFDS0102C',
                    retry:true,
                    continue:false,
                    handler:function(parent){
                        var text = `${Messages.ERR_0002}[${this.code}]`; 
                        MessageBox.show(Messages.STR_0001, text, parent, true, null);
                    }
                }
            }
        },
        classifiedProducts:{       // 分類済み銘柄一覧取得 ------------------------------
            name: 'classifiedProducts',
            service : 'classifiedProducts',
            method:'GET', 
            cache:true,
            error:{
                NG:{
                    code:'CFDS0301T',
                    retry:false,
                    continue:false,
                    handler:function(parent){
                        var text = `${Messages.ERR_0001}[${this.code}]`; 
                        MessageBox.show(Messages.STR_0001, text, parent, false, null);
                    }
                },
                NETWORK:{
                    code:'CFDS0302C',
                    retry:true,
                    continue:false,
                    handler:function(parent){
                        var text = `${Messages.ERR_0002}[${this.code}]`; 
                        MessageBox.show(Messages.STR_0001, text, parent, false, null);
                    }
                }
            }
        },
        userInfo:{                  // 基本情報 ----------------------------------------
            name: 'userInfo',
            service : 'userInfo',
            method:'GET', 
            cache:true,
            error:{
                NG:{
                    code:'CFDS0601T',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS0602C',
                    retry:true,
                    continue:true
                }
            }
        },
        getConversionRate:{         // コンバージョンレート取得 ---------------------------
            name: 'getConversionRate',
            service : 'getConversionRate',
            method:'GET', 
            cache:true,
            error:{
                NG:{
                    code:'CFDS0401T',
                    retry:false,
                    continue:false,
                    handler:function(parent){
                        var text = `${Messages.ERR_0001}[${this.code}]`; 
                        var title = Messages.STR_0001;
                        MessageBox.show(title, text, parent, true, null);                        
                    }
                },
                NETWORK:{
                    code:'CFDS0402C',
                    retry:true,
                    continue:false,
                    handler:function(parent){
                        var text = `${Messages.ERR_0002}[${this.code}]`; 
                        var title = Messages.STR_0001;
                        MessageBox.show(title, text, parent, true, null);                        
                    }
                }
            }
        },
        getPowerAmount:{            // 余力情報取得 -------------------------------------
            name: 'getPowerAmount',
            service : 'getPowerAmount',
            method:'GET', 
            cache:true,
            error:{
                NG:{
                    code:'CFDS0501T',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS0502C',
                    retry:true,
                    continue:true
                }
            }
        },
        getPowerAmountDirect:{       // 余力情報取得 サーバーから直接持ってくる　-------------
            name: 'getPowerAmountDirect',
            service : 'getPowerAmount',
            method:'GET', 
            cache:false,
            error:{
                NG:{
                    code:'CFDS0501T',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS0502C',
                    retry:true,
                    continue:true
                }
            }
        },
        getPositionList:{           // 建玉一覧取得 --------------------------------------
            name: 'getPositionList',
            service : 'getPositionList',
            method:'GET', 
            cache:true,
            error:{
                NG:{
                    code:'CFDS0801T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS0802C',
                    retry:true,
                    continue:true
                }                
            }
        },
        getPositionListDirect:{           // サーバーから建玉一覧取得 --------------------------------------
          name: 'getPositionListDirect',
          service : 'getPositionList',
          method:'GET', 
          cache:false,
          error:{
              NG:{
                  code:'CFDS0801T',
                  retry:false,
                  continue:true
              },
              WARN:{
                  code:'',
                  retry:false,
                  continue:true
              },
              NETWORK:{
                  code:'CFDS0802C',
                  retry:true,
                  continue:true
              }                
          }
      },        
        getOrderList:{              // 注文一覧取得 --------------------------------------
            name: 'getOrderList',
            service : 'getOrderList',
            method:'GET', 
            cache:true,
            error:{
                NG:{
                    code:'CFDS0901T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS0902C',
                    retry:true,
                    continue:true
                }
            }
        },
        getOrderListDirect:{              // サーバーから注文一覧取得 --------------------------------------
          name: 'getOrderListDirect',
          service : 'getOrderList',
          method:'GET', 
          cache:true,
          error:{
              NG:{
                  code:'CFDS0901T',
                  retry:false,
                  continue:true
              },
              WARN:{
                  code:'',
                  retry:false,
                  continue:true
              },
              NETWORK:{
                  code:'CFDS0902C',
                  retry:true,
                  continue:true
              }
          }
      },      
        getExecutionList:{          // 約定一覧取得 --------------------------------------
            name: 'getExecutionList',
            service : 'getExecutionList',
            method:'GET', 
            cache:true,
            error:{
                NG:{
                    code:'CFDS1001T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:true,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS1002C',
                    retry:true,
                    continue:true
                }                
            }
        },
        getExecutionListDirect:{          // サーバーから約定一覧取得 --------------------------------------
          name: 'getExecutionListDirect',
          service : 'getExecutionList',
          method:'GET', 
          cache:true,
          error:{
              NG:{
                  code:'CFDS1001T',
                  retry:false,
                  continue:true
              },
              WARN:{
                  code:'',
                  retry:true,
                  continue:true
              },
              NETWORK:{
                  code:'CFDS1002C',
                  retry:true,
                  continue:true
              }                
          }
      },        
        marketSummary:{             // マーケットサマリー --------------------------------------
            name: 'marketSummary',
            service : 'marketSummary',
            method:'GET',
            error:{
                NG:{
                    code:'CFDS1801T',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS1802C',
                    retry:true,
                    continue:true
                }                
            }
        },
        getMarketCalendarInfo:{     // 経済カレンダー取得 --------------------------------------
            name: 'getMarketCalendarInfo',
            service : 'getMarketCalendarInfo',
            method:'GET', 
            cache:true,
            error:{
                NG:{
                    code:'CFDS1901T',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS1902C',
                    retry:true,
                    continue:true
                }                
            }
        },
        getMarketCalendarInfoDirect:{     // サーバーから経済カレンダー取得 --------------------------------------
          name: 'getMarketCalendarInfoDirect',
          service : 'getMarketCalendarInfo',
          method:'GET', 
          cache:false,
          error:{
              NG:{
                  code:'CFDS1901T',
                  retry:false,
                  continue:true
              },
              NETWORK:{
                  code:'CFDS1902C',
                  retry:true,
                  continue:true
              }                
          }
      },        
        getNewsList:{               // ニュース一覧取得 ---------------------------------------
            name: 'getNewsList',
            service : 'getNewsList',
            method:'GET', 
            cache:true,
            error:{
                NG:{
                    code:'CFDS2001T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS2002C',
                    retry:true,
                    continue:true
                }                
            }
        },
        getNewsListDirect:{               //サーバーから ニュース一覧取得 ---------------------------------------
          name: 'getNewsListDirect',
          service : 'getNewsList',
          method:'GET', 
          cache:false,
          error:{
              NG:{
                  code:'CFDS2001T',
                  retry:false,
                  continue:true
              },
              WARN:{
                  code:'',
                  retry:false,
                  continue:true
              },
              NETWORK:{
                  code:'CFDS2002C',
                  retry:true,
                  continue:true
              }                
          }
      },        
        getWatchList:{              // ウォッチリスト取得 --------------------------------------
            name: 'getWatchList',
            service : 'watchList',
            method:'GET',
            error:{
                NG:{
                    code:'CFDS2101T',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS2102C',
                    retry:true,
                    continue:true
                }                
            }
        },
        putWatchList:{              // ウォッチリスト更新 -------------------------------------
            name: 'putWatchList',
            service : 'watchList',
            method:'PUT',
            error:{
                NG:{
                    code:'CFDS2401T',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS2402C',
                    retry:false,
                    continue:true
                }                
            }
        },
        addWatchList:{              // ウォッチリスト追加 -------------------------------------
            name: 'addWatchList',
            service : 'watchList',
            method:'POST',
            flexible:true,
            error:{
                NG:{
                    code:'CFDS2201T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS2202C',
                    retry:false,
                    continue:true
                }                
            }
        },
        delWatchList:{              // ウォッチリスト削除 -------------------------------------
            name: 'delWatchList',
            service : 'watchList',
            method:'DELETE',  
            flexible:true,
            error:{
                NG:{
                    code:'CFDS2301T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS2302C',
                    retry:false,
                    continue:true
                }                
            }
        },
        getInformationList:{        // お知らせ一覧取得 ---------------------------------------
            name: 'getInformationList',
            service : 'getInformationList',
            method:'GET',
            error:{
                NG:{
                    code:'CFDS2501T',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS2502C',
                    retry:true,
                    continue:true
                }                
            }
        },
        getInformationMessage:{     // お知らせ取得 ------------------------------------------
            name: 'getInformationMessage',
            service : 'getInformationMessage',
            method:'POST',
            error:{
                NG:{
                    code:'CFDS2601T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS2602C',
                    retry:true,
                    continue:true
                }                
            }
        },
        getCashTransferInfo:{       // 振替情報取得 ------------------------------------------
            name: 'getCashTransferInfo',
            service : 'getCashTransferInfo',
            method:'GET',
            error:{
                NG:{
                    code:'CFDS2701T',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS2702C',
                    retry:true,
                    continue:true
                }                
            }
        },
        getCashTransferHistory:{    // 振替履歴取得
            name: 'getCashTransferHistory',
            service : 'getCashTransferHistory',
            method:'GET'
        },
        cashTransfer:{              // 振替 -------------------------------------------------
            name: 'cashTransfer',
            service : 'cashTransfer',
            method:'POST',
            error:{
                NG:{
                    code:'CFDS2801T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS2802C',
                    retry:false,
                    continue:true
                }                
            }
        },
        orderProductList:{          // 注文銘柄一覧取得 --------------------------------------
            name: 'orderProductList',
            service : 'orderProductList',
            method:'GET',
            cache:true,
            error:{
                NG:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'',
                    retry:true,
                    continue:true
                }                
            }            
        },
        orderDetail:{               // 注文詳細取得 ------------------------------------------
            name: 'orderDetail',
            service : 'orderDetail',
            method:'GET' ,  
            flexible:true,
            error:{
                NG:{
                    code:'CFDS1501T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS1502C',
                    retry:true,
                    continue:true
                }                
            }
        },
        getExecutionProductList:{   // 約定銘柄一覧取得 --------------------------------------
            name: 'getExecutionProductList',
            service : 'getExecutionProductList',
            method:'GET',
            cache:true,
            error:{
                NG:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'',
                    retry:true,
                    continue:true
                }
            }
        },
        setSettings:{               // ツール設定登録 ----------------------------------------
            name: 'setSettings',
            service : 'settings/general',
            method:'PUT',
            error:{
                NG:{
                    code:'CFDS3201T',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS3202C',
                    retry:false,
                    continue:true
                }
            }
        },
        getSettings:{               // ツール設定取得
            name: 'getSettings',
            service : 'settings/general',
            method:'GET',
            cache:true
        },
        setLayout:{                 // ツール設定登録(レイアウト) -----------------------------
            name: 'setLayout',
            service : 'settings/layout',
            method:'PUT',
            error:{
                NG:{
                    code:'CFDS3201T',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS3202C',
                    retry:false,
                    continue:true
                }
            }
        },
        getLayout:{                 // ツール設定取得(レイアウト)
            name: 'getLayout',
            service : 'settings/layout',
            method:'GET',
            cache:true          
        },
        setAlert:{                  // ツール設定設定(アラート) ------------------------------
            name: 'setAlert',
            service : 'settings/alert',
            method:'PUT',
            error:{
                NG:{
                    code:'CFDS3201T',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS3202C',
                    retry:false,
                    continue:true
                }
            }
        },
        getAlert:{                   // ツール設定取得(アラート)取得
            name: 'getAlert',
            service : 'settings/alert',
            method:'GET',
            flexible:true,
            cache:true
        },
        getAllSetting:{              // ツール設定API全体取得
            name: 'getAllSetting',
            service : 'settings',
            method:'GET',
            cache:true,
            error:{
                NG:{
                    code:'CFDS0201T',
                    retry:false,
                    continue:false,
                    handler:function(parent, callback){
                        var text = `${Messages.ERR_0001}[${this.code}]`; 
                        MessageBox.show(Messages.STR_0001, text, parent, true, callback);
                    }
                },
                NETWORK:{
                    code:'CFDS0202C',
                    retry:true,
                    continue:false,
                    handler:function(parent, callback){
                        var text = `${Messages.ERR_0001}[${this.code}]`; 
                        MessageBox.show(Messages.STR_0001, text, parent, true, callback);
                    }
                }
            }
        },
        getLosscutRateInfo:{        // ロスカットレート情報取得 --------------------------------
            name: 'getLosscutRateInfo',
            service : 'getLosscutRateInfo',
            method:'POST',
            error:{
                NG:{
                    code:'CFDS2901T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS2902C',
                    retry:false,
                    continue:true
                }                
            }
        },
        calcLosscutRate:{           // ロスカットレート計算 ------------------------------------
            name: 'calcLosscutRate',
            service : 'calcLosscutRate',
            method:'POST',
            error:{
                NG:{
                    code:'CFDS3001T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS3002C',
                    retry:false,
                    continue:true
                }                
            }
        },
        changeLosscutRate:{         // ロスカットレート変更 ------------------------------------
            name: 'changeLosscutRate',
            service : 'changeLosscutRate',
            method:'POST',
            error:{
                NG:{
                    code:'CFDS3101T',
                    retry:false,
                    continue:true
                },
                WARN:{
                    code:'',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS3102C',
                    retry:false,
                    continue:true
                }
            }
        },
        logout:{                    // ログアウト
            name: 'logout',
            service : 'logout',
            method:'GET',
            error:{
              NG:{
                  code:'',
                  retry:false,
                  continue:true
              },
              WARN:{
                  code:'',
                  retry:false,
                  continue:true
              },
              NETWORK:{
                  code:'',
                  retry:false,
                  continue:true
              }
          }            
        },
        ohlc:{                      // 4本値チャートデータ取得 ----------------------------
            name: 'ohlc',
            service : 'ohlc',
            method:'GET',
            flexible:true, 
            include:'ohlcTypeCode;cfdProductCode',
            error:{
                NETWORK:{
                    code:'CFDS0302C',
                    retry:true,
                    continue:true
                }                
            }
        },
        chartTick:{                 // ティックチャートデータ取得 --------------------------
            name: 'chartTick',
            service : 'tick',
            method:'GET',
            flexible:true, 
            include:'cfdProductCode',
            error:{
                NETWORK:{
                    code:'CFDS0402C',
                    retry:true,
                    continue:true
                }                
            }
        },
        corporateInfo:{             // 企業情報取得 --------------------------------------
            name: 'corporateInfo',
            service : 'corporateInfo',
            method:'GET',
            flexible:true,
            error:{
                NG:{
                    code:'CFDS1601T',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS1602C',
                    retry:true,
                    continue:true
                }                
            }
        },
        fundInfo:{                  // ファンド情報取得 -----------------------------------
            name: 'fundInfo',
            service : 'fundInfo',
            method:'GET',
            flexible:true,
            error:{
                NG:{
                    code:'CFDS1701T',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS1702C',
                    retry:true,
                    continue:true
                }                
            }
        },
        search:{                    // ニュース関連銘柄検索 ----------------------------------------
            name: 'search',
            service : 'search',
            method:'GET',
            flexible:true,
            error:{
                NG:{
                    code:'CFDS4201T',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS4202C',
                    retry:true,
                    continue:true
                }
            }
        },
        feedback:{                  // ニュース関連銘柄送信 ----------------------------------------
            name: 'feedback',
            service : 'feedback',
            method:'POST',
            error:{
                NG:{
                    code:'CFDS4301T',
                    retry:false,
                    continue:true
                },
                NETWORK:{
                    code:'CFDS4302C',
                    retry:false,
                    continue:true
                }
            }
        },
        getClientConfig:{           // client-config.json ---------------------------------------
            name: 'getClientConfig',
            service : '',
            method:'GET',
            error:{
                NG:{
                    code:'CFDS9902C',
                    retry:false,
                    continue:false,
                    handler:function(parent, callback){
                        var text = `${Messages.ERR_0001}[${this.code}]`; 
                        MessageBox.show(Messages.STR_0003, text, parent, true, callback);
                    }
                },
                WARN:{
                    code:'CFDS9903C',
                    retry:false,
                    continue:false,
                    handler:function(parent, callback){
                        var text = `${Messages.ERR_0001}[${this.code}]`; 
                        MessageBox.show(Messages.STR_0003, text, parent, true, callback);
                    }
                },
                NETWORK:{
                    code:'CFDS9901C',
                    retry:false,
                    continue:false,
                    handler:function(parent, callback){
                        var text = `${Messages.ERR_0002}[${this.code}]`; 
                        MessageBox.show(Messages.STR_0003, text, parent, true, callback);
                    }
                }
            }
        },
        getNoticeList:{
            name: 'getNoticeList',
            service : '',
            method:'',
            cache:true
        }
    }
}