/**
 * 
 * Notification
 * 
 */
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import * as commonApp from "../../../common/commonApp";
import * as values from "../values/Values";

const electron = (window as any).electron;

export enum ForceReload{
  price = 1,
  orderEvent,
  EOD,
}

enum NOTICE{
  news = 0,
  event,
  conversionRate,
  calendar,
  eod,  

  order,
  position,
  execution,
  forceReload,
  powerAmount,

  length
}

//-----------------------------------------------------------------------------
// SERVICE : Notification
// ----------------------------------------------------------------------------
export class Notification {
  private subjects =  Array<Subject<any>>();

	//---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------	
  constructor( ){    
    this.listen();
  }
  
  /**
   * 注文・約定イベント
   */
  public event():Observable<values.IEventNotice>{
    return this.subjects[NOTICE.event];
  }

  /**
   * end of day
   */
  public EOD():Observable<any>{
    return this.subjects[NOTICE.eod];
  }

  /**
   * conversion rate
   */
  public conversionRate():Observable<values.IResStreamConversionRate>{
    return this.subjects[NOTICE.conversionRate];
  }

  /**
   * 余力情報取得
   */
  public powerAmount():Observable<values.IResPowerAmount>{
    return this.subjects[NOTICE.powerAmount];
  }

  /**
   * 強制画面データー更新イベント
   */
  public forceReload():Observable<ForceReload>{
    return this.subjects[NOTICE.forceReload];
  }

  /**
   * 
   * ニュースのリスト更新用イベント
   *
   * format : { type:'new', newsList:[] }
   * type : 'new',    新規追加
   *        'reload'  全体更新
   */  
  public news():Observable<{type:string,newsList:values.NewsList[]}>{
    return this.subjects[NOTICE.news];
  }
  
  /**
   * 
   * カレンダーのリスト更新用イベント
   *
   * format : { type:'new', calendars:[] }
   * type : 'new',    新規追加
   *        'update'  更新
   *        'delete', 削除
   *        'reload'  全体更新
   */  
  public calendar():Observable<{type:string,calendars:values.MarketCalendarList[]}>{
    return this.subjects[NOTICE.calendar];
  }

  /**
   * 
   * 注文一覧のリスト更新用イベント
   *
   * format : { type:'new', orders:[] }
   * type : 'new',    新規追加
   *        'append', 2ページ以降
   *        'update'  注文更新
   *        'reload'  全体更新
   */
	public order():Observable<{type:string,orders:values.IResOrderItem[]}>{
    return this.subjects[NOTICE.order];
  }

  /**
   * 
   * 建玉一覧のリスト更新用イベント
   * 
   * format : { type:'new', positions:[] }
   * type : 'new',    新規追加
   *        'update', 建玉更新
   *        'delete', 削除
   *        'reload'  全体建玉更新
   */
	public position():Observable<{type:string,positions:values.IResPositionInfo[]}>{
    return this.subjects[NOTICE.position];
  }

  /**
   * 
   * 約定一覧のリスト更新用イベント
   * 
   * format : { type:'new', executions:[] }
   * type : 'new',    新規追加
   *        'delete', 削除
   *        'reload'  全体更新
   */
	public execution():Observable<{type:string,executions:values.IResExecutionItem[]}>{
    return this.subjects[NOTICE.execution];
  }

  /**
   * listen
   */
  private listen(){
    // create subject
    for( let i=0; i < NOTICE.length; i++ ){
      this.subjects[i] = new Subject<any>();
    }
    
    if(electron){
      // news
      electron.ipcRenderer.on( commonApp.IPC_NOTIFICATION_REPLY_NEWS, (event, arg) => {
        this.subjects[NOTICE.news].next(arg);
      });

      // event
      electron.ipcRenderer.on( commonApp.IPC_NOTIFICATION_REPLY_EVENT, (event, arg) => {
        this.subjects[NOTICE.event].next(arg);
      });

      // calendar
      electron.ipcRenderer.on( commonApp.IPC_NOTIFICATION_REPLY_CALENDAR, (event, arg) => {
        this.subjects[NOTICE.calendar].next(arg);
      });

      // EOD
      electron.ipcRenderer.on( commonApp.IPC_NOTIFICATION_REPLY_EOD, (event, arg) => {
        this.subjects[NOTICE.eod].next(arg);
      });

      // conversion rate
      electron.ipcRenderer.on( commonApp.IPC_NOTIFICATION_REPLY_CONVERSION_RATE, (event, arg) => {
        let conv = arg[1];
        this.subjects[NOTICE.conversionRate].next(conv);
      });

      // order
      electron.ipcRenderer.on( commonApp.IPC_NOTIFICATION_EVENT_ORDER, (event, arg) => {
        this.subjects[NOTICE.order].next(arg);
      });
      
      // position
      electron.ipcRenderer.on( commonApp.IPC_NOTIFICATION_EVENT_POSITION, (event, arg) => {
        this.subjects[NOTICE.position].next(arg);
      });
      
      // execution
      electron.ipcRenderer.on( commonApp.IPC_NOTIFICATION_EVENT_EXECUTION, (event, arg) => {
        this.subjects[NOTICE.execution].next(arg);
      });  

      // force reload
      electron.ipcRenderer.on( commonApp.IPC_NOTIFICATION_RELOAD, (event, arg) => {
        var flag;

        if(arg){
          if(arg.cause == commonApp.RELOAD_BY_PRICE){
            flag = ForceReload.price;
          }else if(arg.cause == commonApp.RELOAD_BY_EVENT){
            flag = ForceReload.orderEvent;
          }else if(arg.cause == commonApp.RELOAD_BY_EOD){
            flag = ForceReload.EOD;
          }
        }
        this.subjects[NOTICE.forceReload].next(flag);
      });  

      // powerAmount
      electron.ipcRenderer.on( commonApp.IPC_NOTIFICATION_REPLY_POWERAMOUNT, (event, arg) => {
        this.subjects[NOTICE.powerAmount].next(arg);
      });
    }  
  }
}