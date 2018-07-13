import { Component, OnInit,Output, ChangeDetectorRef, EventEmitter, ElementRef } from '@angular/core';
/*import { PanelManageService, ComponentViewBase, ViewBase, IViewData, BusinessService,
         ResourceService, CommonConst, CommonEnum } from '../../core/common';*/
//import { iBoardPrice, iCodeInfo, iTickPrice } from '../../core/interface';

import { PanelViewBase, ComponentViewBase, 
    PanelManageService, ResourceService, BusinessService,
    CommonConst, Tooltips,
    IViewState, IViewData, ViewBase } from "../../core/common";
    import * as values from "../../values/Values";
//import { IReqSpeedAllSettleOrder, IResSpeedAllSettleOrder, IResSpeedOrder, IReqSpeedOrder } from "../../values/Values";

// for blink-element
const UP    = 2;    // up price
const DOWN  = 3;    // down price

@Component({
  selector: 'speed-order',
  templateUrl: './speed-order.component.html',
  styleUrls: ['./speed-order.component.scss']
})
export class SpeedOrderComponent extends ComponentViewBase  {
 
    
    public sellPrice:string ='0';
    public buyPrice:string='0';
    public sellGainLoss:string='0';
    public buyGainLoss:string='0';
    public sellValGaubLoss:string='0';
    public buyValGaubLoss:string='0';
		public sellBalance:string='0';
		public buyBalance:string='0';
    @Output()
    speedEvent = new EventEmitter();
  /*@Output()
  sendMessageEvent = new EventEmitter<any>();
*/
  constructor( public panelMng: PanelManageService,
               public business: BusinessService,
               public resource: ResourceService,
               public element: ElementRef,
               public changeRef:ChangeDetectorRef) {

    super(panelMng, element, changeRef);
    
  }

  public onOrderAllSettle(event:any){
      this.speedEvent.emit(event);
  }
}
