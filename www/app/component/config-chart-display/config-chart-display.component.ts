/**
 * 
 * 設定：チャート表示
 * 
 */
import { Component, OnInit, ElementRef, ChangeDetectorRef, Input } from '@angular/core';
import { PanelViewBase, ComponentViewBase, 
         PanelManageService, ResourceService, 
         CommonConst, Tooltips,
         IViewState, IViewData, ViewBase } from "../../core/common";

import { IConfigChartDisplay,IConfigChartDisplaySettings } from '../../core/configinterface';
import * as BusinessConst from '../../const/businessConst';

//-----------------------------------------------------------------------------
// COMPONENT : ConfigChartDisplayComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'config-chart-display',
  templateUrl: './config-chart-display.component.html',
  styleUrls: ['./config-chart-display.component.scss']
})
export class ConfigChartDisplayComponent extends ComponentViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------

  @Input('config')
  set config(val){
    this.chartSettings = val.chartSettings;
  }
  public chartSettings:IConfigChartDisplaySettings = {}; 

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(public panelMng:PanelManageService,
              public resource:ResourceService,
              public element: ElementRef,
              public changeRef:ChangeDetectorRef) {
    super(panelMng, element, changeRef);                
  }

  public timeTypeList = [
    { value: "0", text: "ティック" },
    { value: "1", text: "1分足" },
    { value: "2", text: "5分足" },
    { value: "3", text: "10分足" },
    { value: "4", text: "15分足" },
    { value: "5", text: "30分足" },
    { value: "6", text: "60分足" },
    { value: "7", text: "2時間足" },
    { value: "8", text: "4時間足" },
    { value: "9", text: "6時間足" },
    { value: "10", text: "8時間足" },
    { value: "11", text: "日足" },
    { value: "12", text: "週足" },
    { value: "13", text: "月足" },
  ];
  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  public onChangedFootType(event:Event){
    this.chartSettings.initFoot = event['selected'];
  }

  /**
   * symbol changed event handler
   * 
   * @param event 
   */
  public onChangedSymbol(event:Event){
    var symbol = event["selected"];

    if(symbol){
      this.chartSettings.initProduct = symbol.symbolCode;
    }
  }    
}
