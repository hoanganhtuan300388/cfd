/**
 * 
 * Business Helper
 * 
 */
import * as electron from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as url  from 'url';
import {WindowHelper} from './windowHelper';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import {CacheHelper, CACHE} from './cacheHelper';
import {SocketHelper} from './socketHelper';
import {HttpHelper} from './httpHelper';
import {SymbolHelper} from './symbolHelper';
import {RetryContext} from '../util/retryContext';

import {appModule} from '../main';
import {Messages} from '../../common/message';
import {BusinessApi, ERROR_CODE} from '../../common/businessApi';
import {IRequestApi, IResponseApi, IBusinessApi} from '../../common/interface';
import {CommonConfig} from '../../common/commonConfig';
import {Logger} from '../util/logger';
import * as commonApp from '../../common/commonApp';
import { setInterval } from 'timers';

var querystring = require('querystring');

const TimerClientConfig =  5 * 60 * 1000; // 5分
const TimerPowerAmount  =  1 * 60 * 1000; // 1分

// socket list
enum WS{
  price = 0,
  news,
  calendar,
  conversionRate,
  event,
  eod,
}

var socketInfo = [
  {
    id:WS.price,
    path:BusinessApi.stream.price.url
  },
  {
    id:WS.news,
    path:BusinessApi.stream.news.url
  },
  {
    id:WS.calendar,
    path:BusinessApi.stream.calendar.url
  },
  {
    id:WS.conversionRate,
    path:BusinessApi.stream.conversionRate.url
  },
  {
    id:WS.event,
    path:BusinessApi.stream.event.url
  },
  {
    id:WS.eod,
    path:BusinessApi.stream.eod.url
  }
]

//-----------------------------------------------------------------------------
// SERVICE : BusinessHelper
// ----------------------------------------------------------------------------
export class BusinessHelper{
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------  
  // static instance;
  private jsessionid;
  public  readyStatus = true;

  private sockets = [];
  private symbols:SymbolHelper = new SymbolHelper();
  public cache:CacheHelper = new CacheHelper();

  // polling timmer
  private timerClientCfg;
  private timerAmount;

  private _isDemo = false;
  
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------	
  constructor( ){
    this._isDemo = (process.env.NODE_ENV.indexOf("demo") >= 0);

    // create sockets
    socketInfo.forEach(element => {
      this.sockets[element.id] = new SocketHelper(element.id);
    });
  }

 	//---------------------------------------------------------------------------
  // member
  //--------------------------------------------------------------------------- 
  /**
   * init
   * 
   */
  public init(){
    this.cache.init(this);
    
    // reset listener
    electron.ipcMain.removeAllListeners(commonApp.IPC_BUSINESS_QUERY);

    // listen business-api message
    electron.ipcMain.on(commonApp.IPC_BUSINESS_QUERY, (event, arg) => {
      this.onQueryData( event.sender, arg );
    })

    // query client-config.json
    electron.ipcMain.on(commonApp.IPC_RESOURCE_QUERY_CLIENTCFG, (event, arg) => {
      var cache = this.cache.cacheDataById(CACHE.clientConfig);
      event.returnValue = cache === undefined?null:cache;
    })
  }

  public getClientConfig(){  
    var subject = new Subject<any>();

    this.cache.getClientConfig(false).subscribe(
      val=>{
        if(val.serviceStatus == "0"){
          Logger.system.info(`server status 0`);
          let opt = {buttons:[Messages.STR_0017, "OK"], defaultId:1};

          // demoの場合、表示しない。
          if(this._isDemo == true){
            opt = null;
          }          

          this.clear();
          this.MessageBox(Messages.STR_0003, Messages.ERR_0021, opt, (response, checkboxChecked)=>{
            // goto URL. demoの場合、表示しない。
            if( !this._isDemo && response === 0 && val.sysstatURL ){
              electron.shell.openExternal(val.sysstatURL);
            }            
            
            subject.error(null);
          });
        }else{
          subject.next();
        }
      },
      err=>{
        subject.error(err);
      }
    );

    return subject;
  }

  /**
   * 
   */
  public clear(){
    this.readyStatus = false;

    this.cache.clear();

    if(this.timerAmount){
      clearInterval(this.timerAmount);
    }

    if(this.timerClientCfg){
      clearInterval(this.timerClientCfg);
    }

    this.closeSocket();
  }

  // covert query string
  private getQueryString(input:any){
    var query='';

    if(typeof input == 'object'){
      query = querystring.stringify(input);
    }

    if( query.length ){
      query = '?' + query;
    }

    return query;
  }

  private wsUrl(path:string){
    return `${CommonConfig.service.streamUrl}/${path}`;
  }

  /**
   * make url for GET method
   * 
   * @param url 
   * @param input 
   */
  private getUrl(service:string, input:any, flexible=false, include:string=null){
    var path = `${CommonConfig.service.webApiUrl}/${service}`;
    var session = `;jsessionid=${this.jsessionid}`;
    var query = '';

    // only use chart api.
    if(service=='ohlc' || service == 'tick'){ // #2090
      path = `${CommonConfig.service.chartApiUrl}/${service}`;
      session = '';
    }
    // only use news api
    else if(service=='search' || service=='feedback'){
      path = `${CommonConfig.service.newsApiUrl}/${service}`;
      session = '';
    }

    if( input) {
      if( flexible ){
        // urlを動的に作る
        if(include){
          let inc = include.split(';');
          if(inc){
            inc.forEach(el=>{
              path += '/' + input[el];    
            })

            // query string
            let lst = Object.keys(input).filter((el)=>inc.find(ie=>el==ie)==null);
            if(lst){
              let qry = {};
              lst.forEach(el=>{qry[el]=input[el];});
              query = this.getQueryString(qry);
            }
          }
        }else{
          path += '/' + input[Object.keys(input)[0]];
        }
      }else{
        // query string
        query = this.getQueryString(input);
      }
    }

    path += session + query;

    return path;
  }

  /**
   * request data
   * 
   * @param service 
   * @param input 
   */
  public queryData(api:IBusinessApi, input:{}):Observable<any>{
    var subject = new Subject<any>();
 
    this.queryDataEx(api, input, subject, null);

    return subject;
  }

  /**
   * queryDataEx
   * 
   * @param api 
   * @param input 
   * @param subject 
   */
  private queryDataEx(api:IBusinessApi, input:{}, subject:Subject<any>, context:RetryContext){
    var promise;
    var retry='';

    if(this.readyStatus == false){
      setTimeout(()=> {
        subject.next({status:ERROR_CODE.BLOCKED, message:'readyStatus false', statusCode:9999});
      }, 100);
      return
    }

    if(context){
      retry = `retry-count:${context.tryCount()}`;
    }

    // send query
    if( api.method == 'GET' ){
      promise = this.queryGet( api, input );
    }else{
      promise = this.queryPost( api, input );
    }

    // receive result
    promise.subscribe(
      val=>{
        subject.next(val);
      },
      err=>{
        // retry
        if(err.error == ERROR_CODE.NETWORK ){
          if(api.error.NETWORK.retry){
            if(!context){
              context = new RetryContext();
            }

            if(context.isRetryOver()){
              // retry count over
              subject.next({status:err.error, message:'network error.', statusCode:err.statusCode});
            }else{
              // retry query.
              var timeout = context.getNextTimeout();
              setTimeout(()=> {
                this.queryDataEx(api, input, subject, context);
              }, timeout);
            }
          }else{
            // send network error
            subject.next({status:err.error, message:'network error.', statusCode:err.statusCode});
          }
        }else if(err.error == ERROR_CODE.HTTP){
          Logger.system.warn(`HTTP status ${err.statusCode} error. API service[${api.service}]`);

          subject.next({status:err.error, message:err.statusMessage, statusCode:err.statusCode});

          // jsessionIdの期限切れor不正 #3444, APサーバ切断時の挙動#3498 405, 502追加
          if(err.statusCode == 401 || err.statusCode == 302 || err.statusCode == 405 || err.statusCode == 502){
            this.errorHandle401('CFDS0001T');
          }
        }else{
          subject.next({status:ERROR_CODE.UNKNOWN, message:'unknown error', statusCode:null});
        }
      },
      ()=>{
        subject.complete();
      }
    );
  }

  /**
   * GET データ送信
   * 
   * @param service 
   * @param input 
   * @param flexible 
   * @param subject 
   */
  public queryGet( api:IBusinessApi, input:{} ){
    var req = new HttpHelper();
    var url = this.getUrl(api.service, input, api.flexible, api.include);
    
    return req.get(url);
  }

  /**
   * POST データ送信
   * 
   * @param service 
   * @param input 
   * @param flexible 
   * @param subject 
   */
  public queryPost( api:IBusinessApi, input:{} ){
    var req = new HttpHelper();
    var url = this.getUrl(api.service, api.flexible?input:null, api.flexible, api.include);

    return req.post(url, input, api.method);
  }
  
  // received request
  protected onQueryData( sender:any, data:IRequestApi ){
    var api = BusinessApi.API[data.api];

    if( api.cache ){
      Logger.system.debug(`[CACHE] get data : ${api.name}`);

      // reply result from cache data
      this.cacheData(data.api, data.input).subscribe(val=>{
        var result:IResponseApi = {sequence: data.sequence, output: val};
        try{
          sender.send( commonApp.IPC_BUSINESS_REPLY, result );
        }catch(e){
          Logger.system.error(`[CACHE] cache data send error`);
        }
      });
    }else{
      // request http server
      this.queryData(api, data.input).subscribe(
        val=>{
          // reply result
          var result:IResponseApi = {sequence:data.sequence, output:val};
          try{
            sender.send( commonApp.IPC_BUSINESS_REPLY, result );
          }catch(e){
            Logger.system.error(`query data send error`);
          }

          // update cache
          if(val.status == ERROR_CODE.OK){
            this.cache.update( api, data.input, val );
          }
        }
      );
    }
  }

  /**
   * get cache data
   * 
   * @param key 
   */
  public cacheData(key:string, req:any):Subject<any>{
    var subject = new Subject<any>();

    if(key == 'getExecutionList' || key == 'getExecutionListDirect') {
      this.cache.executionDateType = req.executionDateType;
    }
    this.cache.cacheData(key).subscribe(val=>{
      let result = this.cache.postResponse(key, req, val);

      subject.next(result);
    });

    return subject;
  }

  /**
   * websocket connect
   */
  public connect(id){
    var subject = new Subject<any>();
    this.jsessionid = id;
    this.readyStatus = true;
    
    // load キャッシュ
    this.cache.loadData().subscribe(
      val=>{
        subject.next();
      },
      err=>{
        this.clear();
        appModule.login.sendMessage({state:'ERROR', message: `${Messages.ERR_0001}`});
        subject.error(err);
      },
      ()=>{
        // start polling.
        this.pollingClientConfig();
        this.pollingPowerAmount();
                
        subject.complete();
      }
    )

    // connect sockets
    socketInfo.forEach( ele=>{
      this.connectServer(ele);
    });

    return subject;
  }

  /**
   * try connect websocket server
   * 
   * @param ele 
   */
  private connectServer(ele:any){
    this.sockets[ele.id].connect(CommonConfig.service.streamUrl, ele.path, this.jsessionid );

    // retry failed
    this.sockets[ele.id].on('retry-fail',(err)=>{
      this.errorHandleSocket(err.errorCode);
    });
    
    // retry start
    this.sockets[ele.id].on('retry-start',()=>{
      Logger.system.debug( `[SOCKET] retry-start. id[${ele.id}] path[${ele.path}]`);
      this.noticeSocketRetry(ele);
    });

    // try connect
    this.sockets[ele.id].on('connect',(retry)=>{
      Logger.system.debug( `[SOCKET] connected id[${ele.id}], retried:${retry}`);
      if(retry){
        this.reconnectedSocket(ele);
        this.noticeSocketRetry(ele);
        Logger.system.debug( `[SOCKET] retry-ok. id[${ele.id}] path[${ele.path}]`);
      }
    });

    // received message
    switch(ele.id){
      case WS.price:{
        this.symbols.init(this.sockets[WS.price]);
      }
      break;

      case WS.news:{
        this.sockets[WS.news].on('message', (data)=>{
          var list = this.cache.convertNewsEvent( JSON.parse(data) );
          this.cache.updateNews(list);
          electron.webContents.getAllWebContents().forEach((web)=>{
            web.send(commonApp.IPC_NOTIFICATION_REPLY_NEWS, {type:'new', newsList:list});
          })
        });
      }
      break;

      case WS.calendar:{
        this.sockets[WS.calendar].on('message', (data)=>{
          var list = this.cache.convertCalendarEvent( JSON.parse(data) );
          let add = [], update = [];

          this.cache.updateCalendar(list, add, update);

          // new calender
          if(add.length){
            electron.webContents.getAllWebContents().forEach((web)=>{
              web.send(commonApp.IPC_NOTIFICATION_REPLY_CALENDAR, {type:'new', calendars:add});
            })
          }
          // update calender
          if(update.length){
            electron.webContents.getAllWebContents().forEach((web)=>{
              web.send(commonApp.IPC_NOTIFICATION_REPLY_CALENDAR, {type:'update', calendars:update});
            })
          }
        })
      }
      break;

      case WS.conversionRate:{
        this.sockets[WS.conversionRate].on('message', (data)=>{
          var jsn = JSON.parse(data);
          this.cache.updateConversionRate(jsn);
          electron.webContents.getAllWebContents().forEach((web)=>{
            web.send(commonApp.IPC_NOTIFICATION_REPLY_CONVERSION_RATE, jsn);
          })
        })
      }
      break;

      case WS.event:{
        this.sockets[WS.event].on('message', (data)=>{
          var jsn = JSON.parse(data);
          this.cache.updateEvent(jsn);
          
          electron.webContents.getAllWebContents().forEach((web)=>{
            web.send(commonApp.IPC_NOTIFICATION_REPLY_EVENT, jsn);
          })
        })  
      }
      break;

      case WS.eod:{
        this.sockets[WS.eod].on('message', (data)=>{
          var jsn = JSON.parse(data);
          this.cache.updateEOD(jsn).subscribe(val=>{
            electron.webContents.getAllWebContents().forEach((web)=>{
              web.send(commonApp.IPC_NOTIFICATION_REPLY_EOD, JSON.parse(data));
            })  
          })
        })  
      }
      break;
    }
  }

  /**
   * start retry socket connection
   */
  private noticeSocketRetry(ele){
    switch(ele.id){
      case WS.event:
      case WS.price:
      {
        let temp = [];

        temp.push({socket_id:WS.event, isConnected:this.sockets[WS.event].isConnected()});
        temp.push({socket_id:WS.price, isConnected:this.sockets[WS.price].isConnected()});

        electron.webContents.getAllWebContents().forEach((web)=>{
          web.send(commonApp.IPC_CONNECTION_RETRY, {sockets: temp});
        })
      }
      break;
    }
  }

  /**
   * reconnected Socket handler
   * 
   * @param ele 
   */
  private reconnectedSocket(ele){
    switch(ele.id){
      case WS.news:{
        this.cache.resetNews().subscribe(val=>{
          electron.webContents.getAllWebContents().forEach((web)=>{
            web.send(commonApp.IPC_NOTIFICATION_REPLY_NEWS, {type:'reload', newsList:val});
          })
        });
      }
      break;
      case WS.calendar:{
        this.cache.resetCalendar().subscribe(val=>{
          electron.webContents.getAllWebContents().forEach((web)=>{
            web.send(commonApp.IPC_NOTIFICATION_REPLY_CALENDAR, {type:'reload', calendars:val});
          })
        })
      }
      break;
      case WS.conversionRate:{
        this.cache.resetConversionRate().subscribe(val=>{
          electron.webContents.getAllWebContents().forEach((web)=>{
            web.send(commonApp.IPC_NOTIFICATION_REPLY_CONVERSION_RATE, ['conversion-rate',{conversionRateList:val}]);
          })
        })
      }
      break;
      case WS.event:{
        // clear cache
        this.cache.resetEvents();

        // send reload data.
        electron.webContents.getAllWebContents().forEach((web)=>{
          web.send(commonApp.IPC_NOTIFICATION_RELOAD, {cause:commonApp.RELOAD_BY_EVENT});
        });
      }
      break;
      case WS.eod:{
        this.cache.resetEOD().subscribe(val=>{
          // send reload data.
          electron.webContents.getAllWebContents().forEach((web)=>{
            web.send(commonApp.IPC_NOTIFICATION_RELOAD, {cause:commonApp.RELOAD_BY_EOD});
          });
        });
      }
      break;
      case WS.price:{
        // send reload data.
        electron.webContents.getAllWebContents().forEach((web)=>{
          web.send(commonApp.IPC_NOTIFICATION_RELOAD, {cause:commonApp.RELOAD_BY_PRICE});
        });
      }
      break;
      
    }
  }

  /**
   * socket retry failed
   * 
   * @param ele 
   * @param err 
   */
  private errorHandleSocket(code){
    // jsessionIdの期限切れor不正
    if(code == 401){
      this.errorHandle401('CFDS0101Y');        
      return;
    }

    // show message box
    if(this.readyStatus == true){
      if(code){
        var msg = `${Messages.ERR_0002}[${code}]`;
        
        this.readyStatus = false;        
        this.MessageBox(Messages.STR_0002, msg, null,(response, checkboxChecked)=>{
        if(!appModule.login.modal){
            // ログイン画面に戻る。
            appModule.restart();
          }
        });
      }
    }
  }

  /**
   * jsessionIdの期限切れor不正
   */
  private errorHandle401(code:string){
    var msg = `${Messages.ERR_0013}[${code}]`;

    if(this.readyStatus == true){
      this.readyStatus = false;

      if(appModule.login.modal){
        // ログイン画面活性化。
        this.clear();
        appModule.login.sendMessage({state:'ERROR', message: msg});
      }else{
        // ログイン画面に戻る。
        this.MessageBox(Messages.STR_0002, msg, null, (response, checkboxChecked)=>{
          appModule.restart();
        });
      }
    }
  }

  /**
   * show message-box
   * 
   * @param title 
   * @param text 
   * @param parent 
   * @param callback 
   */
  public MessageBox(title:string, text:string, buttonOption:{buttons:string[], defaultId:number}, callback:Function){
    var login  = appModule.login.modal;
    var parent = login?login:appModule.mainWindow?appModule.mainWindow:null;
    var option = {type:'warning', title:title, message:text, noLink:true, buttons:undefined};

    if(buttonOption){
      option.buttons = buttonOption.buttons;
      option["defaultId"] = buttonOption.defaultId;
    }

    if(electron){
      electron.dialog.showMessageBox(parent, option, (response, checkboxChecked)=>{
        callback(response, checkboxChecked);
      });
    }
  }

  /**
   * 外だし画面は先にクローズする。 #3340 
   */
  private closeExternalPanel(){
    // close all window
    let wins = WindowHelper.getInstance().getWindows();
    let cpy = wins.map(w=>w);

    cpy.forEach(win=>{
      if(win.panelId != null ){
        win.browserWindow.destroy();
      }
    });    
  }

  /**
   * client-config.json polling.
   */
  private pollingClientConfig(){
    this.timerClientCfg = setInterval(()=>{
      if(this.readyStatus == false){
        return;
      }
      
      this.cache.getClientConfig(true).subscribe(
        val=>{
          // server status is '0'
          if(val.serviceStatus == "0"){
            let opt = {buttons:[Messages.STR_0017, "OK"], defaultId:1};

            // demoの場合、表示しない。
            if(this._isDemo == true){
              opt = null;
            }

            Logger.system.info(`server status 0`);
            this.clear();

            // #3340 外だし画面は先にクローズする。
            this.closeExternalPanel();

            // [緊急停止]メッセージ
            this.MessageBox(Messages.STR_0003, Messages.ERR_0021, opt, (response, checkboxChecked)=>{
              // goto URL. demoの場合、表示しない。
              if( !this._isDemo && response === 0 && val.sysstatURL ){
                electron.shell.openExternal(val.sysstatURL);
              }

              // quit App
              setTimeout(()=>{
                // close all window
                let wins = WindowHelper.getInstance().getWindows();
                let cpy = wins.map(w=>w);

                cpy.forEach(win=>{
                  win.browserWindow.destroy();
                });

                electron.app.quit();
              }, 100);
            });
          }
        },
        err=>{}
      )
    }, TimerClientConfig );
  }

  /**
   * 余力情報 polling.
   */
  private pollingPowerAmount(){
    this.timerAmount = setInterval(()=>{
      if(this.readyStatus == false){
        return;
      }
      this.cache.getPowerAmount();
    }, TimerPowerAmount );
  }

  /**
   * 
   */
  private closeSocket(){
    // create sockets
    this.sockets.forEach(socket => {
      if(socket){
        socket.close();
      }
    });
    Logger.system.debug('[SOCKET] close all sockets.');
  }

}