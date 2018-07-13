import { Component, OnInit,Output,Input, EventEmitter, ElementRef, ChangeDetectorRef } from '@angular/core';
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
  selector: 'speed-order-qty',
  templateUrl: './speed-order-qty.component.html',
  styleUrls: ['./speed-order-qty.component.scss']
})
export class SpeedOrderQTYComponent extends ComponentViewBase  {
  public qty: any = 0;
  public resetQty : number;
  public minqty: number = 1;
  public maxqty: number = 999999;
	public allowqty;
  public productList:values.IProductInfo;
  public tradeUnit=0;
  
  public qtyBorder: boolean = false;
  public qtyTool: boolean = false;
  @Output()
  speedEventQty = new EventEmitter();
  @Output()
  onErrorDismiss = new EventEmitter();
  /*@Output()
  sendMessageEvent = new EventEmitter<any>();
*/

  qtyMessage: string;

  @Input('resetNum')
  set show(qty) {
    this.resetQty = qty;
  }

  constructor( public panelMng: PanelManageService,
               public business: BusinessService,
               public resource: ResourceService,
               public element: ElementRef,
               public changeRef:ChangeDetectorRef) {

    super(panelMng, element, changeRef);
    
  }

/*   public onInputEvent($event , inputname) {
    let updown;
    if($event.keyCode == 38 || ($event.wheelDeltaY && $event.wheelDeltaY > 0)) updown = 'UP';
    if($event.keyCode == 40 || ($event.wheelDeltaY && $event.wheelDeltaY < 0)) updown = 'DOWN';
    if(!updown) return;
    if(inputname=="qty"){
    	this.onclickQty($event,updown);
    }
  }
 
  public onclickQty(e, updown){  

      if(this.qty ==null || this.qty<0 ){
          this.qty =0;
      }
              
      if (updown === "UP")
        this.qty += 1;
      else
        this.qty -= 1;

      if (this.qty < 0)
        this.qty = 0;

      if (this.qty > 99999999999)
        this.qty = 99999999999;
      
      var event = document.createEvent('Event');
      event["errCanvas"] = false;
      this.speedEventQty.emit(event);
    } */

    //最適化作業
  public onclickUnitQty(e, unit) {
    if(this.qty ==null || this.qty<0 ){
      this.qty =0;
    }
    this.qty = Number(this.qty) + unit;
    
    if (this.qty > 999999)
      this.qty = 999999;
    
    if (this.qty < 0)
      this.qty = 0;

    // var event = document.createEvent('Event');
    // event["errCanvas"] = false;
    //this.speedEventQty.emit(event);
    
  }

  // maxlength check
  maxLengthCheck(evt, obj , unit) {
      let qtyC =0;
      qtyC = obj.qty + unit;
    var keycode = evt.charCode || evt.keyCode;
    
    if (keycode < 48 || keycode > 57 || qtyC > 9999999999 || qtyC <1) {
      return obj.qty;
    }else{
      return qtyC;      
    }

  }
  
  public setqty(){
    this.qtyTool = true;
    this.updateView();
  }
  
  public getqty(){
    this.qtyTool = false;
    this.updateView();
  }
  
  public onReset(){
    $(this.element.nativeElement).find(".finde").trigger("click");
    this.qty = this.resetQty;
  }

  public dismissError(errKbn) {
    this[errKbn] = false;
    this.onErrorDismiss.emit();
  }

}
