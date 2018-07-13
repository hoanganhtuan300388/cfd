/**
 *
 * 注文変更
 *
 */
import { Component, ElementRef, ChangeDetectorRef,ViewChild } from '@angular/core';
import { PanelManageService, PanelViewBase, IViewData, CommonEnum,BusinessService, ResourceService, CommonConst, Tooltips, StringUtil } from '../../../core/common';
import { Observable } from 'rxjs/Observable';
import { AskBidUnitComponent } from '../../../component/ask-bid-unit/ask-bid-unit.component';
import { MessageBox } from '../../../util/utils';
import { OrderModifyComponent } from '../../../component/order-modify/order-modify.component';
import { OrderSendButtonComponent } from '../../../component/order-sendButton/order-sendButton.component';
import { OrderModifyConfirmComponent} from '../../../component/order-modify-confirm/order-modify-confirm.component';
import { SymbolCfdComponent} from '../../../ctrls/symbol-cfd/symbol-cfd.component';
import { IReqOrderDetail, IResOrderDetail} from "../../../values/Values";
import { IReqProductDetail, IResProductDetail} from "../../../values/Values";
import { ERROR_CODE } from "../../../../../common/businessApi";
import * as values from "../../../values/Values";
import { IConfigOrderSettings } from '../../../core/configinterface'; // #2491
import { GetAttentionMessage } from '../../../util/commonUtil';

// #2565
import { ILayoutInfo } from "../../../values/Values";
import { DeepCopy } from '../../../util/commonUtil';
//

import { Messages, GetWarningMessage } from '../../../../../common/message'

//-----------------------------------------------------------------------------
// COMPONENT : Scr03020101Component
// ----------------------------------------------------------------------------
declare var $:any;  // for jquery
declare var moment:any;

const TITLE_MODIFY_ERR = "注文変更エラー";

@Component({
  selector: 'scr-03020101',
  templateUrl: './scr-03020101.component.html',
  styleUrls: ['./scr-03020101.component.scss']
})
export class Scr03020101Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
	private subscribeTick:any;

	@ViewChild('slider') slider: ElementRef;
	@ViewChild('askbid') componentAskBid: AskBidUnitComponent;
	@ViewChild('orderSendButton') componentorderSendButton: OrderSendButtonComponent;
  @ViewChild('orderModifyConfirm') componentorderModifyConfirm: OrderModifyConfirmComponent;
  @ViewChild('symbolCfd') componentsymbolCfd: SymbolCfdComponent
  @ViewChild('ordermodify') order_modify: OrderModifyComponent

  public productName;
  public productCode;
  public productInfo;
  public conversionBid;
  public hasAttentionMessage:boolean = false;
  public attentionMessage:string="";
  public priceValue: any;

  public losscutRange;
  public orderJointId: string;
  // public orderTitle;
  public orderTitletool;
  public orderInfos: any; // array type
  // public orderList = [];
  // public orderInfo: any = {};
  // public productDetail: any = {};
	public titleMouse;
	
	// #2448
	public isLoading:boolean = false; // loading
	public baseIdx:number;
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public element: ElementRef,
							 public business:BusinessService,
							 public resource: ResourceService,
               public changeRef:ChangeDetectorRef) {
    super( '03020101', screenMng, element, changeRef);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  protected initLayout(param:any){
    super.initLayout(param);
    console.log(param);
    if(param.layout && param.layout.option) {
      this.productCode = param.layout.productCode;
      this.orderInfos = param.layout.option.orderInfo;
			this.orderJointId = param.layout.option.orderJointId;
      if(param.layout.option.priceValue)
        this.priceValue = param.layout.option.priceValue;
      this.initScreen();
    }
    this.updateView();
	}

	public orderTimeSet(){
		// 有効期限
		if(this.order_modify.orderTime == '2'){
		 this.order_modify.orderTypeFlg1 = true;
		}else if(this.order_modify.orderTime == '3'){
			this.order_modify.orderTypeFlg1 = true;
			this.order_modify.orderTypeFlg2 = true;
		}else{
			this.order_modify.orderTypeFlg1 = false;
			this.order_modify.orderTypeFlg2 = false;
		}
		if(this.order_modify.orderTime2 == '2'){
		 this.order_modify.orderTypeFlg3 = true;
		}else if(this.order_modify.orderTime2 == '3'){
			this.order_modify.orderTypeFlg3 = true;
			this.order_modify.orderTypeFlg4 = true;
		}else{
			this.order_modify.orderTypeFlg3 = false;
			this.order_modify.orderTypeFlg4 = false;
		}
		
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

  private initScreen() {
    // set title
    this.productInfo = this.business.symbols.getSymbolInfo(this.productCode);
    this.productName = this.productInfo.meigaraSeiKanji;
		this.orderTitletool = "注文変更["+this.orderJointId.slice(-4) +"] "+ this.productName;
		this.baseIdx = Number(this.uniqueId.split("_")[2])*1000;
		this.order_modify.baseIdx = this.baseIdx;
		this.componentorderSendButton.baseIdx = this.baseIdx;
		this.setTitle("注文変更["+this.orderJointId.slice(-4) +"]", this.productName);
    this.setCodeInfo();
    this.setAttentionInfo();
		this.setOrderInfo();

		// #2490対応するため、「注文画面を残す」ボタンを表示させない
		this.componentorderSendButton.closeBoolean = false;

		// #2491
		// 注文基本設定情報
		let configOrder:IConfigOrderSettings = this.resource.config_order();
		// 確認省略を設定
		this.componentorderSendButton.isSkip  = configOrder.initConfirmOmit;
  }

  private setAttentionInfo() {
    let input = {cfdProductCode:this.productCode};
    this.business.getAttentionInfoList(input).subscribe(val=>{
      if(val.status == "0"){
				if(val.result.attentionProductList == null || val.result.attentionProductList.length ==0){
          this.hasAttentionMessage=false;
          this.attentionMessage = '';
          this.updateView();
				}else{
					this.attentionMessage = GetAttentionMessage(val.result.attentionProductList);
					this.hasAttentionMessage=true;
					this.updateView();
				}
      }
    });
	}
	
	private getHoldPrice(positionList, orderInfo){
		let qty = 0, price = 0, isMean = false;

		if(orderInfo.positionKeyList.length > 1){
			// 平均建単価
			for(let positionKey of orderInfo.positionKeyList){
				let positions = positionList.filter(f=>f.positionKey==positionKey);
				positions.forEach(pos=>{
					qty += pos.currentQuantity;
					price += (pos.currentQuantity * pos.quotationPrice);
				})
			}
      price = price / qty;
      let decP: number = StringUtil.getDecimalPCnt(this.productInfo.boUnit);
      price = Math.floor(price * Math.pow(10, decP)) / Math.pow(10, decP);
      // console.log(price);
			isMean = true;
		}else{
			let position = positionList.find(ele=>ele.positionKey == orderInfo.positionKeyList );
			price = position.quotationPrice ;
		}

		return {qty:qty, price:price, isMean:isMean};
	}

  private setOrderInfo() {
    let inputProductDetail: IReqProductDetail = {productCodes:this.productCode};
    let inputPosition: values.IReqPositionList = {listdataGetType:'ALL', pageCnt:200};
    let productDetail = this.business.getProductDetail(inputProductDetail);
    let positionList = this.business.getPositionList(inputPosition);

    if(this.orderInfos[0].positionKeyList && this.orderInfos[0].positionKeyList.length > 0){  // ポジションがある場合
      Observable.zip(productDetail, positionList).subscribe(
        val => {
          // for(let result of val){
          //   if(result.status != ERROR_CODE.OK){
          //     MessageBox.error({ message:result.message });
          //     return;
          //   }
          // }

          // productDetail error
          switch(val[0].status){
            // case ERROR_CODE.WARN:
            //   MessageBox.info({title:'ログインエラー', message:Messages.ERR_0002});
            //   return;
            case ERROR_CODE.NG:
              MessageBox.info({title:'ログインエラー', message:(Messages.ERR_0002 + '[CFDS0101T]')});
              return;
          }          

          // positionList error
          switch(val[1].status){
            case ERROR_CODE.WARN:
              MessageBox.info({title:'建玉一覧取得エラー', message:Messages.ERR_0001});
              break;
            case ERROR_CODE.NG:
              MessageBox.info({title:'建玉一覧取得エラー', message:(Messages.ERR_0001 + '[CFDS0801T]')});
              break;
          }

          // product detail
          let productDetail = val[0].result.productDetailList[0];
          this.order_modify.leverageRatio = productDetail.leverageRatio;
          this.order_modify.losscutRange = productDetail.losscutRange;
          this.losscutRange = productDetail.losscutRange;

          // positon data
          if(val[1].status == ERROR_CODE.OK) {
            let positionList = val[1].result.positionList;
            
            if(this.orderInfos[0]){
							let holdPrice = this.getHoldPrice(positionList, this.orderInfos[0]);
							this.order_modify.holdprice = holdPrice.price;
							this.order_modify.isMean = holdPrice.isMean;
            }
            if(this.orderInfos[1]){
              this.order_modify.holdprice2 = this.getHoldPrice(positionList, this.orderInfos[1]).price;
            }
          }
          else {  // position error
            this.order_modify.holdprice = 0;
            this.order_modify.holdprice2 = 0;
            this.order_modify.holdpriceTxt = '';
            this.order_modify.holdMargin = 0;
            this.order_modify.holdMargin2 = 0;
            this.order_modify.holdMarginTxt = '';
            this.order_modify.holdMargin2Txt = '';
          }

					this.order_modify.setModifyInfo(this.orderInfos, this.priceValue);
					this.componentAskBid.isExecMarket = (this.order_modify.executionType == "1");
					this.orderTimeSet();
					this.updateView();
        },
        err=>{
          switch(err.status) {
            case ERROR_CODE.NETWORK:
              MessageBox.info({title:'建玉一覧取得エラー', message:(Messages.ERR_0002 + '[CFDS0802C]')});
              break;
          }
        }
      );
    }
    else {
      productDetail.subscribe(
        val=>{
          if(val.status == '0'){ // OK
            let productDetail = val.result.productDetailList[0];
            this.order_modify.leverageRatio = productDetail.leverageRatio;
            this.order_modify.losscutRange = productDetail.losscutRange;
            this.losscutRange = productDetail.losscutRange;
						this.order_modify.setModifyInfo(this.orderInfos, this.priceValue);
						this.componentAskBid.isExecMarket = (this.order_modify.executionType == "1");
						this.orderTimeSet();
						this.updateView();
          }
        },
        err=>{
          console.error('03020101', err);
        }
      );
    }
  }

  public onClickOrderPrice(event:Event){
    let sellbuy = event["sellbuy"];
    let input = this.order_modify;
    let price: number = 0;
    if(sellbuy == CommonConst.BUY_TYPE_VAL){
      price = parseFloat(this.componentAskBid.ask);
    }
    else {
      price = parseFloat(this.componentAskBid.bid);
    }

		//if(this.order_modify.price)
		if (!this.order_modify.showDisableDiv) {
			this.order_modify.price = StringUtil.currency(price, this.productInfo.boUnit).replace(/,/g, '');
			this.order_modify.priceBorder = false;
		}
    //if(this.order_modify.price2)
		this.order_modify.price2 = StringUtil.currency(price, this.productInfo.boUnit).replace(/,/g, '');
		this.order_modify.price2Border = false;
    //if(this.order_modify.price3)
		this.order_modify.price3 = StringUtil.currency(price, this.productInfo.boUnit).replace(/,/g, '');
		this.order_modify.price3Border = false;
    this.order_modify.marginCalc();
    this.order_modify.holdMarginCalc();
    this.order_modify.holdMarginCalcOco();
		this.onErrorDismiss();
    this.updateView();
  }
  // public title(){
  // 	return this.orderTitle;
  // }
  public titleMouseEvent(event:Event){
  	this.titleMouse = event["titleMouse"];
  	this.updateView();
	}

  public onNavBtnClick( tabName:string, event:Event){
    var side = event as any as string;
    this.onCanvasBoolean();

    if(side != 'CLOSE'){
    	this.orderErrMessage();
    }

    if(!this.componentorderSendButton.errCanvas){
      if( tabName == 'INPUT'){
        if( side == 'CONFIRM' ){
        	this.orderConfirm();
					$(this.slider.nativeElement).carousel("next");
					this.componentAskBid.isReadonly = true;
        }else if(side == 'ORDER'){
        	this.orderSendSelect();
        }else{
        	this.frameClose();
        }
      }else if( tabName = 'CONFIRM' ){
        if( side == 'GO' ){
        	this.orderSendSelect();
        }else if( side == 'BACK' ){
					$(this.slider.nativeElement).carousel("prev");
					this.componentAskBid.isReadonly = null;
        }
      }
    }
  }

  public frameClose(){
    this.updateView();
    this.close();
  }

  public orderSendSelect(){
		this.isLoading = true;
    this.componentorderSendButton.errCanvas =false;

    if(this.order_modify.orderType =="1"){
    	if(this.order_modify.settleType =="0"){
    		this.orderModifySingle("new");
    	}else{
    		this.orderModifySingle("settle");
    	}
    }else if(this.order_modify.orderType =="6"){
    	this.orderModifySingle("trail");
    }else if(this.order_modify.orderType =="2"){
    	this.orderModifySingle("ifd");
    }else if(this.order_modify.orderType =="3"){
    	if(this.order_modify.settleType =="0"){
    		this.orderModifySingle("oco");
    	}else{
    		this.orderModifySingle("ocosettle");
    	}      
    }else if(this.order_modify.orderType =="4"){
    	this.orderModifySingle("ifdoco");
    }
	}

  public orderModifySingle(orderName){
  	var input:values.IReqChangeOrder;
		if(orderName =="new"){
			input= {
				orderJointId:this.orderJointId,
				orderPriceNew:this.order_modify.price.toString(),
				invalidDateNew:this.order_modify.orderTime
			}
			if(this.order_modify.autoType == "2" ){
				input.losscutRate = this.order_modify.losscut.toString();
			}
		}else if(orderName =="settle"){
			input= {
					orderJointId:this.orderJointId,
					orderPriceSettle:this.order_modify.price.toString(),
					invalidDateSettle:this.order_modify.orderTime,
			}
		}else if(orderName =="trail"){
			input= {
					orderJointId:this.orderJointId,
					invalidDateSettle:this.order_modify.orderTime,
					trailWidth:this.order_modify.trailWidth,
			}
			if(this.order_modify.trailing ==false){
				input.orderPriceSettle = this.order_modify.price.toString();
			}
		}else if(orderName =="ifd"){
			input= {
					orderJointId:this.orderJointId,
					orderPriceSettle:this.order_modify.price2.toString(),
					invalidDateSettle:this.order_modify.orderTime2.toString(),
			}

			if(this.order_modify.orderStatus != "2"){ // 約定済み
				input.orderPriceNew = this.order_modify.price.toString();
				input.invalidDateNew = this.order_modify.orderTime;
			}

			if(this.order_modify.autoType == "2" ){
				input.losscutRate = 	this.order_modify.losscut.toString();
			}

		}else if(orderName =="oco"){
			input= {
				orderJointId:this.orderJointId,
				orderPriceSettle:this.order_modify.price.toString(),
				orderPriceOcoStop:this.order_modify.price2.toString(),
				invalidDateNew:this.order_modify.orderTime,
			}

			if(this.order_modify.autoType == "2" ){
				input.losscutRate = 	this.order_modify.losscut.toString();
				input.losscutRateOcoStop = 	this.order_modify.losscut2.toString();
			}

		}else if(orderName =="ocosettle"){
			input= {
				orderJointId:this.orderJointId,
				orderPriceSettle:this.order_modify.price.toString(),
				orderPriceOcoStop:this.order_modify.price2.toString(),
				invalidDateSettle:this.order_modify.orderTime,
			}
		}else if(orderName =="ifdoco"){
			input= {
				orderJointId:this.orderJointId,
				orderPriceSettle:this.order_modify.price2.toString(),
				orderPriceOcoStop:this.order_modify.price3.toString(),
				invalidDateSettle:this.order_modify.orderTime2.toString(),
			}

			if(this.order_modify.orderStatus != "2"){ // 約定済み
				input.orderPriceNew = this.order_modify.price.toString();
				input.invalidDateNew = this.order_modify.orderTime;
			}

			if(this.order_modify.autoType == "2" ){
				input.losscutRate = 	this.order_modify.losscut.toString();
			}
		}

    // console.log(input);
		this.business.changeOrder(input).subscribe(val=>{
	  	if(val.status == ERROR_CODE.OK){
				MessageBox.info({title:"注文変更完了", message:"注文変更が完了しました。\n[注文番号]" + this.orderJointId.substring(this.orderJointId.length -4,this.orderJointId.length)},
					() => this.frameClose()
				);
	  	} else if (val.status == ERROR_CODE.NG) {
				MessageBox.error({title:TITLE_MODIFY_ERR, message:Messages.ERR_0001 + '[CFDS4001T]'},
				　　() => this.backToModifyPanel())
	  	} else if (val.status == ERROR_CODE.WARN) {
			  MessageBox.warning({title:TITLE_MODIFY_ERR, message:GetWarningMessage(val.clientInfoMessage)}, () => this.backToModifyPanel());
			}
    },
		err => {
			if (err.status == ERROR_CODE.NETWORK) {
				MessageBox.error({title:TITLE_MODIFY_ERR, message:Messages.ERR_0053 + '[CFDS4002C]'}, () => this.backToModifyPanel());
			}
		});
	}
	
	public backToModifyPanel() {
		// 確認省略チェックオフの場合
		if (!this.componentorderSendButton.isSkip) {
			this.componentorderModifyConfirm.onNavBtnClick("BACK");
		}
		this.isLoading = false;
		this.updateView();
	}

  public orderErrMessage(){
  	let error = this.componentorderSendButton;
  	let modify = this.order_modify;

  	error.errMessage ="未入力の項目があります。";

		if(modify.orderType == "1" || modify.orderType == "6" || modify.orderType == "5"){

			if(modify.price ==null || modify.price ==undefined || modify.price.toString() ==""){
				modify.priceMessage ="注文価格を入力してください。";
				error.errCanvas =true;
				modify.priceBorder =true;
			}else if(modify.price <this.productInfo.boUnit  ){
				modify.priceMessage ="注文価格は"+this.productInfo.boUnit+"以上の値を入力してください。";
				error.errCanvas =true;
				modify.priceBorder =true;
			}else if(isNaN(modify.price)){
				modify.priceMessage ="注文価格を正しく入力してください。";
				error.errCanvas =true;
				modify.priceBorder =true;
			}

			if(modify.autoType=="2" && (isNaN(modify.losscut) ||!Number(modify.losscut) || modify.losscut.length==0)){
				error.errCanvas =true;
				modify.losscutBorder =true;
			}

			if(modify.orderType == "6"){
				if(modify.trailWidth ==null || modify.trailWidth ==undefined || modify.trailWidth.toString() ==""){
					modify.trailWidthMessage ="トレール幅を入力してください。";
					error.errCanvas =true;
					modify.trailWidthBorder =true;
				}else if(modify.trailWidth <5){
					modify.trailWidthMessage ="トレール幅は5以上の値を入力してください。";
					error.errCanvas =true;
					modify.trailWidthBorder =true;
				}
			}
			if(this.isEmptyStr(modify.orderTime)){
				error.errCanvas =true;
				modify.orderTimeBorder =true;
			}
	  }else{
			if(modify.orderType =="2"){
				if(modify.price==null || modify.price ==undefined || modify.price.toString() ==""){
					modify.priceMessage ="注文価格を入力してください。";
					error.errCanvas =true;
					modify.priceBorder =true;
				}else if( modify.price <this.productInfo.boUnit){
					modify.priceMessage ="注文価格は"+this.productInfo.boUnit+"以上の値を入力してください。";
					error.errCanvas =true;
					modify.priceBorder =true;
				}else if(isNaN(modify.price)){
					modify.priceMessage ="注文価格を正しく入力してください。";
					error.errCanvas =true;
					modify.priceBorder =true;
				}
				if(modify.price2==null || modify.price2 ==undefined || modify.price2.toString() ==""){
					modify.price2Message ="注文価格を入力してください。";
					error.errCanvas =true;
					modify.price2Border =true;
				}else if( modify.price2 <this.productInfo.boUnit){
					modify.price2Message ="注文価格は"+this.productInfo.boUnit+"以上の値を入力してください。";
					error.errCanvas =true;
					modify.price2Border =true;
				}else if(isNaN(modify.price2)){
					modify.price2Message ="注文価格を正しく入力してください。";
					error.errCanvas =true;
					modify.price2Border =true;
				}
				if(this.isEmptyStr(modify.orderTime)){
					error.errCanvas =true;
					modify.orderTimeBorder =true;
				}
				if(this.isEmptyStr(modify.orderTime2)){
					error.errCanvas =true;
					modify.orderTime2Border =true;
				}
				if(modify.settleType=="0" && modify.orderStatus!="2"){
					if(modify.autoType=="2" && (isNaN(modify.losscut) || !Number(modify.losscut) || modify.losscut.length==0)){
						error.errCanvas =true;
						modify.losscutBorder =true;
					}
				}
			}else if(modify.orderType =="3"){
				if(modify.price==null || modify.price ===undefined || modify.price.toString() ==""){
					modify.priceMessage ="注文価格を入力してください。";
					error.errCanvas =true;
					modify.priceBorder =true;
				}else if(modify.price <this.productInfo.boUnit){
					modify.priceMessage ="注文価格は"+this.productInfo.boUnit+"以上の値を入力してください。";
					error.errCanvas =true;
					modify.priceBorder =true;
				}else if(isNaN(modify.price)){
					modify.priceMessage ="注文価格を正しく入力してください。";
					error.errCanvas =true;
					modify.priceBorder =true;
				}

				if(modify.price2==null || modify.price2 ===undefined || modify.price2.toString() ==""){
					modify.price2Message ="注文価格を入力してください。";
					error.errCanvas =true;
					modify.price2Border =true;
				}else if(modify.price2 <this.productInfo.boUnit){
					modify.price2Message ="注文価格は"+this.productInfo.boUnit+"以上の値を入力してください。";
					error.errCanvas =true;
					modify.price2Border =true;
				}else if(isNaN(modify.price2)){
					modify.price2Message ="注文価格を正しく入力してください。";
					error.errCanvas =true;
					modify.price2Border =true;
				}

				if(this.isEmptyStr(modify.orderTime)){
					error.errCanvas =true;
					modify.orderTimeBorder =true;
				}
				if(modify.settleType=="0" && modify.autoType == "2"){
					if(isNaN(modify.losscut) || !Number(modify.losscut) || modify.losscut.length==0){
						error.errCanvas =true;
						modify.losscutBorder =true;
					}
					if(isNaN(modify.losscut2) || !Number(modify.losscut2) || modify.losscut2.length==0){
						error.errCanvas =true;
						modify.losscut2Border =true;
					}
				}
			}else{
				if(modify.price==null || modify.price ===undefined || modify.price.toString() ==""){
					modify.priceMessage ="注文価格を入力してください。";
					error.errCanvas =true;
					modify.priceBorder =true;
				}else if(modify.price <this.productInfo.boUnit){
					modify.priceMessage ="注文価格は"+this.productInfo.boUnit+"以上の値を入力してください。";
					error.errCanvas =true;
					modify.priceBorder =true;
				}else if(isNaN(modify.price)){
					modify.priceMessage ="注文価格を正しく入力してください。";
					error.errCanvas =true;
					modify.priceBorder =true;
				}

				if(modify.price2==null || modify.price2 ===undefined || modify.price2.toString() ==""){
					modify.price2Message ="注文価格を入力してください。";
					error.errCanvas =true;
					modify.price2Border =true;
				}else if(modify.price2 <this.productInfo.boUnit){
					modify.price2Message ="注文価格は"+this.productInfo.boUnit+"以上の値を入力してください。";
					error.errCanvas =true;
					modify.price2Border =true;
				}else if(isNaN(modify.price2)){
					modify.price2Message ="注文価格を正しく入力してください。";
					error.errCanvas =true;
					modify.price2Border =true;
				}

				if(modify.price3==null || modify.price3 ===undefined || modify.price3.toString() ==""){
					modify.price3Message ="注文価格を入力してください。";
					error.errCanvas =true;
					modify.price3Border =true;
				}else if(modify.price3 <this.productInfo.boUnit){
					modify.price3Message ="注文価格は"+this.productInfo.boUnit+"以上の値を入力してください。";
					error.errCanvas =true;
					modify.price3Border =true;
				}else if(isNaN(modify.price3)){
					modify.price3Message ="注文価格を正しく入力してください。";
					error.errCanvas =true;
					modify.price3Border =true;
				}
				if(this.isEmptyStr(modify.orderTime)){
					error.errCanvas =true;
					modify.orderTimeBorder =true;
				}
				if(this.isEmptyStr(modify.orderTime2)){
					error.errCanvas =true;
					modify.orderTime2Border =true;
				}
				if(modify.autoType=="2" && (isNaN(modify.losscut) || !Number(modify.losscut) || modify.losscut.length==0)){
					error.errCanvas =true;
					modify.losscutBorder =true;
				}
			}
	  }
	}
	
	public isEmptyStr(value) {
		if (value == null || value == undefined || value == "") {
			return true;
		}
	}

  public orderConfirm(){
    let confirm = this.componentorderModifyConfirm;
    let modify = this.order_modify;
		confirm.orderType = modify.orderType;

    /* set same height both modify panel and confirm panel */
    const contentHeight = $(modify.element.nativeElement).find('.panel-body-content').height();
    $(confirm.element.nativeElement).find('.panel-body-content.panel-body-content-border').height(contentHeight);

		confirm.tradeUnit = this.productInfo.tradeUnit;

    if(modify.orderType == "1" || modify.orderType == "6" || modify.orderType == "5"){
			confirm.orderchooice = "single";

      if(modify.executionType=="1"){
        confirm.settleName = "成行";
      }else if(modify.executionType=="2"){
      	confirm.settleName = "指値";
      }else{
      	confirm.settleName = "逆指値";
			}

			confirm.settleType = modify.settleType;
      confirm.executionName = modify.settleType=="0"?"新規":"決済";
      confirm.executionType = modify.executionType;
      confirm.sellbuy = modify.buySellType=="1"?"売":"買";
      confirm.sellbuyClass = modify.buySellType;
      confirm.qty = modify.qty;
			if(this.order_modify.trailing ==false){
        confirm.price = StringUtil.currency(modify.price, this.productInfo.boUnit);
			}else{
				confirm.price = modify.trailPrice2;
			}
      confirm.losscut = modify.autoType=="1"?"自動":StringUtil.currency(modify.losscut, this.productInfo.boUnit);
			confirm.trailPrice = modify.trailWidth;

    	if(modify.orderTime=="1"){
        confirm.orderTime = "当日";
      }else if(modify.orderTime=="2"){
      	confirm.orderTime = "週末";
      }else{
      	confirm.orderTime = "翌週末";
      }
  	}else if(modify.orderType == "2"){
      confirm.orderchooice = "ifd";
			confirm.settleType = modify.settleType;
  		confirm.executionName = modify.settleType=="0"?"新規":"決済";
  		//confirm.losscut = modify.autoType=="1"?"自動":modify.losscut;
			confirm.losscut = modify.autoType=="1"?"自動":StringUtil.currency(modify.losscut, this.productInfo.boUnit);
  		confirm.sellbuy = modify.buySellType=="1"?"売":"買";
  		confirm.sellbuy2 = modify.buySellType=="1"?"買":"売";
      confirm.sellbuyClass = modify.buySellType;
  		confirm.qty = modify.qty;
  		confirm.qty2 = modify.qty2;
      confirm.price = StringUtil.currency(modify.price, this.productInfo.boUnit);
      confirm.price2 = StringUtil.currency(modify.price2, this.productInfo.boUnit);

    	if(modify.executionType=="1"){
        confirm.settleName = "成行";
      }else if(modify.executionType=="2"){
      	confirm.settleName = "指値";
      }else{
      	confirm.settleName = "逆指値";
      }

    	if(modify.executionType2=="1"){
        confirm.settleName2 = "成行";
      }else if(modify.executionType2=="2"){
      	confirm.settleName2 = "指値";
      }else{
      	confirm.settleName2 = "逆指値";
      }
  		if(modify.orderTime=="1"){
        confirm.orderTime = "当日";
      }else if(modify.orderTime=="2"){
      	confirm.orderTime = "週末";
      }else{
      	confirm.orderTime = "翌週末";
      }
  		if(modify.orderTime2=="1"){
        confirm.orderTime2 = "当日";
      }else if(modify.orderTime2=="2"){
      	confirm.orderTime2 = "週末";
      }else{
      	confirm.orderTime2 = "翌週末";
      }
    }else if(modify.orderType == "3"){
      confirm.orderchooice = "oco";
			confirm.executionName = modify.settleType=="0"?"新規":"決済";
			confirm.sellbuy = modify.buySellType=="1"?"売":"買";
			confirm.settleType = modify.settleType;
			confirm.sellbuyClass = modify.buySellType;
			confirm.autoType = modify.autoType;
			if(modify.autoType =="1"){
				confirm.losscut3 = "自動";
			}else{
				confirm.losscut3 = "指定";
			}
      confirm.losscut = StringUtil.currency(modify.losscut, this.productInfo.boUnit);
  		confirm.qty = modify.qty;
      confirm.price = StringUtil.currency(modify.price, this.productInfo.boUnit);
  		confirm.price2 = StringUtil.currency(modify.price2, this.productInfo.boUnit);
  		confirm.losscut2 = StringUtil.currency(modify.losscut2, this.productInfo.boUnit);
  		if(modify.orderTime=="1"){
        confirm.orderTime = "当日";
      }else if(modify.orderTime=="2"){
      	confirm.orderTime = "週末";
      }else{
      	confirm.orderTime = "翌週末";
      }
    }else if(modify.orderType == "4"){
      confirm.orderchooice = "ifdoco";
			confirm.losscut = modify.autoType=="1"?"自動":StringUtil.currency(modify.losscut, this.productInfo.boUnit);
  		confirm.executionName = modify.settleType=="0"?"新規":"決済";
  		confirm.sellbuy = modify.buySellType=="1"?"売":"買";
  		confirm.sellbuy2 = modify.buySellType=="1"?"買":"売";
      confirm.sellbuyClass = modify.buySellType;
  		confirm.qty = modify.qty;
  		confirm.qty2 = modify.qty2;
      confirm.price = StringUtil.currency(modify.price, this.productInfo.boUnit);
  		confirm.price2 = StringUtil.currency(modify.price2, this.productInfo.boUnit);
  		confirm.price3 = StringUtil.currency(modify.price3, this.productInfo.boUnit);
			confirm.settleType = modify.settleType;
    	if(modify.executionType=="1"){
        confirm.settleName = "成行";
      }else if(modify.executionType=="2"){
      	confirm.settleName = "指値";
      }else{
      	confirm.settleName = "逆指値";
      }
  		if(modify.orderTime=="1"){
        confirm.orderTime = "当日";
      }else if(modify.orderTime=="2"){
      	confirm.orderTime = "週末";
      }else{
      	confirm.orderTime = "翌週末";
      }
  		if(modify.orderTime2=="1"){
        confirm.orderTime2 = "当日";
      }else if(modify.orderTime2=="2"){
      	confirm.orderTime2 = "週末";
      }else{
      	confirm.orderTime2 = "翌週末";
      }
    }

		this.updateView();
	}

  public onCanvasBoolean(){
		this.order_modify.priceBorder = false;
		this.order_modify.price2Border = false;
		this.order_modify.price3Border = false;
		this.order_modify.trailWidthBorder = false;
		this.order_modify.orderTimeBorder = false;
		this.order_modify.orderTime2Border = false;
		this.order_modify.losscutBorder = false;
		this.order_modify.losscut2Border = false;
		this.componentorderSendButton.errCanvas = false;
	}

  public close(){
    super.close();
	}

  public setCodeInfo() {
    this.order_modify.tradeUnit = this.productInfo.tradeUnit;
    this.order_modify.boUnit = this.productInfo.boUnit;
    this.order_modify.productInfo = this.productInfo;

    this.componentAskBid.productList = this.productInfo;
    this.componentAskBid.currency = this.productInfo.currency;

    if(this.order_modify.boUnit >=1 ){
    	this.order_modify.priceMax = 999999;
    }else if(this.order_modify.boUnit ==0.1 ){
    	this.order_modify.priceMax = 99999.9;
    }else if(this.order_modify.boUnit ==0.01  ){
    	this.order_modify.priceMax = 9999.99;
    }else if(this.order_modify.boUnit ==0.001  ){
    	this.order_modify.priceMax = 999.999;
    }
    // close tick
    if( this.subscribeTick ){
      this.subscribeTick.unsubscribe();
    }

    this.business.getConversionRate().subscribe(val=>{
      for(let conversionRate of val.result.conversionRateList){
				if(conversionRate.currency == this.productInfo.currency){
					this.conversionBid = conversionRate.bid;
					this.order_modify.conversionBidUpdate(conversionRate.bid);
				}
      }
    });

    this.business.notifyer.conversionRate().subscribe(val=>{
      if(val.conversionRateList !=null){
				for(let conversionRateReal of val.conversionRateList){
						if(conversionRateReal.currency == this.productInfo.currency){
							this.conversionBid = conversionRateReal.bid;
							this.order_modify.conversionBidUpdate(conversionRateReal.bid);
						}
				}
      }
		});

    // open new tick
    var input = {productCodes:this.productCode};
    this.business.getPriceList(input).subscribe(val=>{
      if( val && val.result.priceList ){
        var price = val.result.priceList[0];

        // request real tick
        this.subscribeTick = this.business.symbols.tick(this.productCode).subscribe(val=>{
          this.componentAskBid.realUpdate(val);
					this.order_modify.priceUpdate(val);				
        });
				this.order_modify.priceUpdate(price);				
				this.componentAskBid.update(price);
      }
    })
	}
	
	public onErrorDismiss(){
		if (!this.order_modify.priceBorder &&
				!this.order_modify.price2Border &&
				!this.order_modify.price3Border &&
				!this.order_modify.trailWidthBorder &&
				!this.order_modify.orderTimeBorder &&
				!this.order_modify.orderTime2Border &&
				!this.order_modify.losscutBorder &&
				!this.order_modify.losscut2Border) {
			this.componentorderSendButton.errCanvas = false;
		}
	}

}
