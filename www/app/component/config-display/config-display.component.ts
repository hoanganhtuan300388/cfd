/**
 * 
 * 設定：表示
 * 
 */
import { Component, OnInit, ElementRef, ChangeDetectorRef, Input } from '@angular/core';
import { PanelViewBase, ComponentViewBase, 
         PanelManageService, ResourceService, 
         CommonConst, Tooltips,
         IViewState, IViewData, ViewBase } from "../../core/common";

import { IConfigDisplay,IConfigDisplaySettings } from '../../core/configinterface';
import * as BusinessConst from '../../const/businessConst';

//-----------------------------------------------------------------------------
// COMPONENT : ConfigDisplayComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'config-display',
  templateUrl: './config-display.component.html',
  styleUrls: ['./config-display.component.scss']
})
export class ConfigDisplayComponent extends ComponentViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  
  @Input('config')
  set config(val){
    this.displaySettings = val.displaySettings;
  }
  public displaySettings:IConfigDisplaySettings = {}; 
  

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(public panelMng:PanelManageService,
              public resource:ResourceService,
              public element: ElementRef,
              public changeRef:ChangeDetectorRef) {
    super(panelMng, element, changeRef);                
  }

  public Flashing:string="1";
  public DesktopNotice:string="1";
  public CloseSave:string="1";

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  public returnColorPickerHigh(){
    
  }
}
