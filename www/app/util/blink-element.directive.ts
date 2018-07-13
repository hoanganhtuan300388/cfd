import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { ResourceService, PanelViewBase, CommonEnum } from '../core/common';
import { IConfigDisplay } from '../core/configinterface';

declare var $: any;
declare var _: any;

const UP    = 2;
const DOWN  = 3;
const CLOSE = 4;

// 点滅タイム(ms)
const TIME_COUNT  = 500;

@Directive({
  selector: '[blink-element]',
  exportAs: 'blinkElement'
}) 
export class BlinkElement implements OnInit {
  // previus price
  private prevData: any;

  @Input('blink-check')
  private _checkType:CommonEnum.blinkCheck;

  // constructor
  constructor(public element: ElementRef,
              public resource:ResourceService) {

  }

  /**
   *
   */
  ngOnInit(){

  }

  /**
   * 
   */
  @Input('blink-compare') 
  set blinkCompare( comp:any ){
    // switch( this._checkType ){
    //   // 現在値
    //   case CommonEnum.blinkCheck.PRICE:{
    //     BlinkElement.updatePrice(comp, this.element.nativeElement, this.resource.config );
    //   }
    //   break;

    //   // 前日比
    //   case CommonEnum.blinkCheck.CHANGE_RATE:{
    //     this.updateChangeRate(comp, this.resource.config);
    //   }
    //   break;

    //   // 評価損益
    //   case CommonEnum.blinkCheck.PROFITLOSS:{
    //     BlinkElement.updateProfitLoss(comp, this.element.nativeElement, this.resource.config );
    //   }
    //   break;

    //   // 気配数　増減
    //   case CommonEnum.blinkCheck.ASKBID_COUNT:{
    //     this.updateAskBidCount(comp, this.element.nativeElement, this.resource.config );
    //   }
    //   break;
    //   // 気配値　高安値
    //   case CommonEnum.blinkCheck.ASKBID_HIGHLOW:{
    //     this.updateAskBidHighLow(comp, this.element.nativeElement, this.resource.config );
    //   }
    //   break;
    // }
  }

  // blick current price
  static updatePrice(comp:any, element:HTMLElement, config:IConfigDisplay){
    //点滅の有無 1:有、2:無
    // if(config.common.tbBlinkColorSwitch == '1'){
    //   if(config.common.tbBlinkColorFormFlag == '1'){
    //     //点滅の形式 1:枠
    //     element.style.color = null;
    //     element.style.backgroundColor = BlinkElement.getPriceColor(comp, config);

    //     setTimeout(()=>{
    //       element.style.backgroundColor = null;
    //     },TIME_COUNT);
    //   }else{
    //     //点滅の形式 2:文字
    //     element.style.backgroundColor = null;
    //     element.style.color = BlinkElement.getPriceColor(comp, config);

    //     setTimeout(()=>{
    //       element.style.color = null;
    //     },TIME_COUNT);
    //   }
    // }
  }

  // blick change rate
  private updateChangeRate(comp:any, config:IConfigDisplay){
    this.element.nativeElement.style.color = BlinkElement.getChangeRateColor(comp, config);
  }

  // blick change rate
  static updateChangeRate(comp:any, element:HTMLElement, config:IConfigDisplay) {
    element.style.color = BlinkElement.getChangeRateColor(comp, config);
  }

  static updateProfitLoss(comp:any, element:HTMLElement, config:IConfigDisplay){
    element.style.color = BlinkElement.getProfitLossColor(comp,config);    
  }

  // color price
  static getPriceColor(comp:any, config:IConfigDisplay){
    var color;

    // if(comp == UP ){
    //   // 点滅カラーUP
    //   color = config.common.tbBlinkColorPickerUp;
    // }else if(comp == DOWN ){
    //   //点滅カラーDOWN
    //   color = config.common.tbBlinkColorPickerDown;
    // }

    return color
  }

  // color profit-loss
  static getProfitLossColor(comp:any, config:IConfigDisplay){
    var color;

    // if(comp > 0){
    //   // 評価損益カラープラス
    //   color = config.common.tbColorPickerValuationPlus;
    // }else if(comp < 0){
    //   // 評価損益カラーマイナス
    //   color = config.common.tbColorPickerValuationMinus;
    // }

    return color
  }

  // color change-rate
  static getChangeRateColor(comp:any, config:IConfigDisplay){
    var color = null;

    // if(comp > 0){
    //   // カラーUP
    //   color = config.common.tbColorPickerPlus;
    // }else if(comp < 0){
    //   // カラーDOWN
    //   color = config.common.tbColorPickerMinus;
    // }

    return color
  }  

  // color high-low 
  private getHighLowColor(flag:number, config:IConfigDisplay){
    var color = null;

    // if( flag == UP ){
    //   //当日高値より上
    //   color = config.order.tbColorPickerHigh;
    // }else if( flag == DOWN ){
    //   //当日安値より下
    //   color = config.order.tbColorPickerLow;
    // }else if( flag == CLOSE ){
    //   //前日終値
    //   color = config.order.tbColorPickerLast;
    // }

    return color
  }  

  /**
   * 気配数　増減
   * 気配数量の増減に合わせて色を変更する。
   * 板情報からターゲットの気配を検索。比較する。
   * 
   * 気配数上昇時：背景を「点滅カラーUP」で点滅。
   * 気配数下降時：背景を「点滅カラーDOWN」で点滅。
   * 
   * comp:any 
   *    .value : 検査対象気配
   *    .board : 気配値リスト
   * 
   * @param comp : 判定値
   * @param element 
   * @param config 
   */
  private updateAskBidCount(comp:any, element:HTMLElement, config:IConfigDisplay){
    if( comp && comp.value && comp.value.price && comp.board ){
      if(this.prevData && this.prevData.qty.qty == comp.value.qty.qty 
        && this.prevData.price.price == comp.value.price.price) return;
      var flg = UP;
      if(this.prevData) {
        flg = this.prevData.qty.qty > comp.value.qty.qty ? DOWN : UP;
      }
      this.prevData = comp.value;

      BlinkElement.updatePrice(flg, element, config);
    }
  }
  
  /**
   * 気配値　高安値
   * 
   * 当日高値より上の気配値 - 設定画面注文タブの気配値文字色「当日高値より上」の文字色にする。
   * 当日安値より下の気配値 - 設定画面注文タブの気配値文字色｢当日安値より下」の文字色にする。
   * 前日終値の気配値 - 設定画面注文タブの気配値文字色「前日終値」の文字色にする。
   * 
   * comp:any 
   *    .value : 検査対象気配
   *    .price : price snapshot info    
   * 
   * @param comp 
   * @param element 
   * @param config 
   */
  private updateAskBidHighLow(comp:any, element:HTMLElement, config:IConfigDisplay){
    if( comp && comp.value && comp.value.price && comp.price ){
      //気配値文字色  1：設定する、2：設定しない
      // if( this.resource.config.order.tbIndicativePrice == '1' ){
      //   var flg = 0;

      //   if( comp.price.lastClosePrice.price.price == comp.value.price.price ){
      //     // 前日終値の気配値
      //     flg = CLOSE;
      //   }else if( comp.price.highPrice.price.price < comp.value.price.price ){
      //     // 当日高値より上の気配値
      //     flg = UP;
      //   }else if( comp.price.lowPrice.price.price > comp.value.price.price ){
      //     // 当日安値より下の気配値
      //     flg = DOWN;
      //   }

      //   element.style.color = this.getHighLowColor(flg, config);
      // }
    }
  }
}
