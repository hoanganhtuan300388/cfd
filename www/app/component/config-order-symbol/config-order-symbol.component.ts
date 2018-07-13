/**
 * 
 * 設定：注文(銘柄別)
 * 
 */
import { Component, OnInit, ElementRef, ChangeDetectorRef, Input } from '@angular/core';
import { PanelViewBase, ComponentViewBase, 
         PanelManageService, ResourceService, BusinessService,
         CommonConst, Tooltips,
         IViewState, IViewData, ViewBase } from "../../core/common";

import { IConfigOrderProduct, IConfigOrderProductItem } from '../../core/configinterface';
import * as BusinessConst from '../../const/businessConst';
import * as values from "../../values/Values";

declare var $:any;

//-----------------------------------------------------------------------------
// COMPONENT : ConfigOrderSymbolComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'config-order-symbol',
  templateUrl: './config-order-symbol.component.html',
  styleUrls: ['./config-order-symbol.component.scss']
})
export class ConfigOrderSymbolComponent extends ComponentViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  @Input()
  public config:IConfigOrderProduct;

  // public symbol='0';
  // public symbolList = [
  //   { value: "0", text: "ﾄﾞﾝﾌｪﾝ･ﾓｰﾀｰ･ｸﾞﾙｰﾌﾟ（東風汽車集団）" },
  //   { value: "1", text: "日本226" },
  //   { value: "2", text: "日本227" },
  // ];
  // public qty:       number = 0; 
  // public slippage:  number = 0;
  // public trail:     number = 0; 
  // public speedqty:  number = 0; 
  // public speedslippage:   number = 0; 
  // public isMarketPrice:   boolean;

  public initProduct = BusinessConst.DefaultProductCode;
  public targetSetting:IConfigOrderProductItem = {};
  private productList:values.IProductInfo;
  public maxAllowSlippageValue:number;
  // public hasDecimal:boolean;
  public boUnit:number = 1;

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(public panelMng:PanelManageService,
              public resource:ResourceService,
              public business:BusinessService,
              public element: ElementRef,
              public changeRef:ChangeDetectorRef) {
    super(panelMng, element, changeRef);                
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  ngAfterViewInit() {
    let _self = this;
		setTimeout(()=>{
				// bootstrap material init.
				if( $ && $.material ){
					$.material.init();
				}
    },1);
    
    this.setProductInfo(this.initProduct);

    // $(this.element.nativeElement).find(".qty-input").keydown((e)=>{
    //   if (e.keyCode == 38 || e.keyCode == 40) {
    //     e.preventDefault();
    //     if (e.keyCode == 38) {
    //       this.onclickQty(e,"UP",'initOrderQuantity');
    //     } else
    //       this.onclickQty(e,"DOWN",'initOrderQuantity');
    //   }
    // })

    // $(this.element.nativeElement).find(".allowslippage-input").keydown((e)=>{
    //   if (e.keyCode == 38 || e.keyCode == 40) {
    //     e.preventDefault();
    //     if (e.keyCode == 38) {
    //       this.onclickQty(e,"UP",'initAllowSlippageValue');
    //     } else
    //       this.onclickQty(e,"DOWN",'initAllowSlippageValue');
    //   }
    // })

    // $(this.element.nativeElement).find(".trail-input").keydown((e)=>{
    //   if (e.keyCode == 38 || e.keyCode == 40) {
    //     e.preventDefault();
    //     if (e.keyCode == 38) {
    //       this.onclickQty(e,"UP",'initTrailValue');
    //     } else
    //       this.onclickQty(e,"DOWN",'initTrailValue');
    //   }
    // })

    // $(this.element.nativeElement).find(".speedorderqty-input").keydown((e)=>{
    //   if (e.keyCode == 38 || e.keyCode == 40) {
    //     e.preventDefault();
    //     if (e.keyCode == 38) {
    //       this.onclickQty(e,"UP",'initSpeedOrderQuantity');
    //     } else
    //       this.onclickQty(e,"DOWN",'initSpeedOrderQuantity');
    //   }
    // })

    // $(this.element.nativeElement).find(".speedorderallowslippage-input").keydown((e)=>{
    //   if (e.keyCode == 38 || e.keyCode == 40) {
    //     e.preventDefault();
    //     if (e.keyCode == 38) {
    //       this.onclickQty(e,"UP",'speedOrderAllowSlippageValue');
    //     } else
    //       this.onclickQty(e,"DOWN",'speedOrderAllowSlippageValue');
    //   }
    // })

    $(this.element.nativeElement).find(".input-box").blur(function(){
      if (!$(this).val()) {
        if ($(this).hasClass("qty-input")) {
          _self.targetSetting.initOrderQuantity = "";
        } else if ($(this).hasClass("allowslippage-input")) {
          _self.targetSetting.initAllowSlippageValue = "";
        } else if ($(this).hasClass("trail-input")) {
          _self.targetSetting.initTrailValue = "";
        } else if ($(this).hasClass("speedorderqty-input")) {
          _self.targetSetting.initSpeedOrderQuantity = "";
        } else if ($(this).hasClass("speedorderallowslippage-input")) {
          _self.targetSetting.speedOrderAllowSlippageValue = "";
        }
        _self.updateView();
      }
    })
	}

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------  
  // public onclickQty(e, updown, target){
  //   // var value = parseInt(this.targetSetting[target]);
  //   var value = parseFloat(this.targetSetting[target]);
  //   if (isNaN(value)) {
  //     value = 0;
  //   }
  //   switch (target) {
  //     case "initOrderQuantity":
  //     case "initSpeedOrderQuantity":
  //       value = updown=='UP'?(value+1):(value-1);
  //       if(value <= 0){
  //         value = 0;
  //       }
  //       if (value >= 999999) {
  //         value = 999999;
  //       }
  //       break;

  //     case "initTrailValue":
  //       value = updown=='UP'?(value+5):(value-5);
  //       if(value <= 0){
  //         value = 0;
  //       }
  //       if (value >= 999) {
  //         value = 999;
  //       }
  //       break;

  //     case "initAllowSlippageValue":
  //     case "speedOrderAllowSlippageValue":
  //       value = updown=='UP'?(value+this.productList.boUnit):(value-this.productList.boUnit);
  //       if(value <= 0){
  //         value = 0;
  //       }
  //       if (value >= Number(this.maxAllowSlippageValue)) {
  //         value = Number(this.maxAllowSlippageValue);
  //       }
  //       break;

  //     default:
  //       break;
  //   }

  //   this.targetSetting[target] = value.toString();

  //   this.updateView();
  // }

  /**
   * symbol changed event handler
   * 
   * @param event 
   */
  public onChangedSymbol(event:Event){
    var symbol = event["selected"];

    if(symbol){
      this.setProductInfo(symbol.symbolCode);
    }
  }  

  private setProductInfo(code:string){
    var info:IConfigOrderProductItem = this.config[code];
    
    if(!info){
      info = this.resource.defaultOrderProduct();
      this.config[code] = info;
    }

    this.targetSetting = info;
    this.productList =this.business.symbols.getSymbolInfo(code);
    this.boUnit = this.productList.boUnit

    this.maxAllowSlippageValue = this.productList.boUnit * 99;
    // 許容スリッページ値の最大値チェックのため廃止
    // this.maxAllowSlippageValue = parseFloat(this.maxAllowSlippageValue.toString().replace('0','9'));
  }
}
