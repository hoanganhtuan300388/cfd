/**
 *
 * 決済注文
 *
 */
import { Component, ElementRef,ViewChild, ChangeDetectorRef } from '@angular/core';
import { MessageBox } from '../../../util/utils';
import { PanelManageService, PanelViewBase,ResourceService,BusinessService, IViewData, CommonEnum, CommonConst, Tooltips, StringUtil } from '../../../core/common';
import { AskBidUnitComponent } from '../../../component/ask-bid-unit/ask-bid-unit.component';
import { orderSingleMultiComponent } from '../../../component/order-singleMulti/order-singleMulti.component';
import { SettleInputComponent } from '../../../component/settle-input/settle-input.component';
import { OrderSendButtonComponent } from '../../../component/order-sendButton/order-sendButton.component';
import { SettleConfirmComponent} from '../../../component/settle-confirm/settle-confirm.component';
import { SymbolCfdComponent} from '../../../ctrls/symbol-cfd/symbol-cfd.component';
import * as values from "../../../values/Values";
import { GetAttentionMessage } from '../../../util/commonUtil';
import { Messages, GetWarningMessage } from '../../../../../common/message'
import { ERROR_CODE } from "../../../../../common/businessApi";

// #2565
import { ILayoutInfo } from "../../../values/Values";
import { DeepCopy } from '../../../util/commonUtil';
//

//-----------------------------------------------------------------------------
// COMPONENT : Scr03020103Component
// ----------------------------------------------------------------------------
declare var $:any;  // for jquery
declare var moment:any;
@Component({
  selector: 'scr-03020103',
  templateUrl: './scr-03020103.component.html',
  styleUrls: ['./scr-03020103.component.scss']
})
export class Scr03020103Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
	private subscribeTick:any;

	@ViewChild('slider') slider: ElementRef;
	@ViewChild('askbid') componentAskBid: AskBidUnitComponent;
	@ViewChild('singleMulti') componentsingleMulti: orderSingleMultiComponent;
	@ViewChild('settleInput') componentsettleInput: SettleInputComponent;
	@ViewChild('orderSendButton') componentorderSendButton: OrderSendButtonComponent;
	@ViewChild('settleConfirm') componentsettleConfirm: SettleConfirmComponent;


	public symbol;
	public priceId:string;
	public productCode:string;
	public productName:string;
	public productList:values.IProductInfo;
	// public singleMultiBoolean:boolean=true;
	public conversionBid;
	public attentionText:string;
	public singleMultiShow:boolean = true;
	public hasAttentionMessage:boolean = false;
  public attentionMessage:string="";
	public isAll:boolean;
	public positionKey:string;
	public buySellType:string;
	// public orderTitle:string;
  public orderTitletool:string ="";
	public titleMouse:boolean=false;
	// #2448
  public isLoading:boolean = false; // loading

	public validFlag;

	public postionInfo:any; // #2565

	public baseIdx:number;
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
  						 public business:BusinessService,
               public element: ElementRef,
               public resource: ResourceService,
               public changeRef:ChangeDetectorRef) {
    super( '03020103', screenMng, element, changeRef);


	}

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  ngOnInit() {
		super.ngOnInit();
	}

	// #2565
	public getLayoutInfo():ILayoutInfo {
		//
    let self = this;

		var result = super.getLayoutInfo();

		try {
			let layout:ILayoutInfo = result;
			layout.productCode = self.productCode;
			if(self.postionInfo) {
				layout.option = DeepCopy(self.postionInfo);
			}
		}
		catch(e) {
			console.error(e);
		}

		//
		return(result);
	}
	//

	protected initLayout(param:any){
		super.initLayout(param);

		let postionInfo;
		let productCode;
		this.baseIdx = Number(this.uniqueId.split("_")[2])*1000;
		this.componentsettleInput.baseIdx = this.baseIdx;
		this.componentsingleMulti.baseIdx = this.baseIdx;
		this.componentorderSendButton.baseIdx = this.baseIdx;
		if( param && param.layout && param.layout.option ){
			postionInfo = param.layout.option;
			productCode = param.layout.productCode;

			this.postionInfo = postionInfo; // #2565
		}else{
			return;
    }

    this.productCode = productCode;
    
    this.productList =this.business.symbols.getSymbolInfo(this.productCode);
    this.componentsettleInput.maxAllow = 99*this.productList.boUnit;
    this.componentsettleInput.tradeUnit =this.productList.tradeUnit;
    this.componentsettleInput.boUnit =this.productList.boUnit;
    this.componentsettleInput.productList =this.productList;

    this.componentAskBid.productList = this.productList;
    this.componentAskBid.currency = this.productList.currency;    

    this.productName = postionInfo.productName;
    this.componentorderSendButton.closeBoolean = false;
    if(this.resource.config_order().initOrderType =="1" ||  // 通常注文
      this.resource.config_order().initOrderType =="2" ||
			this.resource.config_order().initOrderType =="3"){
      this.componentsettleInput.orderType =this.resource.config_order().initOrderType;
			this.componentsettleInput.onOrderType(this.componentsettleInput.orderType);
			this.componentsingleMulti.orderSelect ="1";
		}else if (this.resource.config_order().initOrderType == "4" ||
		  this.resource.config_order().initOrderType == "6") {
      this.componentsingleMulti.orderSelect ="1";
			this.componentsettleInput.orderType = "1";
			this.componentsettleInput.onOrderType(this.componentsettleInput.orderType);
		} else {
			this.componentsingleMulti.orderSelect ="2";
			this.componentsettleInput.orderType = CommonConst.ORDER_OCO;
			this.componentsettleInput.onOrderType(CommonConst.ORDER_OCO);
		}
		this.onSingleMulti();

		this.componentsettleInput.isAll =postionInfo.isAll;
		this.isAll=postionInfo.isAll;
		this.positionKey = postionInfo.positionKey.toString();
    this.buySellType =postionInfo.buySellType.toString();
    this.buySellType=="1"?this.componentsettleInput.buysellType="2":this.componentsettleInput.buysellType="1";
    let format = StringUtil.getBoUnitFormat(this.productList.boUnit,false);

		var inputPosition: values.IReqPositionList = {listdataGetType:'ALL', pageCnt:200};
    this.business.getPositionList(inputPosition).subscribe(val=>{
    	if(val.status =="0"){
    		let positionData : values.IResPositionInfo;
        let holdPriceTemp=0;
        this.componentsettleInput.holdqty = 0;
        this.componentsettleInput.holdqtying = 0;
        let decPCnt = StringUtil.getDecimalPCnt(this.productList.boUnit);
    		if(postionInfo.isAll){          
    			for(let position of val.result.positionList){
    				if(position.cfdProductCode == productCode.toString() && position.buySellType == postionInfo.buySellType.toString()){
    					this.componentsettleInput.holdqty += position.currentQuantity;
							this.componentsettleInput.holdqtying += (position.orderQuantity?position.orderQuantity:0);
          		holdPriceTemp += (position.currentQuantity * position.quotationPrice);
    				}    				
          }
          let avgTmp = Math.floor((holdPriceTemp / this.componentsettleInput.holdqty) * Math.pow(10, decPCnt)) / Math.pow(10, decPCnt);
          this.componentsettleInput.holdprice = StringUtil.formatNumber(avgTmp, format);
    			this.componentsettleInput.qty = this.componentsettleInput.holdqty -this.componentsettleInput.holdqtying;
    			this.componentsettleInput.maxqty =this.componentsettleInput.qty ;
    		}else{
    			positionData =val.result.positionList.find(ele=>ele.positionKey == postionInfo.positionKey.toString() );
      		this.componentsettleInput.holdqty = positionData.currentQuantity;
      		this.componentsettleInput.holdqtying = positionData.orderQuantity;
      		this.componentsettleInput.qty = positionData.currentQuantity - (positionData.orderQuantity?positionData.orderQuantity:0);
          this.componentsettleInput.maxqty =this.componentsettleInput.qty;
          this.componentsettleInput.holdprice = StringUtil.formatNumber(positionData.quotationPrice, format);
    		}
				let configOrderProduct:any = this.resource.config_orderProduct(this.productCode);
				if (configOrderProduct.initAllowSlippage == false) {
					this.componentsettleInput.allowedSlippage =  configOrderProduct.initAllowSlippageValue;
				}else{
          this.componentsettleInput.allowqty = null;
        }
        if (configOrderProduct.initTrailValue) {
          this.componentsettleInput.trailWidth =  configOrderProduct.initTrailValue;
        }
        else {
          this.componentsettleInput.trailWidth = undefined;
        }

    		this.selectStcok(productCode.toString());
      }
      else if(ERROR_CODE.WARN) {
        this.setBlankInfo();
        MessageBox.info({title:'建玉一覧取得エラー', message:Messages.ERR_0001});        
      }
      else if(ERROR_CODE.NG) {
        this.setBlankInfo();
        MessageBox.info({title:'建玉一覧取得エラー', message:(Messages.ERR_0001 + '[CFDS0801T]')});
      }
    },
    err=>{
      switch(err.status) {
        case ERROR_CODE.NETWORK:
          MessageBox.info({title:'建玉一覧取得エラー', message:(Messages.ERR_0002 + '[CFDS0802C]')});
          break;
      }
    }    
  );

    var input = {cfdProductCode: productCode.toString()};
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
      //attentionText
    });

		// #3286
		// 例外処理
		try {
			if(this.isAll){
				this.setTitle("決済注文[一括]", postionInfo.productName.toString());
				this.orderTitletool = "決済注文[一括] " + postionInfo.productName.toString();
			}else{
				this.setTitle("決済注文["+this.positionKey.substring(this.positionKey.length -4,this.positionKey.length)+"]", postionInfo.productName.toString());
				this.orderTitletool = "決済注文["+this.positionKey.substring(this.positionKey.length -4,this.positionKey.length)+"] "+postionInfo.productName.toString() ;
			}
			// this.subTitle = this.orderTitletool;
		}
		catch(e) {
			console.error(e);
		}
		//

    this.updateView();
	}

  ngOnDestroy(){
		super.ngOnDestroy();
    if( this.subscribeTick ){
      this.subscribeTick.unsubscribe();
    }

	}

  //---------------------------------------------------------------------------
  // members
  //---------------------------------------------------------------------------
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
        	this.singleMultiShow=false;
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
        	this.singleMultiShow=true;
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

  public orderErrMessage(){
		this.onCanvasBoolean();
  	let error = this.componentorderSendButton;
  	let input = this.componentsettleInput;

  	error.errMessage ="未入力の項目があります。";
  	if(input.singleMultiBoolean == true){

			if(!input.qty){
				error.errCanvas =true;
				input.qtyBorder =true;
				input.qtyMessage = Messages.ERR_0033;
			}else if(input.qty <1){
				error.errCanvas =true;
				input.qtyBorder =true;
				input.qtyMessage = Messages.ERR_0034;
			}

			if(input.orderType !="1"){
				if(this.isEmptyStr(input.price)){
					error.errCanvas =true;
					input.priceBorder =true;
					input.priceMessage = Messages.ERR_0035;
				}else if(this.productList.boUnit ==undefined || input.price <this.productList.boUnit  ){
					error.errCanvas =true;
					input.priceBorder =true;
					input.priceMessage = Messages.ERR_0037(this.productList.boUnit);
				}
				if(input.orderTime ==""){
					error.errCanvas =true;
					input.orderTimeBorder =true;
					input.orderTimeMessage = Messages.ERR_0039;
				}
			}

			if (input.orderType == "3" && input.isTrailStop) {
        if (this.isEmptyStr(input.trailWidth)) {
					error.errCanvas = true;
					input.trailBorder = true;
					input.trailMessage = "トレール幅を入力してください。"
				} else if (input.trailWidth < 5) {
					error.errCanvas = true;
					input.trailBorder = true;
          input.trailMessage = "トレール幅は5以上の値を入力してください。";
				}
			}
	  }else{
			if(!input.qty){
				error.errCanvas =true;
				input.qtyBorder =true;
				input.qtyMessage = Messages.ERR_0033;
			}else if(input.qty <1){
				error.errCanvas =true;
				input.qtyBorder =true;
				input.qtyMessage = Messages.ERR_0034;
			}

			if(this.isEmptyStr(input.priceOco1)){
				error.errCanvas =true;
				input.priceOco1Border =true;
				input.priceOco1Message = Messages.ERR_0035;
			}else if(this.productList.boUnit ==undefined || input.priceOco1 <this.productList.boUnit  ){
				error.errCanvas =true;
				input.priceOco1Border =true;
				input.priceOco1Message = Messages.ERR_0037(this.productList.boUnit);
			}

			if(this.isEmptyStr(input.priceOco2)){
				error.errCanvas =true;
				input.priceOco2Border =true;
				input.priceOco2Message = Messages.ERR_0035;
			}else if(this.productList.boUnit ==undefined || input.priceOco2 <this.productList.boUnit  ){
				error.errCanvas =true;
				input.priceOco2Border =true;
				input.priceOco2Message = Messages.ERR_0037(this.productList.boUnit);
			}
			if(input.orderTime ==""){
				error.errCanvas =true;
				input.orderTimeBorder =true;
				input.orderTimeMessage = Messages.ERR_0039;
			}
	  }
	}

	private isEmptyStr(value):boolean {
		if (value == undefined || value == null || value.length == 0) {
      return true;
		}
		return false;
	}

	public onCanvasBoolean(){
	  let input = this.componentsettleInput;

		input.qtyBorder=false;
		input.priceBorder=false;
		input.priceOco1Border=false;
		input.priceOco2Border=false;
		input.allowQtyBorder=false;
		input.orderTimeBorder=false;
		input.trailBorder=false;
		this.componentorderSendButton.errCanvas = false;
	}

  public orderConfirm(){
    let format = StringUtil.getBoUnitFormat(this.productList.boUnit,true);
		let confirm = this.componentsettleConfirm;
		let inputData = this.componentsettleInput;

    /* set same height both modify panel and confirm panel */
    const contentHeight = $(inputData.element.nativeElement).find('.panel-body-content').height();
    $(confirm.element.nativeElement).find('.panel-body-content.panel-body-content-border').height(contentHeight);

		confirm.orderchooice ="single";

		confirm.execType = inputData.execType=="0"?"新規":"決済";
		confirm.execTypeClass = inputData.execType;
		confirm.sellbuyClass = inputData.buysellType;
		confirm.sellbuy = inputData.buysellType=="1"?"売":"買";
		confirm.orderType = inputData.orderType;
		confirm.isSave =false;

		if(this.componentsettleInput.singleMultiBoolean == true){
			if(inputData.orderType=="1"){
				confirm.orderTypeName = "成行";
			}else if(inputData.orderType=="2"){
				confirm.orderTypeName = "指値";
			}else{
				confirm.isSave = inputData.isTrailStop;
				confirm.trailqty= inputData.trailWidth;
				confirm.orderTypeName = "逆指値";
			}
		}else{
			confirm.orderType ="4";
			confirm.orderTypeName ="OCO";
      confirm.priceOco1 = StringUtil.formatNumber(inputData.priceOco1, format);
			confirm.priceOco2 = StringUtil.formatNumber(inputData.priceOco2, format);
			confirm.orderchooice = "oco";
		}

		confirm.qty = StringUtil.Comma(inputData.qty);
		confirm.tradeUnit = this.productList.tradeUnit;
		confirm.price = StringUtil.formatNumber(inputData.price, format);

		if(inputData.allowedSlippage){
			confirm.allowedSlippage = StringUtil.Comma(inputData.allowedSlippage) + " 以内";			
		}else{
			confirm.allowedSlippage = "制限なし"
		}

		if(inputData.orderTime=="1"){
			confirm.orderTime = "当日";
		}else if(inputData.orderTime=="2"){
			confirm.orderTime = "週末";
		}else{
			confirm.orderTime = "翌週末";
		}

		this.updateView();
	}

  public orderSendSelect(){
		this.isLoading = true;
		if(this.componentsettleInput.singleMultiBoolean == true){
			this.singleOrderSend();
		}else{
			this.orderOcoSend();
		}
	}

  public singleOrderSend(){
   	var shite:values.ShiteiUmes = {
			positionKey:this.positionKey,
			orderQuantity:this.componentsettleInput.qty.toString()
		};

  	var input:values.IReqSingleOrder;
	  if(this.componentsettleInput.orderType =="1"){
	    if(this.isAll){
		  	input= {
					cfdProductCode:this.productCode,
					orderType:CommonConst.ORDER_NORMAL,
					buySellType:this.componentsettleInput.buysellType,
					settleType:'1',
					executionType:this.componentsettleInput.orderType,
					orderQuantity:this.componentsettleInput.qty.toString(),
					priceId:this.priceId,
					orderBidPrice:this.componentsettleInput.bidPrice.toString(),
          orderAskPrice:this.componentsettleInput.askPrice.toString(),
		    }
	    }else{
					input= {
					cfdProductCode:this.productCode,
					orderType:CommonConst.ORDER_NORMAL,
					buySellType:this.componentsettleInput.buysellType,
          settleType:'1',
          shiteiUmes:[shite],
					executionType:this.componentsettleInput.orderType,
					orderQuantity:this.componentsettleInput.qty.toString(),
					priceId:this.priceId,
					orderBidPrice:this.componentsettleInput.bidPrice.toString(),
          orderAskPrice:this.componentsettleInput.askPrice.toString(),
        }
      }
      if(this.componentsettleInput.allowedSlippage){
        input.allowedSlippage =  this.componentsettleInput.allowedSlippage.toString();
      }
	  }else if(this.componentsettleInput.orderType =="2"){
	    if(this.isAll){
		  	input= {
					cfdProductCode:this.productCode,
					orderType:CommonConst.ORDER_NORMAL,
					buySellType:this.componentsettleInput.buysellType,
					settleType:"1",
					executionType:this.componentsettleInput.orderType,
					orderQuantity:this.componentsettleInput.qty.toString(),
					orderPrice:this.componentsettleInput.price.toString(),
					invalidDate:this.componentsettleInput.orderTime.toString()
		    }
  	  }else{
	      input= {
					cfdProductCode:this.productCode,
					orderType:CommonConst.ORDER_NORMAL,
					buySellType:this.componentsettleInput.buysellType,
          settleType:"1",
          shiteiUmes:[shite],
					executionType:this.componentsettleInput.orderType,
					orderQuantity:this.componentsettleInput.qty.toString(),
					orderPrice:this.componentsettleInput.price.toString(),
          invalidDate:this.componentsettleInput.orderTime.toString()
		    }
	    }
	  }else{  // 逆指値
    	if(this.isAll){
		  	input= {
					cfdProductCode:this.productCode,
					orderType:CommonConst.ORDER_NORMAL,
					buySellType:this.componentsettleInput.buysellType,
					settleType:"1",
					executionType:this.componentsettleInput.orderType,
					orderQuantity:this.componentsettleInput.qty.toString(),
					orderPrice:this.componentsettleInput.price.toString(),
					invalidDate:this.componentsettleInput.orderTime.toString()
		    }
  	  }else{
	      input= {
					cfdProductCode:this.productCode,
					orderType:CommonConst.ORDER_NORMAL,
					buySellType:this.componentsettleInput.buysellType,
          settleType:"1",
          shiteiUmes:[shite],
					executionType:this.componentsettleInput.orderType,
					orderQuantity:this.componentsettleInput.qty.toString(),
					orderPrice:this.componentsettleInput.price.toString(),
					invalidDate:this.componentsettleInput.orderTime.toString()
        }
      }
      if(this.componentsettleInput.isTrailStop) {
        input.orderType = '6';  // 6:トレール
        input.trailWidth = this.componentsettleInput.trailWidth.toString();
      }
    }
    // console.log(input);
	  this.business.singleOrder(input).subscribe(val=>{
	  	if(val.status == ERROR_CODE.OK){
				MessageBox.info({title:Messages.STR_0014, message:Messages.STR_0016(val.result.orderJointId.substr(-4))},
					() => {
						this.frameClose();
					}
				);
	  	} else if (val.status == ERROR_CODE.NG) {
				MessageBox.error({title:Messages.STR_0015, message:Messages.ERR_0001 + '[CFDS3601T]'},
				  () => this.backToOrderInputPanel());
	  	} else if (val.status == ERROR_CODE.WARN) {
			  MessageBox.warning({title:Messages.STR_0015, message:GetWarningMessage(val.clientInfoMessage)}, () => this.backToOrderInputPanel());
			}
		},
		err => {
			if (err.status == ERROR_CODE.NETWORK) {
				MessageBox.error({ title: Messages.STR_0015, message: Messages.ERR_0052 + '[CFDS3602C]' }, () => this.backToOrderInputPanel());
			}
		});
	}

  public orderOcoSend(){
  	if(this.isAll){
      var input:values.IReqOcoOrder={
          cfdProductCode:this.productCode,
          orderType:CommonConst.ORDER_OCO,
          buySellType:this.componentsettleInput.buysellType,
          settleType:CommonConst.SETTLE_ORDER_VAL,
          orderQuantity:this.componentsettleInput.qty.toString(),
          orderPriceLimit:this.componentsettleInput.priceOco1.toString(),
          orderPriceStop:this.componentsettleInput.priceOco2.toString(),
          invalidDate:this.componentsettleInput.orderTime
     }
  	}else{
  		var shite:values.shiteiUmeParamList;
	    shite = {
	    		positionKey:this.positionKey,
	        orderQuantity:this.componentsettleInput.qty.toString()
	    };
  		var input:values.IReqOcoOrder={
          cfdProductCode:this.productCode,
          orderType:CommonConst.ORDER_OCO,
          buySellType:this.componentsettleInput.buysellType,
          settleType:CommonConst.SETTLE_ORDER_VAL,
          shiteiUmeParamList:[shite],
          orderQuantity:this.componentsettleInput.qty.toString(),
          orderPriceLimit:this.componentsettleInput.priceOco1.toString(),
          orderPriceStop:this.componentsettleInput.priceOco2.toString(),
          invalidDate:this.componentsettleInput.orderTime
     	}
    }

	  this.business.ocoOrder(input).subscribe(val=>{
	  	if(val.status == ERROR_CODE.OK){
				MessageBox.info({title:Messages.STR_0014, message:Messages.STR_0016(val.result.orderJointId.substr(-4))},
					() => {
						this.frameClose();
					}
				);
	  	} else if (val.status == ERROR_CODE.NG) {
				MessageBox.error({title:Messages.STR_0015, message:Messages.ERR_0001 + '[CFDS3901T]'},
				　　() => this.backToOrderInputPanel())
	  	} else if (val.status == ERROR_CODE.WARN) {
			  MessageBox.warning({title:Messages.STR_0015, message:GetWarningMessage(val.clientInfoMessage)}, () => this.backToOrderInputPanel());
			}
		},
		err => {
			if (err.status == ERROR_CODE.NETWORK) {
				MessageBox.error({ title: Messages.STR_0015, message: Messages.ERR_0052 + '[CFDS3902C]' }, () => this.backToOrderInputPanel());
			}
		});
	}
	
	private backToOrderInputPanel() {
		this.componentAskBid.isReadonly = null;
		if (!this.componentorderSendButton.isSkip) {
			this.componentsettleConfirm.onNavBtnClick("BACK");
			this.componentsingleMulti.singleMultiEvent.emit();
		}
		this.isLoading = false;
		this.updateView();
	}

  public setOrderPrice(event:Event){
		let sellbuy = event["sellbuy"];
		let input = this.componentsettleInput;
		if(sellbuy =="1"){
			if(this.componentsingleMulti.orderSelect =="1"){
				if(input.orderType =="2" || input.orderType =="3"){
					input.price = this.didAdjustPriceFormat(this.componentAskBid.bid);
					input.priceBorder = false;
				}
			}else{
				input.price = this.didAdjustPriceFormat(this.componentAskBid.bid);
				input.priceOco1 = this.didAdjustPriceFormat(this.componentAskBid.bid);
				input.priceOco2 = this.didAdjustPriceFormat(this.componentAskBid.bid);
				input.priceBorder = false;
				input.priceOco1Border = false;
				input.priceOco2Border = false;
			}
		}else{
			if(this.componentsingleMulti.orderSelect =="1"){
				if(input.orderType =="2" || input.orderType =="3"){
					input.price = this.didAdjustPriceFormat(this.componentAskBid.ask);
					input.priceBorder = false;
				}
			}else{
				input.price = this.didAdjustPriceFormat(this.componentAskBid.ask);
				input.priceOco1 = this.didAdjustPriceFormat(this.componentAskBid.ask);
				input.priceOco2 = this.didAdjustPriceFormat(this.componentAskBid.ask);
				input.priceBorder = false;
				input.priceOco1Border = false;
				input.priceOco2Border = false;
			}
    }
		// console.log(input.price);
		input.marginCalc();
		this.onErrorDismiss();
		this.updateView();
	}

	public didAdjustPriceFormat = (price:any, toNumber?:boolean) => {
		if(!price) {
			return(price);
		}

		if(toNumber) {
			return(parseFloat(price));
		}

		return(price);
	}

  public onSingleMulti(){
		if(this.componentsingleMulti.orderSelect =="1"){
			this.componentsettleInput.singleMultiBoolean = true;
			this.componentsettleInput.marginCalc();
      // bootstrap material init.
      setTimeout(function() {
        if( $ && $.material ){
          $.material.init();
        }          
      }, 10);			
		}else{
			this.componentsettleInput.singleMultiBoolean = false;
			this.componentsettleInput.marginCalc();
		}
		this.resetTransBtn();
		this.componentsettleInput.onErrClick.emit();
		this.updateView();
	}

  /**
   * symbol changed event handler
   *
   * @param event
   */
  public selectStcok(code ){

    if(this.componentsettleInput.boUnit >=1 ){
    	this.componentsettleInput.priceMax = 999999;
    }else if(this.componentsettleInput.boUnit ==0.1 ){
    	this.componentsettleInput.priceMax = 99999.9;
    }else if(this.componentsettleInput.boUnit ==0.01  ){
    	this.componentsettleInput.priceMax = 9999.99;
    }else if(this.componentsettleInput.boUnit ==0.001  ){
    	this.componentsettleInput.priceMax = 999.999;
    }

    if(this.componentsettleInput.boUnit >=1 ){
    	this.componentsettleInput.priceMin = 1;
    }else if(this.componentsettleInput.boUnit ==0.1 ){
    	this.componentsettleInput.priceMin = 0.1;
    }else if(this.componentsettleInput.boUnit ==0.01  ){
    	this.componentsettleInput.priceMin = 0.01;
    }else if(this.componentsettleInput.boUnit ==0.001  ){
    	this.componentsettleInput.priceMin = 0.001;
    }		

    // close tick
    if( this.subscribeTick ){
      this.subscribeTick.unsubscribe();
    }

    // open new tick
    var input = {productCodes:code};

    // get subscribe object
    this.business.getConversionRate().subscribe(val=>{
			for(let conversionRate of val.result.conversionRateList){
				if(conversionRate.currency == this.productList.currency){
					this.conversionBid = conversionRate.bid;
					this.componentsettleInput.conversionBidUpdate(conversionRate.bid);
				}
			}
		});

    this.business.notifyer.conversionRate().subscribe(val=>{
      if(val.conversionRateList !=null){
				for(let conversionRateReal of val.conversionRateList){
					if(conversionRateReal.currency == this.productList.currency){
						this.conversionBid = conversionRateReal.bid;
						this.componentsettleInput.conversionBidUpdate(conversionRateReal.bid);
					}
				}
      }
		});

    // request price info
    this.business.getPriceList(input).subscribe(val=>{
      if( val && val.result.priceList ){
        var price = val.result.priceList[0];

        // request real tick
        this.subscribeTick = this.business.symbols.tick(code).subscribe(realPrice=>{
					this.priceId = realPrice.priceId;
					this.validFlag = realPrice.validFlag;
					this.componentsettleInput.priceUpdate(realPrice);
          this.componentAskBid.realUpdate(realPrice);
					this.resetTransBtn();
          this.updateView();
        });

        // update ask & bid
        this.priceId = price.priceId;
        // if(price.validFlag =="1"){
				// 	this.componentsettleInput.onOrderType("2");
        // }
				this.validFlag = price.validFlag;
        this.componentsettleInput.priceUpdate(price);
        this.componentAskBid.update(price);
				this.resetTransBtn();
      }
    })
  }

	public resetTransBtn() { 
		this.componentAskBid.isExecMarket = (this.componentsettleInput.orderType == CommonConst.EXEC_MARKET_P_VAL
			                                && this.componentsingleMulti.orderSelect == "1");
		if (!this.componentAskBid.ask 
			|| !this.componentAskBid.bid
			|| (this.validFlag == CommonConst.PRICE_FLAG_NG
					&& this.componentsingleMulti.orderSelect == "1"
					&& this.componentsettleInput.orderType == CommonConst.EXEC_MARKET_P_VAL)) {
			this.componentorderSendButton.buttonDisabled = true;
			this.updateView();
		} else {
			this.componentorderSendButton.buttonDisabled = false;
			this.updateView();
		}
	}

	public onOrderTypes(){
		this.resetTransBtn();
  }
  
  private setBlankInfo() {
    this.componentsettleInput.holdqty = undefined;
    this.componentsettleInput.holdqtying = undefined;
    this.componentsettleInput.qty = undefined;
    this.componentsettleInput.maxqty = 0;
    this.componentsettleInput.holdprice = '';
	}
	
	public onErrorDismiss(){
		if (!this.componentsettleInput.qtyBorder &&
				!this.componentsettleInput.priceBorder &&
				!this.componentsettleInput.priceOco1Border &&
				!this.componentsettleInput.priceOco2Border &&
				!this.componentsettleInput.allowQtyBorder &&
				!this.componentsettleInput.orderTimeBorder &&
				!this.componentsettleInput.trailBorder) {
			this.componentorderSendButton.errCanvas = false;
		}
	}
}
