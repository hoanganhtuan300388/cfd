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
  selector: 'order-confirm',
  templateUrl: './order-confirm.component.html',
  styleUrls: ['./order-confirm.component.scss']
})
export class OrderConfirmComponent extends ComponentViewBase {
	
	public execType;
	public sellbuy;
	public sellbuyOco;
	public orderType;
	public orderTypeName;
	public qty;
	public tradeUnit;
	public allowqty;
	public orderTime;
  public qtyOco;
	public price;  
	public priceOco;
	public priceOco2;
	public orderTypeOco;
	public orderTimeOco;
	public orderchooice;
	
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
