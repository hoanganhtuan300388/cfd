/**
 * 
 * CacheHelper
 * 
 */
import * as electron from 'electron';
import * as moment  from 'moment';
import * as fs from 'fs';
import * as path from 'path';

import {BusinessHelper} from './businessHelper';
import { Observable } from 'rxjs/Observable';
import "rxjs/add/observable/zip";
import { Subject } from 'rxjs/Subject';
import {appModule} from '../main';
import {HttpHelper} from './httpHelper';
import {BusinessApi, ERROR_CODE} from '../../common/businessApi';
import {IRequestApi, IResponseApi, IBusinessApi, IResClientConfig, IReqListItem } from '../../common/interface';

import {NewsList, MarketCalendarList, IConversionRate, IEventNotice, 
        IResStreamConversionRate, IStreamConversionRate,
        IReqExecutionList, IResExecutionList, IResExecutionItem} from '../../www/app/values/values';
import {OrderListUpdater} from './orderListUpdater';
import {PositionListUpdater} from './positionListUpdater';
import {ExecutionListUpdater} from './executionListUpdater';
import {FileUtil} from '../util/fileUtil';
import {Logger} from '../util/logger';

import {NoticeType} from '../../common/commonApp';
import {CommonConfig} from '../../common/commonConfig';
import * as commonApp from '../../common/commonApp';
import { getDefaultSettings } from 'http2';

export enum CACHE{
  productList = 0,
  classifiedProducts,
  userInfo,
  conversionRateList,
  powerAmount,
  getPositionList,
  getOrderList,
  getExecutionList,
  getMarketCalendarInfo,
  getNewsList,  
  orderProductList,
  getExecutionProductList,
  getOrderListDirect,
  getExecutionListDirect,

  clientConfig,
  settings,
  settings_general,
  settings_alert,
  settings_layout,
  getNoticeList,

  length
}

const TOOLSET = {
  sound       : '003',
  chartColor  : '006',
  chartTech   : '007',
  alert       : '008'
};

const cacheList = {
  immediate:[
    {
      id:CACHE.productList,
      apiName:BusinessApi.API.getProductList.name,
    },
    {
      id:CACHE.classifiedProducts,
      apiName:BusinessApi.API.classifiedProducts.name,
    },
    {
      id:CACHE.userInfo,
      apiName:BusinessApi.API.userInfo.name,
    },
    {
      id:CACHE.conversionRateList,
      apiName:BusinessApi.API.getConversionRate.name,
    },
    {
      id:CACHE.powerAmount,
      apiName:BusinessApi.API.getPowerAmount.name,
    },
    {
      id:CACHE.settings,
      apiName:BusinessApi.API.getAllSetting.name,
      post:function(cache, api, data){
        return cache.handlerSettings(api, data);
      }
    }
  ],
  lazy:[
    {
      id:CACHE.getPositionList,
      apiName:BusinessApi.API.getPositionList.name,
      subject:null,
      load:function(cache, def){
        cache.getPositionList(this, def);
      }
    },
    {
      id:CACHE.getOrderList,
      apiName:BusinessApi.API.getOrderList.name,
      subject:null,
      load:function(cache, def){
        cache.getOrderList(this, def);
      }
    },
    {
      id:CACHE.getExecutionList,
      apiName:BusinessApi.API.getExecutionList.name,
      subject:null,
      load:function(cache, def){
        cache.getExecutionList(this, def);
      },
      filter:function(cache, req, data){
        return cache.filterExecutionList(req, data);
      },
      diff:function(cache, def){
        cache.getDiffExecutionList(this, def);
      }
    },
    {
      id:CACHE.getMarketCalendarInfo,
      apiName:BusinessApi.API.getMarketCalendarInfo.name,
      subject:null,
      load:function(cache, def){
        cache.getMarketCalendarInfo(this, def);
      }
    },
    {
      id:CACHE.getNewsList,
      apiName:BusinessApi.API.getNewsList.name,
      subject:null,
      load:function(cache, def){
        cache.getNewsList(this, def);
      }
    },
    {
      id:CACHE.orderProductList,
      apiName:BusinessApi.API.orderProductList.name,
      subject:null,
      load:function(cache, def){
        cache.orderProductList(this, def);
      }
    },
    {
      id:CACHE.getExecutionProductList,
      apiName:BusinessApi.API.getExecutionProductList.name,
      subject:null,
      load:function(cache, def){
        cache.getExecutionProductList(this, def);
      }
    },  
    {
      id:CACHE.getOrderListDirect,
      apiName:BusinessApi.API.getOrderList.name,
      subject:null,
      load:function(cache, def){
        cache.getOrderList(this, def);
      }
    },
    {
      id:CACHE.getExecutionListDirect,
      apiName:BusinessApi.API.getExecutionList.name,
      subject:null,
      load:function(cache, def){
        cache.getExecutionList(this, def);
      },
      filter:function(cache, req, data){
        return cache.filterExecutionList(req, data);
      }
    },    
    {
      id:CACHE.settings_general,
      apiName:BusinessApi.API.getSettings.name,
      subject:null,
      load:function(){},
    },
    {
      id:CACHE.settings_alert,
      apiName:BusinessApi.API.getAlert.name,
      subject:null,
      load:function(){},
    },
    {
      id:CACHE.settings_layout,
      apiName:BusinessApi.API.getLayout.name,
      subject:null,
      load:function(){},
    },    
  ],
  extend:[
    {
      id:CACHE.getNoticeList,
      apiName:BusinessApi.API.getNoticeList.name,
    }
  ]
};

//-----------------------------------------------------------------------------
// SERVICE : CacheHelper
// ----------------------------------------------------------------------------
export class CacheHelper{
  private _cacheData = [];
  private orderListItems = [];  // orderList request Item;
  private executionListItems = [];  // executionList request Item;
  public  prevExecutionDateType: string = ''; // 前回の照会タイプ
  public  executionDateType: string = '';

  private updaterOrderList = new OrderListUpdater();
  private updatePositionList = new PositionListUpdater();
  private updateExecuteList = new ExecutionListUpdater();

  // ツール設定情報
  // private settings;

  private business:BusinessHelper;

  // --------------------------------------------------------------------------
  //  constructor & property
  // --------------------------------------------------------------------------	
  constructor(){
  }

  public init(business:BusinessHelper){
    this.business = business;
  }

  public clear(){
    // clientConfigは維持する。
    let clientCfg = this._cacheData[CACHE.clientConfig];

    // cache clear
    this._cacheData = [];

    this._cacheData[CACHE.clientConfig] = clientCfg;
  }

  private getMainWindow(){
    return appModule.mainWindow?appModule.mainWindow:appModule.login.modal;
  }

  // network error handler
  private errorHandler(api:IBusinessApi, result:any){
    var skip_error = true;
    var parent = this.getMainWindow();
    var handler = (err)=>{
      if(err){
        if(err.handler){
          err.handler(parent);
        }
        return err.continue;
      }
      return true;
    }

    // http status error
    if(result.status == ERROR_CODE.HTTP){
      return false;
    }

    if(result.status == ERROR_CODE.NG){
      skip_error = handler(api.error.NG);
    }else if(result.status == ERROR_CODE.WARN){
      skip_error = handler(api.error.WARN);
    }else if(result.status == ERROR_CODE.NETWORK){
      skip_error = handler(api.error.NETWORK);
    }

    return skip_error;
  }

  /**
   * Load Data
   */
  public loadData(){
    var subject = new Subject<any>();
    var count = 0;
    var max = cacheList.immediate.length;

    cacheList.immediate.forEach(ele=>{
      var api = BusinessApi.API[ele.apiName];
      this.business.queryData(api, null).subscribe(
        val=>{
          var postHandler = (ele as any).post;

          if(postHandler){
            this._cacheData[ele.id] = postHandler(this, api, val);
          } else {
            this._cacheData[ele.id] = val;
          }

          if(!this.errorHandler(api, val)){
            // break application
            subject.error(api);
          }

          // complete
          if(++count >= max){
            subject.complete();
          }
        }
      );
    })

    // init extend cache
    cacheList.extend.forEach(ele=>{
      this._cacheData[ele.id] = {status:'0', result:[]};
    });

    return subject;
  }

  public cacheDataById(id:CACHE){
    return this._cacheData[id];
  }

  public setCacheData(id:CACHE, data:any){
    return this._cacheData[id] = data;
  }

  public cacheData(apiName:string):Subject<any>{
    var ids = cacheList.immediate.find( itm => itm.apiName == apiName );
    var def;

    if( !ids ){
      // 内部で使われる cache data.
      ids = cacheList.extend.find( itm => itm.apiName == apiName );
    }
    
    if( ids ){
      def = new Subject<any>();

      // 最初からキャッシングされたデーター
      setTimeout(()=>{
        def.next(this._cacheData[ids.id]);
      }, 5);
    }else{
      // 遅延ロードイングするデーター
      var lazy = cacheList.lazy.find( itm => itm.apiName == apiName ) as any;
      if( lazy ){
        var data = this._cacheData[lazy.id];
        if(data){ // cashed data
          if(lazy.apiName == 'getExecutionList') {            
            if(Number(this.prevExecutionDateType) < Number(this.executionDateType) ) { // 差分データの要求
              if(!lazy.subject){
                def = new Subject<any>();
                // // has data
                setTimeout(()=>{
                  // send cashed data to screen
                  data.result.append = true;
                  def.next(data);
                  // request diff data
                  lazy.diff(this, def);    
                },5);
              }else{
                // 重複要求防止用
                def = lazy.subject;
              }  
            }
            else {  // used cashed data
              def = new Subject<any>();
              // has data
              setTimeout(()=>{
                def.next(data);
              },5);              
            }
          }
          else {
            def = new Subject<any>();
            // has data
            setTimeout(()=>{
              def.next(data);
            },5);
          }
        }
        else{  // request data
          if(!lazy.subject){
            // 重複要求防止用
            def = new Subject<any>();

            // request data
            lazy.load(this, def);

            lazy.subject = def;
          }else{
            // 重複要求防止用
            def = lazy.subject;
          }
        }
      }
      else {
        if(apiName == 'getOrderListDirect') {
          lazy = cacheList.lazy.find( itm => itm.id == CACHE.getOrderList );
        }
        else if(apiName == 'getExecutionListDirect') {
          lazy = cacheList.lazy.find( itm => itm.id == CACHE.getExecutionList );
        }
        if(lazy) {
          if(!lazy.subject){
            // 重複要求防止用
            def = new Subject<any>();

            // request data
            lazy.load(this, def);

            lazy.subject = def;
          }else{
            // 重複要求防止用
            def = lazy.subject;
          }
        }
      }
    }

    return def;
  }

  private getPositionList( option:any, deffer:Subject<any> ){
    this.getPositionListEx().subscribe(
      val=>{
        if(val && val.status == ERROR_CODE.OK){
          this._cacheData[option.id] = val;

          // set order updater
          this.updatePositionList.init(val, this);
        }
        
        deffer.next(val);

        // 重複要求防止用
        option.subject=null;
      },
    );
  }

  // get all positions
  public getPositionListEx():Observable<any>{
    var def = new Subject<any>();
    var api = BusinessApi.API.getPositionList;
    var self = this;

    // request ALL page
    this.business.queryData(api, {listdataGetType:'ALL', pageCnt:200}).subscribe(
      val=>{
        this._cacheData[CACHE.getPositionList] = val;
        // if( val.status == ERROR_CODE.OK ){
        //   // request ALL page
        //   if(val.result.totalPageCount > 1){
        //     this.business.queryData(api, {listdataGetType:'ALL', pageCnt:200}).subscribe(val=>{
        //       if(val.status=="0" && val.result && val.result.positionList){
        //         val.result.positionList.splice(0, self._cacheData[CACHE.getPositionList].result.positionList.length);
        //         this.updatePositionList.append(val.result.positionList);
        //       }
        //     });
        //   }
        // }
        def.next(val);
      }
    );
    return def;
  }

  private getOrderList( option:any, deffer:Subject<any> ){
    this.getOrderListEx().subscribe(
      val=>{
        if(val && val.status == ERROR_CODE.OK){
          this._cacheData[option.id] = val;

          // set order updater
          this.updaterOrderList.init(val, this, this.business, this._cacheData[CACHE.productList]);
        }
        
        deffer.next(val);

        // 重複要求防止用
        option.subject=null;
      }
    );
  }

  public getOrderListEx(){
    var api = BusinessApi.API.getOrderList;
    var def = new Subject<any>();
    var self = this;

    this.makeOrderListItems();  // 要求するデータリストを作る
    
    let input = this.orderListItems.pop();
    // request first
      this.business.queryData(api, input).subscribe(      
      val=>{
        if( val.status == ERROR_CODE.OK ){
          // if(val.result.totalPageCount > 1){
          if(this.orderListItems.length){
            val.result['append'] = true;
            this.getOrderListMore();
            // val.result['append'] = true;
            // input = this.orderListItems.pop();
            // Logger.system.debug('getOrderListEx ' + input);
            // this.business.queryData(api, input).subscribe(val=>{
            //   self._cacheData[CACHE.getOrderList].result['append'] = false;
            //   if(val && val.status=="0" && val.result && val.result.orderList){
            //     val.result.orderList.splice(0, self._cacheData[CACHE.getOrderList].result.orderList.length);
            //     this.updaterOrderList.append(val.result.orderList);
            //   }              
            // });
          }
        }

        def.next(val);
      }
    );

    return def;
  }

  public getOrderListExAll(){
    var api = BusinessApi.API.getOrderList;
    var def = new Subject<any>();
    var self = this;

    this.makeOrderListItems();  // 要求するデータリストを作る
    
    let input = this.orderListItems.pop();    

    this.business.queryData(api, input).subscribe(val=>{
      if(val && val.status=="0" && val.result && val.result.orderList){
        this._cacheData[CACHE.getOrderList] = val;

        if(this.orderListItems.length){
          val.result['append'] = true;
          this.getOrderListMore();
        }

        // set order list
        this.updaterOrderList.init(val, this, this.business, this._cacheData[CACHE.productList]);        
        def.next(val);
      }
    });    
    
    return def;
  }    

  private getExecutionList( option:any, deffer:Subject<any> ){
    this.executionListItems = this.makeExecutionListItems(this.executionDateType);  // 要求するデータリストを作る    
    this.getExecutionListEx().subscribe(
      val=>{
        if(val && val.status == ERROR_CODE.OK){
          this._cacheData[option.id] = val;

          // set order updater
          this.updateExecuteList.init(val, this, this.business, this._cacheData[CACHE.productList]);
        }

        deffer.next(val);

        // 重複要求防止用
        option.subject=null;
      }
    );
  }

  public getExecutionListEx(){
    var api = BusinessApi.API.getExecutionList;
    var def = new Subject<any>();
    var self = this;

    // this.executionListItems = this.makeExecutionListItems(this.executionDateType);  // 要求するデータリストを作る
    this.prevExecutionDateType = this.executionDateType;

    let input = this.executionListItems.pop();

    // request first
    this.business.queryData(api, input).subscribe(
      val=>{
        if( val.status == ERROR_CODE.OK ){
          // request ALL page
          // if(val.result.totalPageCount > 1){
            if(this.executionListItems.length){
            // #3260 -----
            val.result['append'] = true;
            // #3260 -----
            this.getExecutionListMore();
            // this.business.queryData(api, {listdataGetType:'ALL', pageCnt:200, executionDateType:4}).subscribe(val=>{
            //   self._cacheData[CACHE.getExecutionList].result['append'] = false;
            //   if(val && val.status=="0" && val.result && val.result.executionList){
            //     val.result.executionList.splice(0, self._cacheData[CACHE.getExecutionList].result.executionList.length);
            //     self.updateExecuteList.append(val.result.executionList);
            //   }
            // });
          }
        }
        
        def.next(val);
      }
    );    
    
    return def;
  }  

  public getExecutionListExAll(){
    var api = BusinessApi.API.getExecutionList;
    var def = new Subject<any>();
    var self = this;

    this.executionListItems = this.makeExecutionListItems(this.executionDateType);  // 要求するデータリストを作る
    this.prevExecutionDateType = this.executionDateType;

    let input = this.executionListItems.pop();

    this.business.queryData(api, input).subscribe(val=>{
      // self._cacheData[CACHE.getExecutionList].result['append'] = false;
      if(val && val.status=="0" && val.result && val.result.executionList){
        this._cacheData[CACHE.getExecutionList] = val;

        // set execution list
        this.updateExecuteList.init(val, this, this.business, this._cacheData[CACHE.productList]);        
        if(this.executionListItems.length) {
          val.result['append'] = true;
          this.getExecutionListMore();
        }

        def.next(val);
      }
    });
    
    return def;
  }  

  private getMarketCalendarInfo( option:any, deffer:Subject<any> ){
    var api = BusinessApi.API.getMarketCalendarInfo;

    this.business.queryData(api, {}).subscribe(
      val=>{
        if( val.status == ERROR_CODE.OK ){
          this._cacheData[option.id] = val;
        }

        deffer.next(val);
        
        // 重複要求防止用
        option.subject=null;
      }
    );         
  }

  private getNewsList( option:any, deffer:Subject<any> ){
    var api = BusinessApi.API.getNewsList;

    this.business.queryData(api, {}).subscribe(
      val=>{
        if( val.status == ERROR_CODE.OK ){
          this._cacheData[option.id] = val;
        }
        
        deffer.next(val);
        
        // 重複要求防止用
        option.subject=null;
      }
    );         
  }   

  private orderProductList( option:any, deffer:Subject<any> ){
    var api = BusinessApi.API.orderProductList;

    this.business.queryData(api, null).subscribe(
      val=>{
        if( val.status == ERROR_CODE.OK ){
          this._cacheData[option.id] = val;
        }
        
        deffer.next(val);
        
        // 重複要求防止用
        option.subject=null;
      }
    );
  }

  private getExecutionProductList( option:any, deffer:Subject<any> ){
    var api = BusinessApi.API.getExecutionProductList;

    // request 1 page
    this.business.queryData(api, null).subscribe(
      val=>{
        if( val.status == ERROR_CODE.OK ){
          this._cacheData[option.id] = val;
        }
        
        deffer.next(val);
        
        // 重複要求防止用
        option.subject=null;
      }
    );
  }

  public updateEvent(event:any){
    /**
     * event format
     * 例：[ 'NEW_ORDER', {order infomation}]
     */
    if( event && event[1] ){
      Logger.system.debug('[EVENT] ' + event[1].eventType);

      //-----------------------------------------------------------------------
      // 注文一覧
      //-----------------------------------------------------------------------
      this.updaterOrderList.update(event[1], this._cacheData[CACHE.orderProductList]);

      //-----------------------------------------------------------------------
      // 約定一覧
      //-----------------------------------------------------------------------
      this.updateExecuteList.update(event[1], this._cacheData[CACHE.getExecutionProductList]);
      
      //-----------------------------------------------------------------------
      // ポジション一覧
      //-----------------------------------------------------------------------
      this.updatePositionList.update(event[1]);

      this.updateNotice(event[1]);      
    }
  }

  private updateNotice(event:IEventNotice){
    // add order
    switch(event.eventType){
      case NoticeType.NOTIFY_EXECUTION:
      case NoticeType.NOTIFY_ORDER_INVALIDAION:
      case NoticeType.NOTIFY_SPEED_EXPIRE:
      case NoticeType.NOTIFY_EXPIRE:{
        var notice = this._cacheData[CACHE.getNoticeList];
        if(notice){
          notice.result.push(event);
        }
      }
      break;
    }
  }

  /**
   * convert news Event
   * 
   * @param event 
   */
  public convertNewsEvent(event:any):NewsList[]{
    var list:NewsList[] = [];
    if(event && event[1]){
      event[1].newsList.forEach(news=>{
        var newData:NewsList = {
          headlineId:     news.headlineId,
          newsVenderName: news.newsVenderName,
          resourceType:   news.resourceType,
          issueDate:      news.issueDate,
          title:          news.title,
          pureStory:      news.pureStory,
          newsVenderCode: news.newsVenderCode
        };

        // add news
        list.push(newData);
      })
    }

    return list;
  }

  /**
   * update news list.
   * 
   * @param event 
   */
  public updateNews(list:NewsList[]){
    var cache = this._cacheData[CACHE.getNewsList];

    if(cache && cache.result && cache.result.newsList){
      var newsList = cache.result.newsList;

      // insert news
      list.forEach(el=>{
        newsList.splice(0, 0, el);
      })
    }
  }

  /**
   * update calendar cache
   * 
   * @param event 
   */
  public updateCalendar(list:MarketCalendarList[], add:MarketCalendarList[], update:MarketCalendarList[]){
    var cache = this._cacheData[CACHE.getMarketCalendarInfo];

    if(cache && cache.result && cache.result.marketCalendarList){
      var calendar = cache.result.marketCalendarList;

      list.forEach(el=>{
        let cal = calendar.find(c=>c.marketCalendarId == el.marketCalendarId);

        if(cal){
          // update calender
          Object.keys(cal).forEach(key=>{
            cal[key] = el[key];
          })

          update.push(el);
        }else{
          // new calender
          calendar.push(el);
          add.push(el);
        }
      })
    }
  }

  /**
   * convert Calendar Event
   * 
   * @param event 
   */
  public convertCalendarEvent(event:any):MarketCalendarList[]{
    var list:MarketCalendarList[] = [];

    if(event && event[1]){
      event[1].marketCalendarList.forEach(cal=>{
        var newData:MarketCalendarList = {
          marketCalendarId:       cal.marketCalendarId,
          contentId:              cal.contentId,
          importantType:          cal.importantType,
          countryCode:            cal.countryCode,
          text:                   cal.text,
          marketCalendarDatetime: cal.marketCalendarDatetime,
          unit:                   cal.unit,
          lastTime:               cal.lastTime,
          expected:               cal.expected,
          result:                 cal.result,
          holiday:                cal.holiday,
        };

        if(cal.text.indexOf("[休日]") >= 0){
          cal.holiday = "1";
        }else{
          cal.holiday = "0";
        }

        // add received calendar
        list.push(newData);
      })
    }

    return list;
  }

  /**
   * update EOD
   */
  public updateEOD(event:any){
    var subject = new Subject<any>();
    var cache = this._cacheData[CACHE.userInfo];
    
    // update business-date in userInfo.
    if(cache && cache.result && cache.result.businessDate && event && event[1]){
      cache.result.businessDate = event[1].businessDate;
    }

    // 銘柄一覧更新    
    this.business.queryData(BusinessApi.API.getProductList, null).subscribe(
      val=>{
        // reply result
        if(val.status == ERROR_CODE.OK){
          this._cacheData[CACHE.productList] = val;
        }

        subject.next();
        subject.complete();
      },
      err=>{
        subject.next();
      }
    );

    return subject;
  }

  /**
   * update Conversion Rate
   * 
   * @param event 
   */
  public updateConversionRate(event:any){
    var cache = this._cacheData[CACHE.conversionRateList];
    
    if(cache && cache.result && cache.result.conversionRateList && event && event[1]){
      var list = cache.result.conversionRateList;
      var arr = event[1];

      event[1].conversionRateList.forEach(cnv=>{
        var newData:IConversionRate = {
          currency:               cnv.currency,
          createBusinessDate:     cnv.createBusinessDate,
          createDatetime:         cnv.createDatetime,
          floatingpos:            cnv.floatingpos,
          seq:                    cnv.seq,
          bid:                    cnv.bid,
          ask:                    cnv.ask,
        };

        // update calendar
        var notFound = true;
        for( var i = 0; i < list.length; i++){
          if(list[i].currency == newData.currency){
            list[i] = newData;
            notFound = false;
            break;
          }
        }

        if(notFound){
          list.push(newData);
        }
      });
    }
  }  

  /**
   * reset News
   */
  public resetNews():Observable<NewsList[]>{
    var subject = new Subject<NewsList[]>();
    
    this.business.queryData(BusinessApi.API.getNewsList, null).subscribe(
      val=>{
        // reply result
        if(val.status == ERROR_CODE.OK){
          this._cacheData[CACHE.getNewsList] = val;

          subject.next(val.result.newsList);
          subject.complete();
        }
        subject.complete();
      }
    );

    return subject;
  }

  /**
   * reset Calendar
   */
  public resetCalendar():Observable<MarketCalendarList[]>{
    var subject = new Subject<MarketCalendarList[]>();

    this.business.queryData(BusinessApi.API.getMarketCalendarInfo, null).subscribe(
      val=>{
        // reply result
        if(val.status == ERROR_CODE.OK){
          this._cacheData[CACHE.getMarketCalendarInfo] = val;

          subject.next(val.result.marketCalendarList);
          subject.complete();
        }
        subject.complete();
      }
    );

    return subject;
  }
 
  /**
   * reset Conversion Rate
   */
  public resetConversionRate():Observable<IStreamConversionRate[]>{
    var subject = new Subject<IStreamConversionRate[]>();
    
    this.business.queryData(BusinessApi.API.getConversionRate, null).subscribe(
      val=>{
        // reply result
        if(val.status == ERROR_CODE.OK){
          this._cacheData[CACHE.conversionRateList] = val;

          subject.next(val.result.conversionRateList);
          subject.complete();
        }
        subject.complete();
      }
    );

    return subject;
  } 

  /**
   * 
   */
  public resetEOD():Observable<any>{
    var subject = new Subject<any>();
    var prod   = this.business.queryData(BusinessApi.API.getProductList, null);
    var classi = this.business.queryData(BusinessApi.API.classifiedProducts, null);
    var user   = this.business.queryData(BusinessApi.API.userInfo, null);
    var recvCnt = 3;

    Observable.zip(prod, classi, user).subscribe(
      val=>{
        if(val[0].status == ERROR_CODE.OK){
          this._cacheData[CACHE.productList] = val[0];
        } 
        if(val[1].status == ERROR_CODE.OK){
          this._cacheData[CACHE.classifiedProducts] = val[1];
        }
        if(val[2].status == ERROR_CODE.OK){
          this._cacheData[CACHE.userInfo] = val[2];
        }
        subject.next(null);
      },
      err=>{
        subject.next(null);
      }
    );

    return subject;
  }
 
  /**
   * 
   */
  public resetEvents(){
    this._cacheData[CACHE.getOrderList] = null;
    this._cacheData[CACHE.getPositionList] = null;
    this._cacheData[CACHE.getExecutionList] = null;
    this._cacheData[CACHE.orderProductList] = null;
    this._cacheData[CACHE.getExecutionProductList] = null;
  }

  public resetExecutionList(){
    this._cacheData[CACHE.getExecutionProductList] = null;
    this._cacheData[CACHE.getExecutionList] = null;    
  }

  public resetOrderList(){
    this._cacheData[CACHE.orderProductList] = null;
    this._cacheData[CACHE.getOrderList] = null;
  }

  public resetPositionList(){
    this._cacheData[CACHE.getPositionList] = null;
  }

  /**
   * get client-config.json 
   * 
   * @param logged 
   */
  public getClientConfig(logged:boolean):Observable<IResClientConfig>{
    var api = BusinessApi.API.getClientConfig;
    var subject = new Subject<any>();
    var http = new HttpHelper();
    
    http.get(CommonConfig.service.clientCfgUrl).subscribe(
      val=>{
        this._cacheData[CACHE.clientConfig] = val;
        subject.next(val);
      },
      err=>{
        if(!logged){
          // login前ならメッセージ表示
          var par = appModule.login.modal;

          if(err.error == ERROR_CODE.NETWORK){
            api.error.NETWORK.handler(par, ()=>{
              subject.error(err);
            });
          }else if(err.error == ERROR_CODE.HTTP){
            if(err.statusCode == 404){
              api.error.NG.handler(par, ()=>{
                subject.error(err);
              });
            }else{
              api.error.WARN.handler(par, ()=>{
                subject.error(err);
              });
            }
          }
        }else{
          subject.error(err);
        }
      }
    );

    return subject;
  }

  public getPowerAmount(){
    var api = BusinessApi.API.getPowerAmountDirect;
    
    this.business.queryData(api, null).subscribe(val=>{
      // if(val.status == ERROR_CODE.OK){
        this.updatePowerAmount(val);
      // }
    });
  }

  private updatePowerAmount(val){
    var prvDay, nxtDay;

    if(this._cacheData[CACHE.powerAmount]){
      prvDay = this._cacheData[CACHE.powerAmount].datetime;
    }

    if(val){
      nxtDay = val.datetime;
    }

    // update cache - powerAmount
    this._cacheData[CACHE.powerAmount] = val;
    
    // send notify - powerAmount
    electron.webContents.getAllWebContents().forEach((web)=>{
      web.send(commonApp.IPC_NOTIFICATION_REPLY_POWERAMOUNT, val);
    });

    if(val.status == ERROR_CODE.OK){
      // check over night for calendar
      prvDay = moment(prvDay,'YYYYMMDD').toDate();
      nxtDay = moment(nxtDay,'YYYYMMDD').toDate();

      // 営業日が変わった。
      if(prvDay.getDate() != nxtDay.getDate()){
        // 経済カレンダー　表示期間外データー削除
        this.delCalendarDate(nxtDay);

        // 約定履歴　表示期間外データー削除
        this.delExecutionList(nxtDay);
      }
    }
  }

  /**
   * 約定履歴　表示期間外データー削除
   */
  private delExecutionList(businessDay:Date){
    this.updateExecuteList.delExecutionList(businessDay);
  }

  /**
   * 経済カレンダー表示期間外データー削除
   * 
   * @param nxtDay 
   * @param retentionPeriod 
   */
  private delCalendarDate(businessDay:Date){
    var calr    = this._cacheData[CACHE.getMarketCalendarInfo];
    var period  = this._cacheData[CACHE.clientConfig].keyIndicatorDataRetentionPeriod;
    var delList = [];
    
    businessDay.setDate(businessDay.getDate() - period);

    if(calr){
      for(var i = calr.result.marketCalendarList.length-1; i >= 0; i-- ){
        var c = calr.result.marketCalendarList[i];
        var cDay = moment(c.marketCalendarDatetime,'YYYYMMDD').toDate();
                
        if( cDay < businessDay ){
          delList.push(c);
          calr.result.marketCalendarList.splice(i, 1);
        }
      }

      // send notify - delete list calendar item
      if(delList.length > 0){
        electron.webContents.getAllWebContents().forEach((web)=>{
          web.send(commonApp.IPC_NOTIFICATION_REPLY_CALENDAR, { type:'delete', calendars:delList });
        });
      }
    }
  }

  /**
   * 
   * 
   * @param api 
   */
  public handlerSettings(api:IBusinessApi, data:any){
    var alert=[], layout=[], general=[];

    if( data.status == ERROR_CODE.OK && data.result ){
      data.result.forEach(group => {
        var key = Object.keys(group);
        
        if(key[0]){
          if( key[0] == TOOLSET.alert){
            alert.push(group);
          }else if(/^layoutid_/.test(key[0])){
            layout.push(group);
          }else{
            general.push(group);
          }
        }
      });
    }

    // load default general settting.
    if (general.length <= 0) {
      general = FileUtil.loadJSONSync('defaultSetting.json').result;
      general.forEach(item => {
        data.result.push(item);
      });
    }
    
    this._cacheData[CACHE.settings_alert] = {status:"0", result:alert};
    this._cacheData[CACHE.settings_layout] = {status:"0", result:layout};
    this._cacheData[CACHE.settings_general] = {status:"0", result:general};
  
    var config = general.find(el=>Object.keys(el)[0] == TOOLSET.sound);
    this.initSoundDir(config[TOOLSET.sound][0].soundSettings);

    return data;
  }

  /**
   * サーバーから受信データでキャッシュアップデート
   * 
   * @param api 
   * @param input  サーバーに投げたデータ
   * @param output サーバーから貰ったデータ
   */
  public update( api:IBusinessApi, input:any, output:any ){
    switch( api.name ){
      case BusinessApi.API.setAlert.name:{
        output.result = input;
        this._cacheData[CACHE.settings_alert] = output;
        this.updateAllSettings(api.name, input);
      }
      break;
      case BusinessApi.API.setLayout.name:{
        output.result = input;
        this._cacheData[CACHE.settings_layout] = output;
        this.updateAllSettings(api.name, input);
      }
      break;
      case BusinessApi.API.setSettings.name:{
        output.result = input;
        this._cacheData[CACHE.settings_general] = output;
        this.updateAllSettings(api.name, input);
      }
      break;
      case BusinessApi.API.getPowerAmountDirect.name:{
        this.updatePowerAmount(output);
      }      
      break;
      case BusinessApi.API.getPositionListDirect.name:{   // 建玉一覧更新
        this.refreshPositionList(output);
      }      
      break;
      case BusinessApi.API.getOrderListDirect.name:{  // 注文一覧更新
        this.refreshOrderList(output);
      }      
      break;
      case BusinessApi.API.getExecutionListDirect.name:{  // 約定一覧更新
        this.refreshExecutionList(output);
      }      
      break;
      case BusinessApi.API.getMarketCalendarInfoDirect.name:{ // カレンダー更新
        this.refreshMarketCalendarInfo(output);
      }      
      break;
      case BusinessApi.API.getNewsListDirect.name:{ // ニュース更新
        this.refreshNewsList(output);
      }      
      break;                        
    }
  }

  /**
   * 
   */
  private initSoundDir(sound:any){
    sound.executionSoundFolder = this.getDefSoundDir(sound.executionSoundFolder);
    sound.alertSoundFolder = this.getDefSoundDir(sound.alertSoundFolder);
  }

  private getDefSoundDir(dir:string){
    if(dir && dir.length && FileUtil.existsSync(dir)){
      return dir;
    }

    let root = FileUtil.getAppDir();
    
    return `${root}${FileUtil.dirSeperator()}sound`;
  } 
  
  /**
   * デフォルト：サウンド設定
   */
  public defaultSoundSetting() {
    // #2537
    try {
      var result = FileUtil.loadJSONSync('defaultSetting.json').result;
      var config = result.find(el=>Object.keys(el)[0] == TOOLSET.sound);

      config = config[TOOLSET.sound][0].soundSettings;

      this.initSoundDir(config);

      return config;
    }
    catch(e) {
      Logger.system.error(e);
    }
  }

  /**
   * デフォルト：チャート色設定
   */
  public defaultChartColorSetting() {
    try {
      var result = FileUtil.loadJSONSync('defaultSetting.json').result;
      var config = result.find(el=>Object.keys(el)[0] == TOOLSET.chartColor);

      return config[TOOLSET.chartColor][0].chartColorSettings;
    }
    catch(e) {
      Logger.system.error(e);
    }
  }

  /**
   * デフォルト：チャート色設定：#2537
   */
  public defaultChartTechnicalSetting() {
    try {
      var result = FileUtil.loadJSONSync('defaultSetting.json').result;
      var config = result.find(el=>Object.keys(el)[0] == TOOLSET.chartTech);

      return config[TOOLSET.chartTech][0];
    }
    catch(e) {
      Logger.system.error(e);
    }
  }

  /**
   * cacheData filtering
   */
  public postResponse(apiName:string, req:any, val:any){
    var lazy = cacheList.lazy.find( itm => itm.apiName == apiName ) as any;
    var immd = cacheList.immediate.find( itm => itm.apiName == apiName ) as any;
    var extd = cacheList.extend.find( itm => itm.apiName == apiName ) as any;
    var filter;
    var result;

    if(lazy && lazy.filter){
      filter = lazy.filter;
    }else if(immd && immd.filter){
      filter = immd.filter;
    }if(extd && extd.pofilterst){
      filter = extd.filter;
    }

    if(filter){
      result = filter( this, req, val );
    }else{
      result = val;
    }

    return result;
  }

  /**
   * 約定履歴絞り込み
   */
  public filterExecutionList(req:IReqExecutionList, data:IResExecutionList){
    let powerAmount = this._cacheData[CACHE.powerAmount];
    let businessDate = powerAmount.datetime;
    var result = data;

    businessDate = moment(businessDate,'YYYYMMDD');
    
    // 約定日期間区分
    if(req.executionDateType){
      switch(req.executionDateType){
        case "1":
        // ２週間前
        businessDate = businessDate.add('d', -14).toDate();
        break;
        case "2":
        // １ヶ月前
        businessDate = businessDate.add('M', -1).toDate();
        break;
        case "3":
        // ２ヶ月前
        businessDate = businessDate.add('M', -2).toDate();
        break;
        case "4":
        // ３ヶ月前
        businessDate = businessDate.add('M', -3).toDate();
        break;
      }

      let executionList = [];
      let bAppend:boolean = false;
      if(data.result){
        executionList = data.result.executionList.filter(
          exec=>moment(exec.executionDatetime,'YYYYMMDD').toDate() >= businessDate
        )
        if(data.result.append) {
          bAppend = data.result.append;
        }        
      }

      result = {
        datetime: data.datetime, 
        status: data.status, 
        result:{
          executionList: executionList,
          append:bAppend
        }, 
        message: data.message,
        targetDateFrom:data.targetDateFrom,
        targetDateTo:data.targetDateTo
      };
    }

    return result;
  }

  private updateAllSettings(api:string, input:any){
    // initialize
    if(this._cacheData[CACHE.settings].result == null){
      this._cacheData[CACHE.settings].result = [];
    }

    if(!input || !Array.isArray(input)){
      return;
    }

    let settings = this._cacheData[CACHE.settings].result;   
    
    switch( api ){
      case BusinessApi.API.setAlert.name:{
        // alert
        let data = input[0];
        let alert = settings.find(f=>Object.keys(f)[0] == TOOLSET.alert);
        if(alert){
          alert[TOOLSET.alert] = data[TOOLSET.alert];
        }else{
          let tmp = {};
          tmp[TOOLSET.alert] = data[TOOLSET.alert];
          settings.push(tmp)
        }
      }
      break;
      case BusinessApi.API.setLayout.name:{
        // layout
        let data = input[0];
        let key = Object.keys(data)[0]
        let layout = settings.find(f=>Object.keys(f)[0] == key);
        if(layout){
          layout[key] = data[key];
        }else{
          let tmp = {};
          tmp[key] = data[key];
          settings.push(tmp)
        }
      }
      break;
      case BusinessApi.API.setSettings.name:{
        // general
        input.forEach(item=>{
          let key = Object.keys(item)[0]
          let group = settings.find(f=>Object.keys(f)[0] == key);
          if(group){
            group[key] = item[key];
          }else{
            let tmp = {};
            tmp[key] = item[key];
            settings.push(tmp)
          }          
        })
      }
      break;
    }  
  }

  // サーバーからポジションデータを取得してCacheを更新
  private refreshPositionList(val){
    if(val && val.status == ERROR_CODE.OK){
      this._cacheData[CACHE.getPositionList] = val;

      // set position list
      this.updatePositionList.init(val, this);
    }
  }

  // サーバーから注文データを取得してCacheを更新
  private refreshOrderList(val){
    if(val && val.status == ERROR_CODE.OK){
      this._cacheData[CACHE.getOrderList] = val;

      // set order list
      this.updaterOrderList.init(val, this, this.business, this._cacheData[CACHE.productList]);
    }
  }
  
  // サーバーから約定データを取得してCacheを更新
  private refreshExecutionList(val){
    if(val && val.status == ERROR_CODE.OK){
      this._cacheData[CACHE.getExecutionList] = val;
      
      // set execution list
      this.updateExecuteList.init(val, this, this.business, this._cacheData[CACHE.productList]);
    }
  }

  // サーバーから約定データを取得してCacheを更新
  private refreshMarketCalendarInfo(val){
    if(val && val.status == ERROR_CODE.OK){
      this._cacheData[CACHE.getMarketCalendarInfo] = val;
    }
  }

  private refreshNewsList(val){
    if(val && val.status == ERROR_CODE.OK){
      this._cacheData[CACHE.getNewsList] = val;
    }
  }

  private makeOrderListItems() {
    // let targetDateTo    : string = moment().format('YYYYMMDD'); // 対象期間FROM   20180110
    // let targetDateFrom  : string = moment().add(-7, 'days').format('YYYYMMDD'); // 対象期間TO     20180116
    this.orderListItems = [];
    this.orderListItems.push({targetDateFrom: moment().add(-7, 'days').format('YYYYMMDD'), targetDateTo:moment().format('YYYYMMDD')});
    this.orderListItems.push({targetDateFrom: moment().add(-14, 'days').format('YYYYMMDD'), targetDateTo:moment().add(-8, 'days').format('YYYYMMDD')});
    this.orderListItems.push({targetDateFrom: moment().add(-21, 'days').format('YYYYMMDD'), targetDateTo:moment().add(-15, 'days').format('YYYYMMDD')});
    this.orderListItems.push({targetDateFrom: moment().add(-28, 'days').format('YYYYMMDD'), targetDateTo:moment().add(-22, 'days').format('YYYYMMDD')});

    if(Number(moment().add(-28, 'days').format('YYYYMMDD')) > Number(moment().add(-1, 'months').format('YYYYMMDD'))) {
      this.orderListItems.push({targetDateFrom: moment().add(-1, 'months').format('YYYYMMDD'), targetDateTo:moment().add(-29, 'days').format('YYYYMMDD')});
    };
    this.orderListItems.reverse();
  }

  private getOrderListMore() {
    var api = BusinessApi.API.getOrderList;
    let input = this.orderListItems.pop();
    this.business.queryData(api, input).subscribe(val=>{
      if(val.status=="0" && val.result && val.result.orderList){
        if(this.orderListItems.length) {  // get more
          this._cacheData[CACHE.getOrderList].result['append'] = true;
          this.updaterOrderList.append(val.result.orderList, false);
          this.getOrderListMore();
        }
        else {  // last
          this._cacheData[CACHE.getOrderList].result['append'] = false;
          this.updaterOrderList.append(val.result.orderList, true);
        }
      }
    });
  }

  private makeExecutionListItems(execType:string) {
    // let targetDateTo    : string = moment().format('YYYYMMDD'); // 対象期間FROM   20180110
    // let targetDateFrom  : string = moment().add(-7, 'days').format('YYYYMMDD'); // 対象期間TO     20180116
        // 1：2週間前から、2：1ヶ月前から、3：2ヶ月前から、4：3ヶ月前から
    let executionListItems = [];
    if(execType == '1') { // 2weeks
      executionListItems.push({targetDateFrom: moment().add(-7, 'days').format('YYYYMMDD'), targetDateTo:moment().format('YYYYMMDD')});
      executionListItems.push({targetDateFrom: moment().add(-14, 'days').format('YYYYMMDD'), targetDateTo:moment().add(-8, 'days').format('YYYYMMDD')});
    }
    else if(execType == '2'){ // 1month
      executionListItems.push({targetDateFrom: moment().add(-7, 'days').format('YYYYMMDD'), targetDateTo:moment().format('YYYYMMDD')});
      for(let ii = 0; ii < 3; ii++) {
        executionListItems.push({targetDateFrom: moment().add((ii+2)*(-7), 'days').format('YYYYMMDD'), targetDateTo:moment().add((ii+1)*(-7) - 1, 'days').format('YYYYMMDD')});
      }
      if(Number(moment().add(-28, 'days').format('YYYYMMDD')) > Number(moment().add(-1, 'months').format('YYYYMMDD'))) {
        executionListItems.push({targetDateFrom: moment().add(-1, 'months').format('YYYYMMDD'), targetDateTo:moment().add(-29, 'days').format('YYYYMMDD')});
      };      
    }
    else if(execType == '3'){ // 2months
      executionListItems.push({targetDateFrom: moment().add(-7, 'days').format('YYYYMMDD'), targetDateTo:moment().format('YYYYMMDD')});
      for(let ii = 0; ii < 7; ii++) {
        executionListItems.push({targetDateFrom: moment().add((ii+2)*(-7), 'days').format('YYYYMMDD'), targetDateTo:moment().add((ii+1)*(-7) - 1, 'days').format('YYYYMMDD')});
      }
      if(Number(moment().add(-56, 'days').format('YYYYMMDD')) > Number(moment().add(-2, 'months').format('YYYYMMDD'))) {
        executionListItems.push({targetDateFrom: moment().add(-2, 'months').format('YYYYMMDD'), targetDateTo:moment().add(-57, 'days').format('YYYYMMDD')});
      };      
    }
    else if(execType == '4'){ // 3months
      executionListItems.push({targetDateFrom: moment().add(-7, 'days').format('YYYYMMDD'), targetDateTo:moment().format('YYYYMMDD')});
      for(let ii = 0; ii < 11; ii++) {
        executionListItems.push({targetDateFrom: moment().add((ii+2)*(-7), 'days').format('YYYYMMDD'), targetDateTo:moment().add((ii+1)*(-7) - 1, 'days').format('YYYYMMDD')});
      }      
      if(Number(moment().add(-84, 'days').format('YYYYMMDD')) > Number(moment().add(-3, 'months').format('YYYYMMDD'))) {
        executionListItems.push({targetDateFrom: moment().add(-3, 'months').format('YYYYMMDD'), targetDateTo:moment().add(-85, 'days').format('YYYYMMDD')});
      };      
    }
    executionListItems.reverse(); // popup
    return executionListItems;
  }

  private getExecutionListMore() {
    var api = BusinessApi.API.getExecutionList;
    let input = this.executionListItems.pop();
    this.business.queryData(api, input).subscribe(val=>{
      if(val.status=="0" && val.result && val.result.executionList){
        if(this.executionListItems.length) {  // get more
          this._cacheData[CACHE.getExecutionList].result['append'] = true;
          this.updateExecuteList.append(val.result.executionList, false);
          this.getExecutionListMore();
        }
        else {  // last
          this._cacheData[CACHE.getExecutionList].result['append'] = false;
          this.updateExecuteList.append(val.result.executionList, true);
        }
      }
    });    
  }

  private getDiffExecutionList( option:any, deffer:Subject<any> ){
    let prevExecutionListItems = this.makeExecutionListItems(this.prevExecutionDateType);  // 前回データリストを作る
    this.executionListItems = this.makeExecutionListItems(this.executionDateType);  // 要求するデータリストを作る
    
    // this.executionListItems.splice(0, prevExecutionListItems.length);
    this.executionListItems.splice(prevExecutionListItems.length * (-1));
    // this.prevExecutionDateType = this.executionDateType;
    // this.getExecutionListMore();

    this.getExecutionListEx().subscribe(
      val=>{
        if(val && val.status == ERROR_CODE.OK){

          if(this.executionListItems.length) {  // get more
            this._cacheData[CACHE.getExecutionList].result['append'] = true;
            this.updateExecuteList.append(val.result.executionList, false);
          }
        }

        // deffer.next(val);  // 差分データを要求する時は初期化されないように応答を画面に送信しない->[append]の通路を利用する

        // 重複要求防止用
        option.subject=null;
      }
    );

  }
}