/**
 *
 * 売買最良気配
 *
 */
import { Component, OnInit, Output, EventEmitter,ElementRef, ChangeDetectorRef, Input } from '@angular/core';
import { ComponentViewBase,
         PanelManageService, ResourceService,
         CommonConst, Tooltips,
         IViewState, IViewData ,ViewBase,StringUtil } from "../../core/common";
import * as values from "../../values/Values";
import { IConfigDisplaySettings } from "../../core/configinterface";

//-----------------------------------------------------------------------------
// COMPONENT : AskBidUnitComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'ask-bid-unit',
  templateUrl: './ask-bid-unit.component.html',
  styleUrls: ['./ask-bid-unit.component.scss']
})
export class AskBidUnitComponent extends ComponentViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  public ask:string;
  public bid:string;
	public askBlink:boolean=false;
	public bidBlink:boolean=false;
  public spread:any;
  public beforAsk:string;
  public beforBid:string;
  public productList:values.IProductInfo;
  public currency:string;
  public isDisabled:boolean = false;
  public priceId:string;
  public arrowSell:string ="icon-rateup";
  public arrowBuy:string ="icon-ratedown";
  public isSpeedOrder:boolean = false;
  public timeout= null;
  public btnAsk = null;
  public btnBid = null;

  public validFlag;
  public isReadonly:boolean;
  public isExecMarket:boolean = true; // 注文タイプが成行であるかフラグ
  // public panelhidden : boolean = false;

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  @Output()
  changed = new EventEmitter();

  constructor(public panelMng:PanelManageService,
              public resource:ResourceService,
              public changeRef:ChangeDetectorRef,
              public element: ElementRef) {
    super(panelMng, element, changeRef);

    //getPriceList

  }

  @Input('speed-order')
  set speedOrder(flg){
    this.isSpeedOrder = flg;
    if (flg) {
      this.arrowSell ="icon-rateup speed-order";
      this.arrowBuy ="icon-ratedown speed-order";
    }
  }

  @Input('validFlag')
  set show(flg) {
    this.validFlag = flg;
  }

  // @Input('panelData')
  // set pricedisabled(flg) {
  //   this.panelhidden = flg.panelhidden;
  //   this.isDisabled = flg.isPriceDisabled;
  // }
  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  ngAfterViewInit(){
    this.btnAsk = $(this.element.nativeElement).find(".button-order-ask");
    this.btnBid = $(this.element.nativeElement).find(".button-order-bid");
  }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  public update(price:values.IResPrice){
    this.validFlag = price.validFlag;
    this.ask =price.ask;
    this.bid =price.bid;
    
    if(this.validFlag == '1'){
      if(this.ask =="" || this.ask == undefined){
        this.validFlag = '0';
      }

      if(this.bid =="" || this.bid == undefined){
        this.validFlag = '0';
      }
    }

    let format = StringUtil.getBoUnitFormat(this.productList.boUnit,false);

    this.ask = StringUtil.formatNumber(parseFloat(price.ask), format);
    this.bid = StringUtil.formatNumber(parseFloat(price.bid), format);
    this.spread = parseFloat(this.ask) -parseFloat(this.bid);
    this.spread = StringUtil.formatNumber(this.spread, format);
    
    this.currency = this.productList.currency;

    if(price.bidChange == '-1'){
      this.arrowSell = "icon-ratedown" + (this.isSpeedOrder ? ' speed-order' : '');
    }else if(price.bidChange == '1'){
    	this.arrowSell = "icon-rateup" + (this.isSpeedOrder ? ' speed-order' : '');
    }
    if(price.askChange == '-1'){
      this.arrowBuy = "icon-ratedown" + (this.isSpeedOrder ? ' speed-order' : '');
    }else if(price.askChange == '1'){
    	this.arrowBuy = "icon-rateup" + (this.isSpeedOrder ? ' speed-order' : '');
    }

    this.priceId = price.priceId;

    this.updateView();
  }

  public realUpdate(price:values.IStreamPrice){
      this.validFlag = price.validFlag;
      this.beforAsk = this.ask;
      this.beforBid = this.bid;
      this.priceId = price.priceId;

      if(this.validFlag == '1'){
        if(price.ask =="" || price.ask == undefined){
          this.validFlag = '0';
        }

        if(price.bid =="" || price.bid == undefined){
          this.validFlag = '0';
        }
      }
        
      let format = StringUtil.getBoUnitFormat(this.productList.boUnit,false);
      this.ask = StringUtil.formatNumber(parseFloat(price.ask), format);
      this.bid = StringUtil.formatNumber(parseFloat(price.bid), format);
      this.spread = parseFloat(this.ask) -parseFloat(this.bid);      
      
      this.spread = StringUtil.formatNumber(this.spread, format);

      this.timeout = true;

      if(this.beforAsk < this.ask){
        this.arrowBuy = "icon-rateup" + (this.isSpeedOrder ? ' speed-order' : '');
        if(this.isNeedBlink()){
          this.btnAsk.removeClass("button-up-blink");
          this.btnAsk.removeClass("button-down-blink");
          setTimeout(()=>{this.btnAsk.addClass("button-up-blink")},0);
        }
      }else if(this.beforAsk > this.ask){
        this.arrowBuy = "icon-ratedown" + (this.isSpeedOrder ? ' speed-order' : '');
        if(this.isNeedBlink()){
          this.btnAsk.removeClass("button-up-blink");
          this.btnAsk.removeClass("button-down-blink");
          setTimeout(()=>{this.btnAsk.addClass("button-down-blink")},0);
        }
      }

      if(this.beforBid < this.bid){
        this.arrowSell = "icon-rateup" + (this.isSpeedOrder ? ' speed-order' : '');
        if(this.isNeedBlink()){
          this.btnBid.removeClass("button-up-blink");
          this.btnBid.removeClass("button-down-blink");
          setTimeout(()=>{this.btnBid.addClass("button-up-blink")},0); 
        }
      }else if(this.beforBid > this.bid){
        this.arrowSell = "icon-ratedown" + (this.isSpeedOrder ? ' speed-order' : '');
        if(this.isNeedBlink()){   
          this.btnBid.removeClass("button-up-blink");
          this.btnBid.removeClass("button-down-blink");
          setTimeout(()=>{this.btnBid.addClass("button-down-blink")},0); 
        }
      }

      this.updateView();    
  }
  

  public orderSender( val ){
      var event = document.createEvent('Event');
      event["sellbuy"] = val;
      
      this.changed.emit(event);
  }

  public isNeedBlink() {
    let configDisplay: IConfigDisplaySettings = this.resource.config_display();
    if (configDisplay.priceFlashing == "on" && !this.isSpeedOrder && this.validFlag == '1') {
      return true;
    }
    return false;
  }
}
