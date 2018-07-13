/**
 * 
 * PositionListUpdater
 * 
 * send event type : 'new', 'update', 'delete', 'reload'
 */

import * as electron from 'electron';
import {BusinessHelper} from './businessHelper';
import {CacheHelper} from './cacheHelper';
import {BusinessApi} from '../../common/businessApi';

// import {IPositionListItem,  } from '../const/interface';
import {IEventNotice, IEventPosition, IResPositionInfo} from '../../www/app/values/values';

import {NoticeType} from '../../common/commonApp';
import * as commonApp from '../../common/commonApp';

//-----------------------------------------------------------------------------
//  PositionListUpdater
// ----------------------------------------------------------------------------
export class PositionListUpdater{
  private positions:any;
  private cache:CacheHelper;

  constructor(){

  }

  public init(data:any, cache:CacheHelper){
    this.positions = data;
    this.cache = cache;
  }


  public append(positions){
    var result={ type:'append', positions:positions };

    this.positions.result.positionList = this.positions.result.positionList.concat(positions);

    this.sendEvent(result);
  }

  public update(event:IEventNotice){
    if(!this.positions){
      return;
    }

    var result={ type:'update', positions:null };

    // add order
    switch(event.eventType){
      case NoticeType.SPEED_EXECUTION:
      case NoticeType.EXECUTION:
        {
          if(!this.addPositions(event.cfdPositions)){
            this.updatePositions(event.cfdPositions);
          }
          
          this.deletePositions(event.positionKeys);
        }
        break;
      case NoticeType.SETTLE_ORDER:
      case NoticeType.ORDER_CANCEL:
      case NoticeType.LOSSCUT_RATE_UPDATE:
      case NoticeType.SPEED_EXPIRE:
      case NoticeType.EXPIRE:
        {
          this.updatePositions(event.cfdPositions);
        }
        break;
      case NoticeType.LOSSCUT_RATE_SETTLE:
        {
          this.updatePositions(event.cfdPositions);
          this.deletePositions(event.positionKeys);
        }
        break;
      case NoticeType.ORDER_INVALIDATION:
      case NoticeType.UNEXPECTED_INCIDENT:
      case NoticeType.REFRESH:
        {
          this.cache.resetPositionList(); // refresh前にCached dataを削除
          this.reloadPositions();
        }
        break;
    }
  }

  /**
   * notice event to render processer.
   * 
   * @param data 
   */
  private sendEvent(data:any){
    electron.webContents.getAllWebContents().forEach((web)=>{
      web.send(commonApp.IPC_NOTIFICATION_EVENT_POSITION, data);
    })    
  }

  private findPosition(key:string){
    return this.positions.result.positionList.find(odr=>odr.positionKey==key);
  }

  private reloadPositions(){
    this.cache.getPositionListEx().subscribe(val=>{
      var data={ type:'reload', positions:val.result.positionList };
      this.positions = val;

      this.sendEvent(data);      
    });
  }

  /**
   * 
   * @param positions 
   */
  private addPositions(positions:IEventPosition[]){
    var result = [];

    if(positions){
      positions.forEach(epos => {
        let ipos = this.findPosition(epos.positionKey);
        if(ipos == null){
          let item = this.convertPositionItem(epos);
          result.push(item);
        }
      });
    }

    if(result.length){
      var data={ type:'new', positions:result };
      this.positions.result.positionList = result.concat(this.positions.result.positionList);
      
      this.sendEvent(data);

      return true;
    }    

    return false;
  }
  
  /**
   * 
   * @param positions 
   */
  private updatePositions(positions:IEventPosition[]){
    var result = [];

    if(positions){
      positions.forEach(epos => {
        let idx = this.positions.result.positionList.findIndex(p=>p.positionKey==epos.positionKey);
        if(idx != -1){
          let item = this.convertPositionItem(epos);
          this.positions.result.positionList[idx] = item;
          result.push(item);
        }
      });
    }

    if(result.length){
      var data={ type:'update', positions:result };
      
      this.sendEvent(data);
    }    

    return result;
  }  

  /**
   * 
   * @param positionKeys 
   */
  private deletePositions(positionKeys:string[]){
    var result = [];
    if(positionKeys){
      positionKeys.forEach(key => {        
        for(let i=0; i < this.positions.result.positionList.length; i++){
          let pos = this.positions.result.positionList[i];
          if(pos.positionKey == key){
            result.push(pos);
            this.positions.result.positionList.splice(i,1);
            break;
          }
        }
      });
    }

    if(result.length){
      var data={ type:'delete', positions:result };

      this.sendEvent(data);
    }

    return result;
  }

  /**
   * 
   */
  private templatePositionItem():IResPositionInfo{
    return {
      positionKey:'',					    // ポジションキー
      cfdProductCode:'',				  // CFD銘柄コード
      buySellType:'',					    // 売買区分
      currentQuantity:0,				  // 現在数量
      orderQuantity:0,				    // 注文中数量
      quotationPrice:0,				    // 建値
      margin:0,						        // 必要証拠金
      executionDate:'',				    // 約定日時
      interestRateBalance:0,		  // 金利残高
      losscutRate:0,					    // ロスカットレート
      dividenedBalance:0,			    // 配当金残高
      optionalMargin:0,				    // 任意証拠金   
    }
  }

  // convert IEventPosition to IResPositionInfo
  private convertPositionItem( position:IEventPosition ){
    var item = this.templatePositionItem();
    var keys = Object.keys(item);

    keys.forEach(key=>{
      let value = position[key];

      if( typeof item[key] === "number" ){
        value = value!==undefined?Number(value):0;
      } 

      item[key] = value;
    })

    if(position.losscutRateCalc){
      item.losscutRate = position.losscutRateCalc.losscutRate;
      item.optionalMargin = position.losscutRateCalc.optionalMargin;
    }

    // if(position.currentQuantity){
    //   item.orderQuantity = position.currentQuantity;
    // }
    
    item.dividenedBalance = position.dividendBalance;

    return item;
  }  
}