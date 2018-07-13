/**
 * 
 * 取消注文
 * 
 */
import { Component, ElementRef,ViewChild, ChangeDetectorRef } from '@angular/core';
import { MessageBox } from '../../../util/utils';
import { PanelManageService,BusinessService,ResourceService, PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips } from '../../../core/common';
import { OrderCancelComponent } from '../../../component/order-cancel/order-cancel.component';
import { AskBidUnitComponent } from '../../../component/ask-bid-unit/ask-bid-unit.component';
import * as values from "../../../values/Values";
import { GetAttentionMessage } from '../../../util/commonUtil';

declare var moment:any;

// #2565
import { ILayoutInfo } from "../../../values/Values";
import { DeepCopy } from '../../../util/commonUtil';
//

import { Messages, GetWarningMessage } from '../../../../../common/message';
import { ERROR_CODE } from "../../../../../common/businessApi";

const TITLE_CANCEL_ERR = "注文取消エラー";

//-----------------------------------------------------------------------------
// COMPONENT : Scr03020102Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03020102',
  templateUrl: './scr-03020102.component.html',
  styleUrls: ['./scr-03020102.component.scss']
})
export class Scr03020102Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
	public orderJointId = "";
	public productName;
	public productCode;
  public productList;
  public orderInfos: any; // #2565: array type
	
	public orderList = [];

	public hasAttentionMessage:boolean = false;
  public attentionMessage:string="";
	// public orderTitle:string ="注文取消";
  public orderTitletool:string ="";
  public titleMouse:boolean=false;
	
  public subscribeTick;
  
  // #2448
  public isLoading:boolean = false; // loading
  
	@ViewChild('orderCancel') order_cancel: OrderCancelComponent;
	@ViewChild('askbid') componentAskBid: AskBidUnitComponent;
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public element: ElementRef,
               public business:BusinessService,
               public resource: ResourceService,
               public changeRef:ChangeDetectorRef) {                 
    super( '03020102', screenMng, element, changeRef); 
  }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  ngOnInit() {
    super.ngOnInit();
  }

  protected initLayout(param:any){
    super.initLayout(param);
  
    if(!this.params || !this.params.layout || !this.params.layout.option ){
      return;
    }

    let layout = this.params.layout;

    this.orderJointId = layout.option.orderJointId?layout.option.orderJointId.toString():"";
    this.productCode = layout.productCode?layout.productCode.toString():"";

    this.orderInfos = layout.option.orderInfo; // #2565

    this.selectStcok(this.productCode);
    this.order_cancel.productCode = this.productCode;
    this.order_cancel.setCancelInfo(layout.option.orderInfo);
    
    let input = {cfdProductCode:this.productCode};
    this.business.getAttentionInfoList(input).subscribe(val=>{
      if(val.status == "0"){
        if(val.result.attentionProductList == null || val.result.attentionProductList.length ==0){
          this.hasAttentionMessage=false;
        }else{
          this.attentionMessage = GetAttentionMessage(val.result.attentionProductList);
          this.hasAttentionMessage=true;
          this.updateView();
        }
      }
    });

    this.componentAskBid.isReadonly = true;
    this.updateView();
  }

  // #2565
	public getLayoutInfo():ILayoutInfo {
		//
    let self = this;

		var result = super.getLayoutInfo();

		try {
			let layout:ILayoutInfo = result;
			layout.productCode = self.productCode;
			layout.option = {};
			layout.option.orderJointId = self.orderJointId;
      layout.option.orderInfo = [];
			if(self.orderInfos && self.orderInfos.length) {
				for(var ii = 0; ii < self.orderInfos.length; ii++) {
					let orderInfo:any = self.orderInfos[ii];
					if(orderInfo) {
						layout.option.orderInfo.push(DeepCopy(orderInfo));
					}
				}
			}
		}
		catch(e) {
			console.error(e);
		}

		//
		return(result);
	}
	//

  // public titleMouseEvent(event:Event){
  // 	this.titleMouse = event["titleMouse"]; 
  // 	this.updateView();
  // }
  
  public cancelOrder(nav){
    if(nav == 'GO'){
      this.isLoading = true;
      var input:values.IReqCancelOrder = {orderJointId:this.orderJointId};
      console.log(input);
      this.business.cancelOrder(input).subscribe(val=>{
        if(val.status == ERROR_CODE.OK){
          MessageBox.info({title:'注文取消完了', message:"注文取消が完了しました。\n[注文番号]"+this.orderJointId.substring(this.orderJointId.length -4,this.orderJointId.length)},
            () => {this.close()});
        } else if (val.status == ERROR_CODE.NG) {
          MessageBox.error({title:TITLE_CANCEL_ERR, message:Messages.ERR_0001 + '[CFDS4101T]'},
          　　() => this.backToCancelPanel())
        } else if (val.status == ERROR_CODE.WARN) {
          MessageBox.warning({title:TITLE_CANCEL_ERR, message:GetWarningMessage(val.clientInfoMessage)}, () => this.backToCancelPanel());
        }
      },
      err => {
        if (err.status == ERROR_CODE.NETWORK) {
          MessageBox.error({ title: TITLE_CANCEL_ERR, message: Messages.ERR_0053 + '[CFDS4102C]' }, () => this.backToCancelPanel());
        }
      });
    }else{
      this.close();
    }
  }

  public backToCancelPanel() {
    this.isLoading = false;
    this.updateView();
  }

  // public close(){
  //   super.close();
  // }

  public selectStcok(code ){
    let product =this.business.symbols.getSymbolInfo(this.productCode);
    
    this.order_cancel.tradeUnit = product.tradeUnit;
    this.componentAskBid.productList = product;
    this.componentAskBid.currency = product.currency;
    
    this.productName = product.meigaraSeiKanji;
    this.orderTitletool = "注文取消["+this.orderJointId.substring(this.orderJointId.length -4,this.orderJointId.length)+"] "+this.productName.toString();
    // this.subTitle = this.orderTitletool;

    this.setTitle("注文取消["+this.orderJointId.substring(this.orderJointId.length -4,this.orderJointId.length)+"]", this.productName.toString());     
        
    // close tick
    if( this.subscribeTick ){
      this.subscribeTick.unsubscribe();
    }

    // open new tick
    var input = {productCodes:code};
    this.business.getPriceList(input).subscribe(val=>{
      if( val && val.result.priceList ){
        var price = val.result.priceList[0];
        
        // request real tick
        this.subscribeTick = this.business.symbols.tick(code).subscribe(val=>{
          this.componentAskBid.realUpdate(val);
        });
        
        this.componentAskBid.update(price);
      }
    })
    
    this.updateView();
  }
}