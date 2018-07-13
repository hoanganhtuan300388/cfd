/**
 * 
 * OrderListUpdater
 * 
 * send event type : 'new', 'update'
 */

import * as electron from 'electron';
// import {IOrderListItem} from '../const/interface';
import {IEventNotice, IEventOrder, IResOrderItem, IEventPosition} from '../../www/app/values/values';

import {BusinessHelper} from './businessHelper';
import {BusinessApi} from '../../common/businessApi';

import {CacheHelper} from './cacheHelper';
import {NoticeType} from '../../common/commonApp';
import * as commonApp from '../../common/commonApp';
import {Logger} from '../util/logger';

interface SymbolOrder{
  status:string;
  message:string;
  datetime:string;
  result:{
    orderProductList:Symbol[];
  }
}

interface Symbol{
  cfdProductCode:string;
  meigaraSeiKanji:string;
}

//-----------------------------------------------------------------------------
//  OrderListUpdater
// ----------------------------------------------------------------------------
export class OrderListUpdater{
  private orders:any;
  private productList:any;
  private cache:CacheHelper;
  private business:BusinessHelper;

  constructor(){

  }

  public init(data:any, cache:CacheHelper, business:BusinessHelper, productList:any){
    this.orders = data;
    this.productList = productList;
    this.cache = cache;
    this.business = business;
  }

  public append(orders: any, bLast: boolean){
    var result={ type:'append', orders:orders, last:bLast };

    this.orders.result.orderList = this.orders.result.orderList.concat(orders);

    this.sendEvent(result);
  }

  public update(event:IEventNotice, symbols:SymbolOrder){
    if(!this.orders || !this.business){
      return;
    }

    var result={ type:'update', orders:null };
    Logger.system.info("update");
    Logger.system.info(event);

    // add order
    switch(event.eventType){
      case NoticeType.SETTLE_ORDER:
      case NoticeType.NEW_ORDER:
        {
          // convert OrderList item form evnet orders
          // Logger.system.info(event);
          var orders = this.convertOrderItems( event.cfdOrders, event.cfdPositions );
          this.orders.result.orderList = orders.concat(this.orders.result.orderList);
          result.type = 'new';
          result.orders = orders;
          this.addSymbols(event.cfdOrders, symbols);
        }
        break;
      case NoticeType.ORDER_UPDATE:
      {
        result.orders = this.updateOrderItem(event.cfdOrders);
      }
      break;      
      case NoticeType.TRAIL:  // トレールの場合、必要情報が無いので別の関数に分離
        {
          result.orders = this.updateOrderItemForTrail(event.cfdOrders);
        }
        break;
      case NoticeType.ORDER_CANCEL:
        {
          result.orders = this.upateOrderStatus(event.orderKeys, '3');  // （0：待機中、1：有効、2：約定済、3：取消済、4：執行中、5：取消中、8：失効）
        }
        break;
      case NoticeType.EXPIRE:
      case NoticeType.SPEED_EXPIRE:
      case NoticeType.ORDER_INVALIDATION:
        {
          result.orders = this.upateOrderStatus(event.orderKeys, '8');  // （0：待機中、1：有効、2：約定済、3：取消済、4：執行中、5：取消中、8：失効）
        }
        break;   
      case NoticeType.EXECUTION:
        {
          result.orders = this.updateOrderItem(event.cfdOrders);
          result.orders = result.orders.concat(this.upateOrderStatusEx(event.orderKeys));
          this.addSymbols(event.cfdOrders, symbols);
        }
        break;
      case NoticeType.SPEED_EXECUTION:
        {
          result.orders = this.upateOrderStatus(event.orderKeys, '2');  // （0：待機中、1：有効、2：約定済、3：取消済、4：執行中、5：取消中、8：失効）

          this.addSymbol(event.cfdProductCode, symbols);
        }
        break;
      case NoticeType.LOSSCUT_RATE_SETTLE:
        {
          result.orders = this.losscutRateSettle(event.positionKeys);
        }
        break;
      case NoticeType.UNEXPECTED_INCIDENT:  // 約定異常の場合再照会
      case NoticeType.REFRESH:
        {
          this.cache.resetOrderList();  // refresh前にCached dataを削除
          this.reloadOrdersSymbol();
          this.reloadOrders();
        }
        break;        
    }

    this.sendEvent(result);
  }

  private reloadOrders(){
    this.cache.getOrderListExAll().subscribe(val=>{
      var data={ type:'reload', orders:val.result.orderList };
      this.orders = val;

      this.sendEvent(data);      
    });    
  }

  private reloadOrdersSymbol(){
    var api = BusinessApi.API.orderProductList;
    
    this.business.queryData(api, null).subscribe(val=>{
      if( val.status == '0' ){
        this.productList = val;
      }
    });
  }

  private addSymbol(symbol:string, symbols:SymbolOrder){
    if(symbols){
      var sym = symbols.result.orderProductList.find((item)=>item.cfdProductCode == symbol);
      if(!sym){
        var product = this.getSymbolInfo(symbol);
        if(product){
          var dat:Symbol = {cfdProductCode:symbol, meigaraSeiKanji:product.meigaraSeiKanji};
          symbols.result.orderProductList.push(dat);
        }
      }
    }
  }

  private addSymbols(orders:IEventOrder[], symbols:SymbolOrder){
    if(orders){
      this.addSymbol(orders[0].cfdProductCode, symbols);
    }
  }

  private getSymbolInfo(symbol:string){
    if(this.productList){
      return this.productList.result.productList.find((item)=>item.cfdProductCode==symbol);
    }
    return null;
  }

  /**
   * notice event to render processer.
   * 
   * @param data 
   */
  private sendEvent(data:any){
    if(data && data.orders){
      electron.webContents.getAllWebContents().forEach((web)=>{
        web.send(commonApp.IPC_NOTIFICATION_EVENT_ORDER, data);
      })
    }
  }

  /**
   * losscut_Rate_Settle
   * 
   * orderType   ->  1：通常, 2：IFD, 3：OCO, 4：IFD-OCO, 5：一括決済, 6：トレール, 7：ロスカット, 9：強制決済
   * orderStatus ->  0：待機中、1：有効、2：約定済、3：取消済、4：執行中、5：取消中、8：失効
   * @param positionKeys 
   */
  private losscutRateSettle(positionKeys:string[]){
    var arr = [];
    if(positionKeys){
      positionKeys.forEach(key=>{
        var odr = this.findOrderByPositionKey(key);
        if(odr && odr.orderType == '7'){
          odr.orderStatus = '2'; // 約定済

          arr.push(odr);
        }
      })
    }
    return arr;
  }

  private upateOrderStatus(orderKeys:string[], status:string){
    var arr = [];

    if(orderKeys){
      orderKeys.forEach(odrKey=>{
        var order:IResOrderItem = this.findOrder(odrKey);

        if(order){
          // （0：待機中、1：有効、2：約定済、3：取消済、4：執行中、5：取消中、8：失効）

          if(status == '3') { // ・0：待機中 ・1：有効 ・5：取消中
            if(order.orderStatus == '0' || order.orderStatus == '1' || order.orderStatus == '5') {
              order.orderStatus = status;  
            }
          }
          else {
            order.orderStatus = status;
          }
          arr.push(order);
        }
      })
    }

    return arr;
  }
  
  /**
   * 『 約定 』　イベント受信
   * 
   * 該当する注文キーの注文ステータスを「約定済」に変更する		
   *  orderKeys[0]のデータの注文タイプがOco、もしくは注文タイプがIfdOcoかつ仕切区分が決済 だった場合（コードはイベント一覧参照）		
   *  orderKeys[0]は「約定」、orderKeys[1]は「取消済」とする		
   */
  private upateOrderStatusEx(orderKeys:string[]){
    var arr = [];

    // Logger.system.info("upateOrderStatusEx");
    // Logger.system.info(orderKeys);
    if(orderKeys){
      // 1次注文
      if(orderKeys[0]){
        var first:IResOrderItem = this.findOrder(orderKeys[0]);
        // Logger.system.info(first);
        if(first){
          first.orderStatus = '2';  // 約定済

          arr.push(first);
         
          // 注文タイプ　→　1:通常, 2:IFD, 3:OCO, 4:IFDOCO, 5:BUNDLE, 6:TRAIL, 7:LOSSCUT, 8:SQ決済
          // 仕切り区分　→　0:新規, 1:決済（仕切り）
          if(orderKeys[1]){            
            var secound:IResOrderItem = this.findOrder(orderKeys[1]);
            // Logger.system.info(secound);
            if(secound){
              if( first.orderType == '3' || (first.orderType == '4' && first.settleType == '1') ){
                // 2次注文
                secound.orderStatus = '3'; // 取消済
              }else{
                secound.orderStatus = '2'; // 約定済
              }
              arr.push(secound);
            }
          }
        }
      }
    }

    // Logger.system.info(arr);
    // Logger.system.info("upateOrderStatusEx ---- end");
    return arr;
  }    

  private updateOrderItem(orders:IEventOrder[]){
    var arr = [];

    if( orders ){
      orders.forEach(odr=>{
        var order:IResOrderItem = this.findOrder(odr.orderKey);

        if(order){
          var keys = Object.keys(order);
          
          keys.forEach(key=>{
            /**
             * イベント配信時クライアント動作定義.xlsxの「イベント配信一覧」Sheet 参考。
             * ■ 注意事項
             *  ・注文一覧マージの際は、cfdOrders[x].losscutRateが存在しないイベント通知を考慮する必要あり（基本的にはnullをつめておけばよい想定）
             */
            if(key == 'lossCutRate'){
              if(odr.lossCutRate){
                order[key] = odr[key];
              }
              else {
                order[key] = undefined;
              }
            }
            else if(key == 'trailPrice') {
              if(odr.trailPrice){
                order[key] = odr[key];
              }
            }            
            else if(key == 'positionKeyList') {
            }
            else{
              order[key] = odr[key];
            }
          }) 

          arr.push(order);
        }
      });
    }

    return arr;
  }

  private updateOrderItemForTrail(orders:IEventOrder[]){
    var arr = [];

    if( orders ){
      orders.forEach(odr=>{
        var order:IResOrderItem = this.findOrder(odr.orderKey);

        if(order){
          var keys = Object.keys(order);
          
          keys.forEach(key=>{
            /**
             * イベント配信時クライアント動作定義.xlsxの「イベント配信一覧」Sheet 参考。
             * ■ 注意事項
             *  ・注文一覧マージの際は、cfdOrders[x].losscutRateが存在しないイベント通知を考慮する必要あり（基本的にはnullをつめておけばよい想定）
             */
            if(key == 'lossCutRate'){
              if(odr.lossCutRate){
                order[key] = odr[key];
              }
            }
            else if(key == 'positionKeyList') {
            }
            else{
              if(odr[key])
                order[key] = odr[key];
            }
          });
          if(odr.trailPrice) {
            order['trailPrice'] = odr.trailPrice;
          }                    

          arr.push(order);
        }
      });
    }

    return arr;
  }  

  private findOrder(orderKey){
    return this.orders.result.orderList.find(odr=>odr.orderKey==orderKey);
  }

  private findOrderByPositionKey(positionKey){
    for( let odr of this.orders.result.orderList as IResOrderItem[] ){
      if(odr.positionKeyList){
        for( let key of odr.positionKeyList ){
          if(key == positionKey){
            return odr;
          }
        }
      }
    }
    return null;
  }

  // event-order to order-list item
  private convertOrderItems(orders:IEventOrder[], positions:IEventPosition[]){
    var result = [];

    if( orders ){
      orders.forEach(odr=>{
        var item = this.convertOrderItem(odr);
        result.push(item);
      });
    }

    if(positions) { // 決済注文の場合positionkey入れる
      let positionKeyList = [];
      positions.forEach(item=>{
        positionKeyList.push(item.positionKey);        
      });
      result.forEach(order=>{
        order.positionKeyList = positionKeyList;
      }); 
    }

    return result;
  }

  private templateOrderItem():IResOrderItem{
    return {
      orderKey:undefined,          // 注文キー 
      cfdProductCode:undefined,    // 銘柄コード
      buySellType:undefined,       // 売買区分
      settleType:undefined,        // 仕切区分
      executionType:undefined,     // 執行区分
      orderType:undefined,         // 注文方式
      orderPrice:undefined,        // 注文価格
      orderQuantity:undefined,     // 注文数量
      trailWidth:undefined,        // トレール幅
      trailPrice:undefined,        // トレール価格
      invalidDateType:undefined,   // 有効期限
      invalidDatetime:undefined,   // 有効期限
      orderDatetime:undefined,     // 注文日時
      orderStatus:undefined,       // 注文ステータス
      orderJointId:undefined,      // 連結ID
      losscutRate:undefined,       // ロスカットレート
      allowedSlippage:undefined,   // 許容スリッページ
      positionKeyList:undefined,  // ポジションキーリスト
      //   {positionKey:undefined}    // ポジションキー 
      // ]      
    }
  }

  // convert IEventOrder to IOrderListItem
  private convertOrderItem( order:IEventOrder ){
    var item = this.templateOrderItem();
    var keys = Object.keys(item);

    keys.forEach(key=>{
      item[key] = order[key];
    })

    return item;
  }
}