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
  selector: 'order-sendButton',
  templateUrl: './order-sendButton.component.html',
  styleUrls: ['./order-sendButton.component.scss']
})
export class OrderSendButtonComponent extends ComponentViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
    public isSkip:boolean=false;
		public isClose:boolean=false;
	  public closeBoolean:boolean=true;
		public errMessage:string;
		public errCanvas:boolean=false;
		public buttonDisabled:boolean=false;
		
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
