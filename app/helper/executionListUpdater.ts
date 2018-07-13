/**
 * 
 * ExecutionListUpdater
 * 
 * send event type : 'new'
 */

import * as electron from 'electron';
import * as moment  from 'moment';

import {BusinessHelper} from './businessHelper';
import {BusinessApi} from '../../common/businessApi';
import {CacheHelper} from './cacheHelper';
import {IEventNotice, IResExecutionList, IResExecutionItem} from '../../www/app/values/values';
import {NoticeType} from '../../common/commonApp';
import * as CommonApp from '../../common/commonApp';
import {Logger} from '../util/logger';

interface SymbolExecution{
  status:string;
  message:string;
  datetime:string;
  result:{
    executionProductList:Symbol[];
  }
}

interface Symbol{
  cfdProductCode:string;
  meigaraSeiKanji:string;
}

//-----------------------------------------------------------------------------
//  ExecutionListUpdater
// ----------------------------------------------------------------------------
export class ExecutionListUpdater{
  private executions:IResExecutionList;
  private productList:any;
  private business:BusinessHelper;
  private cache:CacheHelper;
  
  constructor(){

  }

  public init(data:any, cache:CacheHelper, business:BusinessHelper, productList:any){
    this.executions = data;
    this.business = business;
    this.cache = cache;
    this.productList = productList;
  }

  public append(executions: any, bLast: boolean){
    var result={ type:'append', executions:executions, last:bLast };

    this.executions.result.executionList = this.executions.result.executionList.concat(executions);

    this.sendEvent(result);
  }

  public update(event:IEventNotice, symbols:SymbolExecution){
    if(!this.executions || !this.business){
      return;
    }

    // add order
    switch(event.eventType){
      case NoticeType.EXECUTION:
      case NoticeType.LOSSCUT_RATE_SETTLE:
      case NoticeType.SPEED_EXECUTION:
        {
          this.addExecution(event.executionKeys);

          this.addSymbol(event.cfdProductCode, symbols);
        }
        break;
      case NoticeType.REFRESH:
        {
          this.cache.resetExecutionList();  // refresh前にCached dataを削除
          this.reloadExecutionsSymbol();
          this.reloadExecutions();
        }
        break;
    }
  }

  private reloadExecutions(){
    this.cache.getExecutionListExAll().subscribe(val=>{
      var data={ type:'reload', executions:val.result.executionList };
      this.executions = val;

      this.sendEvent(data);
    });    
  }

  private reloadExecutionsSymbol(){
    var api = BusinessApi.API.getExecutionProductList;
    
    this.business.queryData(api, null).subscribe(val=>{
      if( val.status == '0' ){
        this.productList = val;
      }
    });
  }

  private addExecution(executionKeys:string[]){
    if(executionKeys){
      var count = 0;
      var list  = [];
      let chkfunc = (that)=>{        
        count++;
        // add execution list
        if(count == executionKeys.length){
          that.executions.result.executionList = list.concat(this.executions.result.executionList);
          // send notify
          that.sendEvent({ type:'new', executions:list });
        }
      }

      executionKeys.forEach(key=>{
        this.getExecutionList(key).subscribe(
          val=>{
            if(val && val.status=='0'){
              list = val.result.executionList.concat(list);
            }
            chkfunc(this);
          },
          err=>{
            chkfunc(this);
          }
        );
      });
    }
  }

  private addSymbol(symbol:string, symbols:SymbolExecution){
    if(symbols && symbol){
      var sym = symbols.result.executionProductList.find((item)=>item.cfdProductCode == symbol);
      if(!sym){
        var product = this.getSymbolInfo(symbol);
        if(product){
          var dat:Symbol = {cfdProductCode:symbol, meigaraSeiKanji:product.meigaraSeiKanji};
          symbols.result.executionProductList.push(dat);
        }
      }
    }
    else {
      Logger.system.debug( '[executionList] addSymbol :' + symbols);
      Logger.system.debug( '[executionList] addSymbol :' + symbol);
    }
  }

  private getSymbolInfo(symbol:string){
    if(this.productList){
      return this.productList.result.productList.find((item)=>item.cfdProductCode);
    }
    return null;
  }
  
  /**
   * notice event to render processer.
   * 
   * @param data 
   */
  private sendEvent(data:any){
    electron.webContents.getAllWebContents().forEach((web)=>{
      web.send(CommonApp.IPC_NOTIFICATION_EVENT_EXECUTION, data);
    })
  }

  private getExecutionList(key:string){
    var api = BusinessApi.API.getExecutionList;
    
    return this.business.queryData(api, {listdataGetType:'1', executionKeys:key});
  }

  /**
   * 約定履歴　表示期間外データー削除
   */
  public delExecutionList(businessDay:Date){
    var delList = [];

    // ３ヶ月前は削除
    businessDay = moment(businessDay).add('M', -3).toDate();

    if(this.executions && this.executions.result){
      for(var i = this.executions.result.executionList.length-1; i >= 0; i-- ){
        var exec = this.executions.result.executionList[i];

        var cDay = moment(exec.executionDatetime, 'YYYYMMDD').toDate();
        
        if( cDay < businessDay ){
          delList.push(exec);
          this.executions.result.executionList.splice(i, 1);
        }
      }

      // send deleted execution list.
      this.sendEvent({ type:'delete', executions: delList });
    }
  }
}