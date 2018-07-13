/**
 * 
 * 設定：注文
 * 
 */
import { Component, OnInit, ElementRef, ChangeDetectorRef, Input } from '@angular/core';
import { PanelViewBase, ComponentViewBase, 
         PanelManageService, ResourceService, 
         CommonConst, Tooltips,
         IViewState, IViewData, ViewBase } from "../../core/common";

import { IConfigOrder, IConfigOrderSettings } from '../../core/configinterface';
import * as BusinessConst from '../../const/businessConst';

declare var $:any;

//-----------------------------------------------------------------------------
// COMPONENT : ConfigOrderComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'config-order',
  templateUrl: './config-order.component.html',
  styleUrls: ['./config-order.component.scss']
})
export class ConfigOrderComponent extends ComponentViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  @Input('config')
  set config(val){
    this.orderSettings = val.orderSettings;
  }
  public orderSettings:IConfigOrderSettings = {};
  // public _config:IConfigOrder={};

  // public symbol='0';
  // public symbolSpeed='0';
  // public symbolList = [
  //   { value: "0", text: "ﾄﾞﾝﾌｪﾝ･ﾓｰﾀｰ･ｸﾞﾙｰﾌﾟ（東風汽車集団）" },
  //   { value: "1", text: "日本226" },
  //   { value: "2", text: "日本227" },
  // ];

  public orderType = BusinessConst.OrderTypeList[0].value;
  public orderTypeList = BusinessConst.OrderTypeList;
  
  // public confirmOmit = true;        // 注文確認省略
  // public orderFormDisplay = true;   // 注文画面を残す
  // public setting={
  //   initPoroduct:'',			         // 初期注文銘柄
  //   initOrderType:'',              // 初期注文タイプ
  //   initConfirmOmit:'',            // 注文確認省略（on：チェック、off：解除）
  //   initOrderFormDisplay:'',       // 注文画面を残す（on：チェック、off：解除）
  //   initSpeedOrderProduct:'',      // スピード注文初期銘柄
  // };

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(public panelMng:PanelManageService,
              public resource:ResourceService,
              public element: ElementRef,
              public changeRef:ChangeDetectorRef) {
    super(panelMng, element, changeRef);
    
    // this.orderSettings = this.config.orderSettings;
  }


  	ngAfterViewInit() {
		setTimeout(()=>{
				// bootstrap material init.
				if( $ && $.material ){
					$.material.init();
				}
		},1);
	}
  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  
  public onChangedOrderType(event:Event){
    this.orderSettings.initOrderType = event['selected'];
  }

  /**
   * symbol changed event handler
   * 
   * @param event 
   */
  public onChangedSymbol(event:Event){
    var symbol = event["selected"];

    if(symbol){
      this.orderSettings.initProduct = symbol.symbolCode;
    }
  }  

  /**
   * symbol changed event handler
   * 
   * @param event 
   */
  public onChangedSymbolSpeed(event: any) {
    var symbol = event["selected"];

    if(symbol){
      this.orderSettings.initSpeedOrderProduct = symbol.symbolCode;
    }
  }
  
  // public updateConfig(){
  //   // this.config.orderSettings.initConfirmOmit = this.setting.initConfirmOmit;
  // }
}
