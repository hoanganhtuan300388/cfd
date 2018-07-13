/**
 *
 * レート一覧：WatchList詳細
 *
 */
import { Component, OnInit, Output,ElementRef,EventEmitter, ChangeDetectorRef, Input } from '@angular/core';
import { PanelViewBase, ComponentViewBase,
         PanelManageService, ResourceService,
         CommonConst, Tooltips,
         IViewState, IViewData, ViewBase } from "../../core/common";

//-----------------------------------------------------------------------------
// COMPONENT : PriceWatchUnitComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'order-singleMulti',
  templateUrl: './order-singleMulti.component.html',
  styleUrls: ['./order-singleMulti.component.scss']
})
export class orderSingleMultiComponent extends ComponentViewBase{
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
    public orderSelect:string="";
    public singleMultiShow:boolean=true;
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(public panelMng:PanelManageService,
              public resource:ResourceService,
              public element: ElementRef,
              public changeRef:ChangeDetectorRef) {
    super(panelMng, element, changeRef);
  }
  @Output()
  singleMultiEvent = new EventEmitter();

  @Input('singleMultiShow')
  set show(val) {
    this.singleMultiShow = val;
  }
  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  public orderSingleMulti(){
      this.singleMultiEvent.emit(event);
  }
}
