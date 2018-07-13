import { Observable } from 'rxjs/Observable';
import { BusinessService } from "../service/business.service"
import { Deferred } from "../util/deferred";
import { CommonEnum, CommonConst } from '../core/common';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import * as values from '../values/values';
import * as commonApp from '../../../common/commonApp'

interface ISymbolRef{
  code:string;
  deffer:Deferred<any>;//<values.IResPositionList>
}

const electron = (window as any).electron;

/**----------------------------------------------------------------------------
 * 株用　
 *
 * 銘柄管理者
 ----------------------------------------------------------------------------*/
export class SymbolManage {
  private productList:values.IProductInfo[];
  
  public businessDate:string = ""; // #1301

  private priceRefList:ISymbolRef[] = [];

	//---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------	
  constructor( private business: BusinessService ) {
    this.getProductList();

    if(electron){
      electron.ipcRenderer.on( commonApp.IPC_SYMBOLE_DATA, (event, arg) => {
        this.onMessage(arg);
      });
    }
  }

  /**
   * 銘柄一覧取得
   */
  public getProductList():Observable<values.IProductInfo[]>{
    var subject = new Subject<values.IProductInfo[]>();

    if(this.productList){
      setTimeout(()=>{
        subject.next(this.productList);
        subject.complete();
      }, 100);
    }else{
      this.business.getProductList().subscribe(val=>{
        if( val.status == '0' ){
          this.productList = val.result.productList;
          this.businessDate = val.datetime; // #1301
          subject.next(this.productList);
          subject.complete();
        }
      });
    }

    return subject;
  }

  /**
   * 銘柄情報を返す。
   * 
   * @param code symbol code.
   */
  public getSymbolInfo(code:string):values.IProductInfo{
    return this.productList.find(ele=>ele.cfdProductCode == code );
  }

  public getBusinessDate():string {
    return this.businessDate;
  }

  public tick(code:string):Observable<values.IStreamPrice> {
    var ref = this.priceRefList.find(ele=>ele.code==code);

    if( ref ){
      // console.log( 'add price real ' + code );
      return ref.deffer;
    }
    
    return this.pushTick(code);
  }

  /**
   * 該当銘柄のプライス配信を登録する。
   * 
   * @param code : symbol code
   */
  private pushTick(code:string){
    var deffer = new Deferred<values.IStreamPrice>(true);
    var self = this;

    this.priceRefList.push({code:code, deffer:deffer});

    // requset subscribe
    deffer.event.on('subscribe',()=>{
      self.openTick(code);
    })

    // request unsubscribe
    deffer.event.on('unsubscribe',()=>{
      self.popTick(code);
      self.closeTick(code);
    })  

    return deffer;
  }

  /**
   * プライス配信を中止する。
   * 
   * @param code : symbol code
   */
  private popTick(code:string){
    for( var i=0; i< this.priceRefList.length; i++ ){
      var ref = this.priceRefList[i];
      if( ref.code == code ){
        this.priceRefList.splice( i, 1 );
        return;
      }
    }
  }

  private openTick(code:string){
    // console.log( 'open price real ' + code );
    
    if( electron ){
      electron.ipcRenderer.send( commonApp.IPC_SYMBOLE_OPEN, code );
    }
  }

  private closeTick(code:string){
    // console.log( 'close price real ' + code );
    
    if( electron ){
      electron.ipcRenderer.send( commonApp.IPC_SYMBOLE_CLOSE, code );
    }
  }

  private onMessage(data:any){
    if(data && Array.isArray(data) && data[1]){
      data[1].forEach((val)=>{
        this.update(val);
      })
    }
  }

  private update(tick:values.IStreamPrice){
    var sym = this.priceRefList.find((ele)=>ele.code == tick.cfdProductCode );

    if( sym ){
      sym.deffer.next(tick);
    }
  }
}

// /**----------------------------------------------------------------------------
//  * 株用
//  *
//  * 銘柄情報、時価、板データ管理
//  ----------------------------------------------------------------------------*/
// export class PriceData{
//     // 時価データ
//     tickPrice:TickPrice = null;

//     // 板データ
//     boardPrice:BoardPrice = null;

//     /**
//      *
//      * @param market ：市場コード
//      * @param symbol ：銘柄コード
//      * @param business： BusinessService
//      */
//     constructor( public priceType:number, public market:string, public symbol:string, business: BusinessService ){
//         if(priceType == CommonEnum.giveMePrice.BOTH) {
//             this.tickPrice = new TickPrice(business, market, symbol);
//             this.boardPrice = new BoardPrice(business, market, symbol);
//         }
//         else if(priceType == CommonEnum.giveMePrice.TICK) { // only tick
//             this.tickPrice = new TickPrice(business, market, symbol);
//         }
//         else {  // only board
//             this.boardPrice = new BoardPrice(business, market, symbol);
//         }
//     }

//     public addTickData(business: BusinessService){
//         this.tickPrice = new TickPrice(business, this.market, this.symbol);
//     }

//     public addBoardData(business: BusinessService){
//         this.boardPrice = new BoardPrice(business, this.market, this.symbol);
//     }

//     /**
//      *
//      */
//     public clearPrice(): boolean {
//         if(!this.tickPrice.unSubscribe()) {
//             this.tickPrice = null;
//         }

//         if(!this.boardPrice.unSubscribe()) {
//             this.boardPrice = null;
//         }

//         if(!this.tickPrice && !this.boardPrice) {   // nobody is here
//             return true;
//         }

//         return false;   // please dont delete me
//     }

//     public clearTickPrice(): boolean {
//         if(!this.tickPrice.unSubscribe()) {
//             this.tickPrice = null;
//             return (this.boardPrice)? false: true;;    // please delete me
//         }

//         return false;   // please dont delete me
//     }

//     public clearBoardPrice(): boolean {
//         if(!this.boardPrice.unSubscribe()) {
//             this.boardPrice = null;
//             return (this.tickPrice)? false: true;;    // please delete me
//         }

//         return false;   // please dont delete me
//     }
// }

// /**
//  *
//  */
// export class SubscribeBase<T>{
//     deferred:Deferred<T> = new Deferred<T>();
//     data:any={};

//     private refCount:number = 0;
//     protected subscription: Subscription ;

//     constructor(){
//     }

//     // start subscribe
//     public subscribe():Observable<T>{
//         if( this.refCount == 0 ){
//             this.reqSubscribe();
//         }
//         this.refCount++;
//         return this.deferred.asObservable();
//     }

//     // end subscribe
//     public unSubscribe():number {
//         this.refCount--;
//         if( this.refCount <= 0 ){
//             this.clear()
//         }
//         return this.refCount;
//     }

//     // notice subscriber
//     protected sendNotice(){
//         this.deferred.next(this.data);
//     }

//     protected reqSubscribe(){}
//     protected clear(){}
// }

// /**
//  * 時価データ
//  */
// export class TickPrice extends SubscribeBase<any>{
 
//     constructor(private business: BusinessService,
//                 private market:string, 
//                 private symbol:string)
//     {
//         super();
//     }

//     /**
//      * Tick 配信要求
//      *
//      */
//     protected reqSubscribe(){
  
//     }

//     /**
//      * Tick 配信中止要求
//      *
//      */
//     protected clear(){
//     }
// }

// /**
//  * 板データ
//  */
// export class BoardPrice extends SubscribeBase<any>{

//     constructor(private business: BusinessService,
//                 private market:string, 
//                 private symbol:string) 
//     {
//         super();
//     }

//     /**
//      * 板データ 配信要求
//      *
//      */
//     protected reqSubscribe(){
     
//     }

//     /**
//      * 板データ 配信中止要求
//      *
//      */
//     protected clear(){
//     }
// }
