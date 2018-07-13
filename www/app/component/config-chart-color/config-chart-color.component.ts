/**
 * 
 * 設定：チャート色
 * 
 */
import { Component, OnInit, ElementRef, ChangeDetectorRef, Input } from '@angular/core';
import { PanelViewBase, ComponentViewBase, 
         PanelManageService, ResourceService, 
         CommonConst, Tooltips,
         IViewState, IViewData, ViewBase } from "../../core/common";

import { IConfigChartColor,IConfigChartColorSettings } from '../../core/configinterface';
import * as BusinessConst from '../../const/businessConst';

//-----------------------------------------------------------------------------
// COMPONENT : ConfigChartColorComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'config-chart-color',
  templateUrl: './config-chart-color.component.html',
  styleUrls: ['./config-chart-color.component.scss']
})
export class ConfigChartColorComponent extends ComponentViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(public panelMng:PanelManageService,
              public resource:ResourceService,
              public element: ElementRef,
              public changeRef:ChangeDetectorRef) {
    super(panelMng, element, changeRef);                
  }

  @Input('config')
  set config(val){
    this.chartColorSettings = val.chartColorSettings;
  }
  public chartColorSettings:IConfigChartColorSettings = {}; 
  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  public returnColorPickerHigh(type:string){
    let color = this.resource.defaultChartColorSetting();
    switch (type) {
      case "gridColor":
        this.chartColorSettings.gridColor = color.gridColor;
        break;
      case "positiveLineFillColor":
        this.chartColorSettings.positiveLineFillColor = color.positiveLineFillColor;
        break;
      case "hiddenLineFillColor":
        this.chartColorSettings.hiddenLineFillColor = color.hiddenLineFillColor;
        break;
      default:
        break;
    }
  }
}
