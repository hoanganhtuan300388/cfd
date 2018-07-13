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
  selector: 'order-modify-confirm',
  templateUrl: './order-modify-confirm.component.html',
  styleUrls: ['./order-modify-confirm.component.scss']
})
export class OrderModifyConfirmComponent extends ComponentViewBase {
	public settleType;
	public settleName;
	public settleName2;
	public sellbuy;
	public sellbuy2;
	public sellbuyClass;
	public executionName;
	public executionType;
	public qty;
	public qty2;
	public price;
	public price2;
	public price3;
	public losscut;
	public losscut2;
  public losscut3;
	public trailPrice;
	public orderTime;
	public orderTime2;
	public orderType;
  public orderchooice;
  public tradeUnit;
  public autoType;
  public trailPrice2;
  
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
