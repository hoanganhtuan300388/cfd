/**
 * 
 * 注文確認
 * 
 */
import { Component, OnInit, ElementRef, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { PanelViewBase, ComponentViewBase, 
         PanelManageService, ResourceService, 
         CommonConst, Tooltips,
         IViewState, IViewData, ViewBase } from "../../core/common";

//-----------------------------------------------------------------------------
// COMPONENT : OrderConfirmComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'settle-confirm',
  templateUrl: './settle-confirm.component.html',
  styleUrls: ['./settle-confirm.component.scss']
})
export class SettleConfirmComponent extends ComponentViewBase {
	
	public execType;
	public sellbuy;
	public sellbuyOco;
	public orderType;
	public trailqty
	public orderTypeName;
	public qty;
	public tradeUnit;
	public price;
	public allowedSlippage;
	public orderTime;
	public priceOco1;
	public priceOco2;
	public orderchooice;
	public isSave;
	public sellbuyClass;
	public execTypeClass;
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  @Output()
    onNavButtonClick = new EventEmitter<any>();   // go, back button click
  
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(public panelMng:PanelManageService,
              public resource:ResourceService,
              public element: ElementRef,
              public changeRef:ChangeDetectorRef) {
    super(panelMng, element, changeRef);                
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  public onNavBtnClick(val:string){
    this.onNavButtonClick.emit(val);
  }
}
