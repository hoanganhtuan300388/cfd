/**
 *      リアル : 本番
 */
var url_prod_real = {
  loginUrl:     "https://sec-sso.click-sec.com/loginweb/tool-redirect",
  webApiUrl:    "https://kabu.click-sec.com/cfd/rcl",
  chartApiUrl:  "https://cfd-stream.click-sec.com/price",
  vUpdateUrl:   "https://static.click-sec.com/cfd/vc/updates/latest",                              
  streamUrl:    "wss://cfd-stream.click-sec.com",
  newsApiUrl:   "https://api-kgb.click-sec.com/gbr",
  clientCfgUrl: "https://static.click-sec.com/tool/Hatchu-kun_CFD/real/client-config.json"
};

/**
 *      リアル : 検証
 */
var url_prod_stg = {
  loginUrl:     "https://stg-sec-sso.click-sec.com/loginweb/tool-redirect",             // login 
  webApiUrl:    "https://stg-kabu.click-sec.com/cfd/rcl",                               // http query 
  chartApiUrl:  "https://stg-cfd-stream.click-sec.com/price",                           // http query for chart
  vUpdateUrl:   "https://stg-static.click-sec.com/cfd/vc/updates/latest",               // auto version updater
  streamUrl:    "wss://stg-cfd-stream.click-sec.com",                                   // websocket url
  newsApiUrl:   "https://api-kgb.click-sec.com/gbr-stg",                                // news url
  clientCfgUrl: "https://stg-static.click-sec.com/tool/Hatchu-kun_CFD/real/client-config.json",
};

/**
 *      デモ : 本番
 */
var url_demo_real = {
  loginUrl:     "https://demo.click-sec.com/cfd-demo/rc/sso-redirect",                  // login 
  webApiUrl:    "https://demo.click-sec.com/cfd-demo/rcl",                                   // http query 
  chartApiUrl:  "https://demo-cfd-stream.click-sec.com/price",                          // http query for chart
  vUpdateUrl:   "https://static.click-sec.com/cfd/vc/updates/latest",               // auto version updater
  streamUrl:    "wss://demo-cfd-stream.click-sec.com",                                  // websocket url
  newsApiUrl:   "",                                                                     // news url
  clientCfgUrl: "https://static.click-sec.com/tool/Hatchu-kun_CFD/demo/client-config.json",
};

/**
 *      デモ : 検証
 */
var url_demo_stg = {
  loginUrl:     "https://stg-demo.click-sec.com/cfd-demo/rc/sso-redirect",              // login 
  webApiUrl:    "https://stg-demo.click-sec.com/cfd-demo/rcl",                          // http query 
  chartApiUrl:  "https://stg-demo-cfd-stream.click-sec.com/price",                      // http query for chart
  vUpdateUrl:   "https://stg-static.click-sec.com/cfd/vc/updates/latest",               // auto version updater
  streamUrl:    "wss://stg-demo-cfd-stream.click-sec.com",                              // websocket url
  newsApiUrl:   "",                                                                     // news url
  clientCfgUrl: "https://stg-static.click-sec.com/tool/Hatchu-kun_CFD/demo/client-config.json"
};

/**
 *      開発用
 */
var url_dev = {
  loginUrl:     "https://stg-sec-sso.click-sec.com/loginweb/tool-redirect",             // login 
  webApiUrl:    "https://stg-kabu.click-sec.com/cfd/rcl",                               // http query 
  chartApiUrl:  "https://stg-cfd-stream.click-sec.com/price",                           // http query for chart
  vUpdateUrl:   "http://192.168.1.135:3000/updates/latest",                             // auto version updater
  streamUrl:    "wss://stg-cfd-stream.click-sec.com",                                   // websocket url
  newsApiUrl:   "https://api-kgb.click-sec.com/gbr-stg",                                // news url
  clientCfgUrl: "https://stg-static.click-sec.com/tool/Hatchu-kun_CFD/real/client-config.json",
};

interface IServiceURL{
  loginUrl: string,           // login 
  webApiUrl: string,          // http query 
  chartApiUrl:string,         // http query for chart
  vUpdateUrl: string,         // auto version updater
  streamUrl: string,          // websocket url
  newsApiUrl: string,         // news url
  clientCfgUrl: string,       // client-config.json
}

function getServiceURL():IServiceURL{
  console.log('getServiceURL ',process.env.NODE_ENV );
  if(process.env.NODE_ENV == "dev" ){                // 開発用
    return url_dev;
  }else if(process.env.NODE_ENV == "demo:real" ){    // デモ：本番用
    return url_demo_real;
  }else if(process.env.NODE_ENV == "demo:stg"  ){    // デモ：検証用
    return url_demo_stg;
  }else if(process.env.NODE_ENV == "prod:real" ){    // リアル：本番用
    return url_prod_real;
  }else if(process.env.NODE_ENV == "prod:stg"  ){    // リアル：検証用
    return url_prod_stg;
  }
}

export const CommonConfig = {
  appIcon: {
    ico:"app/assets/icon/win_desktop.ico"         // for win native notification & taskbar icon
  },
  service: (():IServiceURL=>{
    return getServiceURL();
  })(),
}