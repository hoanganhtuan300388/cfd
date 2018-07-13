/**
 *
 * 新規注文
 *
 */
import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MessageBox } from '../../../util/utils';
import { PanelManageService, BusinessService,
         PanelViewBase, IViewData, CommonEnum, CommonConst,ResourceService, Tooltips,ViewBase, StringUtil } from '../../../core/common';
import { AskBidUnitComponent } from '../../../component/ask-bid-unit/ask-bid-unit.component';
import { orderSingleMultiComponent } from '../../../component/order-singleMulti/order-singleMulti.component';
import { OrderInputComponent } from '../../../component/order-input/order-input.component';
import { OrderSendButtonComponent } from '../../../component/order-sendButton/order-sendButton.component';
import { OrderConfirmComponent} from '../../../component/order-confirm/order-confirm.component';
import { SymbolCfdComponent} from '../../../ctrls/symbol-cfd/symbol-cfd.component';
import * as values from "../../../values/Values";

import { AwakeDetectChange, GetAttentionMessage } from '../../../util/commonUtil'; // #2322

import { IConfigOrderSettings } from '../../../core/configinterface'; // #2410

import { Messages, GetWarningMessage,  } from '../../../../../common/message';
import { ERROR_CODE } from "../../../../../common/businessApi";
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

declare var $:any;  // for jquery
declare var moment:any;

//-----------------------------------------------------------------------------
// COMPONENT : Scr03020100Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03020100',
  templateUrl: './scr-03020100.component.html',
  styleUrls: ['./scr-03020100.component.scss'],
})
export class Scr03020100Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
	private subscribeTick:any;


  @ViewChild('slider') slider: ElementRef;
  @ViewChild('askbid') componentAskBid: AskBidUnitComponent;
  @ViewChild('singleMulti') componentsingleMulti: orderSingleMultiComponent;
  @ViewChild('orderInput') componentorderInput: OrderInputComponent;
  @ViewChild('orderSendButton') componentorderSendButton: OrderSendButtonComponent;
  @ViewChild('orderConfirm') componentorderConfirm: OrderConfirmComponent;
  @ViewChild('symbolCfd') componentsymbolCfd: SymbolCfdComponent
  public symbol;
  public priceId:string;
  public productCode:string;
  public productName:string;
  public productList:values.IProductInfo;
  // public singleMultiBoolean:boolean=true; // #2621
  public conversionBid;
  public singleMultiShow:boolean = true;
  public hasAttentionMessage:boolean = false;
  public attentionMessage:string="";
  // public orderTitle:string ="";
  public orderTitletool:string ="";
  public stockTitle:string ="";
  public stockTitletool:string ="";
  public titleMouse:boolean=false;
	public validFlag;
	
	// #2410
	private	autoUpdatePrice:boolean = false;
	private autoUpdateBuySellType:string;
	//
	public baseIdx:number;

	// #2448
	public isLoading:boolean = false; // loading

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public business:BusinessService,
               public element: ElementRef,
               public resource: ResourceService,
               public changeRef:ChangeDetectorRef,
               ) {
    super( '03020100', screenMng, element, changeRef);
	}

  ngOnInit() {
		super.ngOnInit();
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  /**
   *  destroy window event handler
   */
  ngOnDestroy(){
		super.ngOnDestroy();
    this.unsubscribe();
	}

  // public title(){
  // 	return this.orderTitle;
  // }

	/**
	 * OVERRIDE : load layout
	 *
	 * @param param
	 */
  protected initLayout(param:any){
    super.initLayout(param);

		this.initComponent();

		AwakeDetectChange(this.element.nativeElement); // #2322
	}

	/**
	 * OVERRIDE : save layout
	 */
	public getLayoutInfo():values.ILayoutInfo{
		var result = super.getLayoutInfo();

		// set product code.
		result.productCode = this.productCode;

		return result;
	}

	private unsubscribe(){
    if( this.subscribeTick ){
			this.subscribeTick.unsubscribe();
			this.subscribeTick = null;
    }
	}

  //---------------------------------------------------------------------------
  // member
	//---------------------------------------------------------------------------
	private initComponent(){
		// #2410
		try {
			let self = this;
			let layout:values.ILayoutInfo;
			let option:any;
			let price:any;
			let productCode:string;
			let autoUpdatePrice:boolean = false;
			let buySellType:string;
			let orderType:string;
			// 注文基本設定
			let configOrder:IConfigOrderSettings = self.resource.config_order();
			self.baseIdx = Number(this.uniqueId.split("_")[2])*1000;
			self.componentorderInput.baseIdx = self.baseIdx;
			self.componentsingleMulti.baseIdx = self.baseIdx;
			self.componentorderSendButton.baseIdx = self.baseIdx;
			self.componentsymbolCfd.baseIdx = self.baseIdx;
			if(self.params) {
				layout = self.params.layout;
			}

			// 外部からのINPUTオプション
			if(layout) {
				option = layout.option;
				productCode = layout.productCode;
			}

			// オプション設定
			if(option) {
				// 通常注文のみ
				// 注文タイプ(成行、指値、逆指値)
				orderType = option.orderType;
				self.componentorderInput.orderType = option.orderType || configOrder.initOrderType;
				
				// 売買
				if(option.buySellType) {
					self.autoUpdateBuySellType =
					buySellType =
					self.componentorderInput.buysellType = option.buySellType;
				}

				// 指定価格
				if(option.price) {
					if(option.price == CommonConst.NEW_ORDER_PRICE_AUTO_UPDATE_PRICE) {
						self.autoUpdatePrice = 
						autoUpdatePrice = true;
					}
					else {
						price = option.price;
					}
				}
			}
			else {
				self.componentorderInput.orderType = configOrder.initOrderType;
			}
			self.componentorderInput.onOrderType(self.componentorderInput.orderType);

			// ifd OCO type
			// 設定と入力のorderTypeはすでにマージされている。
			let ifdOcoType = self.componentorderInput.getIfdOcoType(self.componentorderInput.orderType);

			if (ifdOcoType == undefined) {
				// 通常注文
				self.componentorderInput.singleMultiBoolean = true;
				self.componentsingleMulti.orderSelect = "1";
			} else {
				// 複合注文
				self.componentorderInput.singleMultiBoolean = false;
				self.componentsingleMulti.orderSelect = "2";
				self.componentorderInput.ifdOCOType = ifdOcoType;
				self.componentorderInput.orderType = "1";
			}

			// 銘柄コード
			if(productCode) {
				self.productCode = layout.productCode;
			}
			else {
				self.productCode = configOrder.initProduct;
			}

			// 数量
			let configOrderProduct:any = self.resource.config_orderProduct(self.productCode);
			self.componentorderInput.qty     = configOrderProduct.initOrderQuantity
			self.componentorderInput.qtyIfd2 = configOrderProduct.initOrderQuantity;

			// Slippage
			if(configOrderProduct.initAllowSlippage == false) {
				self.componentorderInput.allowqty = configOrderProduct.initAllowSlippageValue;
			}

			// その他
			self.componentorderSendButton.isSkip  = configOrder.initConfirmOmit;
			self.componentorderSendButton.isClose = configOrder.initOrderFormDisplay;

			// 銘柄適用
			var symbol = self.business.symbols.getSymbolInfo(self.productCode);
			if(symbol) {
				self.componentsymbolCfd.changedCode(self.productCode, symbol.meigaraSeiKanji);

				self.stockTitle     = symbol.meigaraSeiKanji;
				self.stockTitletool = symbol.meigaraSeiKanji;
				self.orderTitletool = CommonConst.ORDER_TITLE[self.componentorderInput.execType] + ' ' + self.stockTitletool;
				self.setTitle(CommonConst.ORDER_TITLE[self.componentorderInput.execType], self.stockTitle);
			}

			// 価格設定
			if(autoUpdatePrice != true && price) {
				self.componentorderInput.didSetInputPrice(price);
			}
			

			// View更新
			self.updateView();
		}
		catch(e) {
			console.error(e);
		}
		//
	}

  /**
   * on click slide button
   *
   * @param tabName
   * @param event
   */
  public onCanvasBoolean(){
  	this.componentorderInput.buysellTypeBorder=false;
  	this.componentorderInput.buysellTypeBorder2=false;
  	this.componentorderInput.orderTimeBorder=false;
  	this.componentorderInput.qtyBorder=false;
		this.componentorderInput.limitPriceBorder=false;
		this.componentorderInput.stopPriceBorder=false;
  	this.componentorderInput.bsMultiBorder=false;
		this.componentorderInput.priceIfdBorder=false;
		this.componentorderInput.priceIfdOcoBorder=false;
  	this.componentorderInput.orderIfdTypeBorder=false;
  	this.componentorderInput.orderTimeIfd2Border=false;
  	this.componentorderInput.qtyIfd2Border=false;
  	this.componentorderInput.priceIfd2Border=false;
  	this.componentorderInput.priceOcoBorder=false;
		this.componentorderInput.priceOco2Border=false;
		this.componentorderInput.priceIfdOcoLimitBorder=false;
  	this.componentorderInput.priceIfdOcoStopBorder=false;
  	this.componentorderInput.orderOcoTypeBorder=false;
  	this.componentorderSendButton.errCanvas =false;
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
          this.updateView();
          $(this.slider.nativeElement).carousel("prev");
					setTimeout(() => {
            this.componentsymbolCfd.updateSymbol(this.productCode, this.productName, false);
            this.updateView();
					}, 30);
					this.componentAskBid.isReadonly = null;
        }
      }
    }


  }
  public frameClose(){
  	this.close();
	}
	
	// #2621
	private isSingleOrder = () => {
		let self = this;
		if(self.componentorderInput) {
			return(self.componentorderInput.singleMultiBoolean);
		}

		return(true);
	}
	//

  public orderErrMessage(){
  	let error = this.componentorderSendButton;
  	let input = this.componentorderInput;
		error.errMessage ="未入力の項目があります。";
		
		if(input.isNullNumber(input.qty)){
			input.qtyMessage =Messages.ERR_0033;
			error.errCanvas =true;
			input.qtyBorder =true;
		}else if(input.qty <1){
			input.qtyMessage =Messages.ERR_0034;
			error.errCanvas =true;
			input.qtyBorder =true;
		}

		let isSingleOrder:boolean = this.isSingleOrder(); // #2621
  	if(isSingleOrder == true) { // #2621
  		if(input.buysellType ==""){
    		error.errCanvas =true;
    		input.buysellTypeBorder =true;
      }
	      

	      if(input.orderType =="2"){
          if(input.isNullNumber(input.limitPrice)){
	      		input.limitPriceMessage = Messages.ERR_0035;
	      		error.errCanvas =true;
      		  input.limitPriceBorder =true;
          }else if(input.limitPrice <this.productList.boUnit  ){
	      		input.limitPriceMessage = Messages.ERR_0037(this.productList.boUnit);
	      		error.errCanvas =true;
      		  input.limitPriceBorder =true;
          }else if(isNaN(input.limitPrice)){
	      		input.limitPriceMessage =Messages.ERR_0036;
	      		error.errCanvas =true;
	      		input.limitPriceBorder =true;
	        }

          if(input.isEmptyStr(input.orderTime)){
		      	error.errCanvas =true;
	      		input.orderTimeBorder =true;
          }
				} else if(input.orderType =="3"){
          if(input.isNullNumber(input.stopPrice)){
	      		input.stopPriceMessage = Messages.ERR_0035;
	      		error.errCanvas =true;
      		  input.stopPriceBorder =true;
          }else if(input.stopPrice <this.productList.boUnit  ){
	      		input.stopPriceMessage = Messages.ERR_0037(this.productList.boUnit);
	      		error.errCanvas =true;
      		  input.stopPriceBorder =true;
          }else if(isNaN(input.stopPrice)){
	      		input.stopPriceMessage =Messages.ERR_0036;
	      		error.errCanvas =true;
	      		input.stopPriceBorder =true;
	        }

          if(input.isEmptyStr(input.orderTime)){
		      	error.errCanvas =true;
	      		input.orderTimeBorder =true;
          }
	      }else{
	      		console.log($(this.element.nativeElement).find("#allow").val());

	      	if($(this.element.nativeElement).find("#allow").val().trim() !=""){
	      	  if(isNaN($(this.element.nativeElement).find("#allow").val())){
		      	  error.errCanvas =true;
	      		  input.allowqtyBorder =true;
            }
	      	}

	      }
	  }else{
	      if(input.bsMulti ==""){
	      	error.errCanvas =true;
	      	input.buysellTypeBorder2 =true;
	      }
				if(input.isEmptyStr(input.orderTime)){
					error.errCanvas =true;
					input.orderTimeBorder =true;
				}
  		  if(input.ifdOCOType =="1"){
					if(input.isNullNumber(input.qtyIfd2)){
	      		input.qtyIfd2Message =Messages.ERR_0033;
	      		error.errCanvas =true;
	      		input.qtyIfd2Border =true;
	        }else if(input.qtyIfd2 <1){
	      		input.qtyIfd2Message =Messages.ERR_0034;
	      		error.errCanvas =true;
	      		input.qtyIfd2Border =true;
				  }
	      		if(input.isNullNumber(input.priceIfd)){
	      			input.priceIfdMessage = Messages.ERR_0035;
	      			error.errCanvas =true;
	      		  input.priceIfdBorder =true;
	      		}else if( input.priceIfd <this.productList.boUnit){
	      		  input.priceIfdMessage =Messages.ERR_0037(this.productList.boUnit);
	      			error.errCanvas =true;
	      		  input.priceIfdBorder =true;
	      		}else if(isNaN(input.priceIfd)){
	      		  input.priceIfdMessage =Messages.ERR_0036;
	      		  error.errCanvas =true;
	      		  input.priceIfdBorder =true;
	          }
	      		if(input.isNullNumber(input.priceIfd2)){
	      		  input.priceIfd2Message =Messages.ERR_0035;
	      			error.errCanvas =true;
	      		  input.priceIfd2Border =true;
	      		}else if( input.priceIfd2 <this.productList.boUnit){
	      		  input.priceIfd2Message =Messages.ERR_0037(this.productList.boUnit);
	      			error.errCanvas =true;
	      		  input.priceIfd2Border =true;
	      		}else if(isNaN(input.priceIfd2)){
      		    input.priceIfd2Message =Messages.ERR_0036;
      		    error.errCanvas =true;
      		    input.priceIfd2Border =true;
            }
	      		if(input.orderIfdType ===undefined){
              error.errCanvas =true;
              input.orderIfdTypeBorder =true;
            }
	      		
	      		if(input.orderOcoType ===undefined){
              error.errCanvas =true;
              input.orderOcoTypeBorder =true;
            }
	      		if(input.isEmptyStr(input.orderTimeIfd2)){
	      		error.errCanvas =true;
	      		input.orderTimeIfd2Border =true;
	          }

    		}else if(input.ifdOCOType =="2"){
	      		if(input.isNullNumber(input.priceOco)){
							input.priceOcoMessage = Messages.ERR_0035;
	      			error.errCanvas =true;
	      		  input.priceOcoBorder =true;
	      		}else if(input.priceOco <this.productList.boUnit){
							input.priceOcoMessage = Messages.ERR_0037(this.productList.boUnit);
	      			error.errCanvas =true;
	      		  input.priceOcoBorder =true;
	      		}else if(isNaN(input.priceOco)){
    		    input.priceOcoMessage = Messages.ERR_0036;
    		    error.errCanvas =true;
    		    input.priceOcoBorder =true;
            }

	      		if(input.isNullNumber(input.priceOco2)){
	      			input.priceOco2Message = Messages.ERR_0035;
	      			error.errCanvas =true;
	      		  input.priceOco2Border =true;
	      		}else if(input.priceOco2 <this.productList.boUnit){
	      			input.priceOco2Message = Messages.ERR_0037(this.productList.boUnit);
	      			error.errCanvas =true;
	      		  input.priceOco2Border =true;
	      		}else if(isNaN(input.priceOco2)){
    		    input.priceOco2Message = Messages.ERR_0036;
    		    error.errCanvas =true;
    		    input.priceOco2Border =true;
            }
        }
        else{
					if(input.isNullNumber(input.qtyIfd2)){
	      		input.qtyIfd2Message =Messages.ERR_0033;
	      		error.errCanvas =true;
	      		input.qtyIfd2Border =true;
	        }else if(input.qtyIfd2 <1){
	      		input.qtyIfd2Message =Messages.ERR_0034;
	      		error.errCanvas =true;
	      		input.qtyIfd2Border =true;
				  }
	      		if(input.isNullNumber(input.priceIfdOco)){
	      			input.priceIfdOcoMessage = Messages.ERR_0035;
	      			error.errCanvas =true;
	      		  input.priceIfdOcoBorder =true;
	      		}else if( input.priceIfdOco <this.productList.boUnit){
	      		  input.priceIfdOcoMessage =Messages.ERR_0037(this.productList.boUnit);
	      			error.errCanvas =true;
	      		  input.priceIfdOcoBorder =true;
	      		}else if(isNaN(input.priceIfdOco)){
	      		  input.priceIfdOcoMessage =Messages.ERR_0036;
	      		  error.errCanvas =true;
	      		  input.priceIfdOcoBorder =true;
	          }

	      		if(input.isNullNumber(input.priceIfdOcoLimit)){
	      		  input.priceIfdOcoLimitMessage =Messages.ERR_0035;
	      			error.errCanvas =true;
	      		  input.priceIfdOcoLimitBorder =true;
	      		}else if(input.priceIfdOcoLimit <this.productList.boUnit){
	      		  input.priceIfdOcoLimitMessage =Messages.ERR_0037(this.productList.boUnit);
	      			error.errCanvas =true;
	      		  input.priceIfdOcoLimitBorder =true;
	      		}else if(isNaN(input.priceIfdOcoLimit)){
    		    	input.priceIfdOcoLimitMessage =Messages.ERR_0036;
    		    	error.errCanvas =true;
    		    	input.priceIfdOcoLimitBorder =true;
            }

	      		if(input.isNullNumber(input.priceIfdOcoStop)){
	      		  input.priceIfdOcoStopMessage =Messages.ERR_0035;
	      			error.errCanvas =true;
	      		  input.priceIfdOcoStopBorder =true;
	      		}else if(input.priceIfdOcoStop <this.productList.boUnit){
	      		  input.priceIfdOcoStopMessage =Messages.ERR_0037(this.productList.boUnit);
	      			error.errCanvas =true;
	      		  input.priceIfdOcoStopBorder =true;
	      		}else if(isNaN(input.priceIfdOcoStop)){
    		      input.priceIfdOcoStopMessage =Messages.ERR_0036;
    		      error.errCanvas =true;
    		      input.priceIfdOcoStopBorder =true;
            }
	      		if(input.isEmptyStr(input.orderTimeIfd2)){
	      		error.errCanvas =true;
	      		input.orderTimeIfd2Border =true;
	          }
	      		if(input.orderIfdType ===undefined){
	      		error.errCanvas =true;
	      		input.orderIfdTypeBorder =true;
	          }
	      }
	  }
  }
  public orderConfirm(){
	    let confirm = this.componentorderConfirm;
	   	let inputData = this.componentorderInput;

      /* set same height both modify panel and confirm panel */
			if(confirm.orderchooice =='ifdoco'){
				const contentHeight = $(inputData.element.nativeElement).find('.panel-body-content2').height();
      	$(confirm.element.nativeElement).find('.panel-body-content2.panel-body-content-border').height(contentHeight);
			}else{
				const contentHeight = $(inputData.element.nativeElement).find('.panel-body-content').height();
      	$(confirm.element.nativeElement).find('.panel-body-content.panel-body-content-border').height(contentHeight);
			}

      let format = StringUtil.getBoUnitFormat(this.productList.boUnit, true);
    	let isSingleOrder:boolean = this.isSingleOrder(); // #2621
			if(isSingleOrder == true) { // #2621
	      		confirm.orderchooice ="single";
	      		confirm.execType = inputData.execType == CommonConst.NEW_ORDER_VAL?"新規":"決済";
	      		confirm.execTypeClass = inputData.execType;
	      		confirm.sellbuyClass = inputData.buysellType;
	      		confirm.sellbuy = inputData.buysellType == CommonConst.SELL_TYPE_VAL?"売":"買";
	      		confirm.orderType = inputData.orderType;
	      		if(inputData.orderType==CommonConst.EXEC_MARKET_P_VAL){
	      			confirm.orderTypeName = "成行";
	      		}else if(inputData.orderType==CommonConst.EXEC_LIMIT_P_VAL){
	      		  confirm.orderTypeName = "指値";
	      		}else{
	      		  confirm.orderTypeName = "逆指値";
	      		}

	      		confirm.qty = inputData.qty;
						confirm.tradeUnit = this.productList.tradeUnit;
						if (inputData.orderType == "2") {
              // confirm.price = inputData.limitPrice;
              confirm.price = StringUtil.formatNumber(inputData.limitPrice, format);
						} else if (inputData.orderType == "3") {
              confirm.price = StringUtil.formatNumber(inputData.stopPrice, format);
							// confirm.price = inputData.stopPrice;
						}
						
						if (!inputData.allowqty) {
							confirm.allowqty = "制限なし";
						} else {
							confirm.allowqty = inputData.allowqty + "以内";
						}
	      		if(inputData.orderTime=="1"){
	      			confirm.orderTime = "当日";
	      		}else if(inputData.orderTime=="2"){
	      			confirm.orderTime = "週末";
	      		}else{
	      			confirm.orderTime = "翌週末";
	      		}

      }else{

  		  if(inputData.ifdOCOType =="1"){
	      		confirm.orderchooice ="ifd";
	      		confirm.sellbuy = inputData.bsMulti == CommonConst.SELL_TYPE_VAL ?"売":"買";
	      		confirm.sellbuyClass = inputData.bsMulti;
	      		confirm.qty= inputData.qty;
	      		confirm.tradeUnit= this.productList.tradeUnit;
            // confirm.price = inputData.priceIfd;
            confirm.price = StringUtil.formatNumber(inputData.priceIfd, format);

	      		if(inputData.orderIfdType==CommonConst.EXEC_LIMIT_P_VAL){
	      		  confirm.orderTypeName = "指値";
	      		}else{
	      		  confirm.orderTypeName = "逆指値";
	      		}
	      		if(inputData.orderTime=="1"){
      				confirm.orderTime = "当日";
	      		}else if(inputData.orderTime=="2"){
	      			confirm.orderTime = "週末";
	      		}else{
	      			confirm.orderTime = "翌週末";
	      		}

	      		confirm.sellbuyOco= inputData.bsMulti!="1"?"売":"買";
	      		confirm.qtyOco= inputData.qtyIfd2;
            // confirm.priceOco= inputData.priceIfd2;
            confirm.priceOco = StringUtil.formatNumber(inputData.priceIfd2, format);
	      		if(inputData.orderOcoType==CommonConst.EXEC_LIMIT_P_VAL){
      		  	confirm.orderTypeOco = "指値";
	      		}else{
	      		  confirm.orderTypeOco = "逆指値";
	      		}
	      		if(inputData.orderTimeIfd2=="1"){
	    				confirm.orderTimeOco = "当日";
	      		}else if(inputData.orderTimeIfd2=="2"){
	      			confirm.orderTimeOco = "週末";
	      		}else{
	      			confirm.orderTimeOco = "翌週末";
	      		}

  		  }else if(inputData.ifdOCOType =="2"){
	      		confirm.orderchooice ="oco";
	      		confirm.execType= inputData.execType== CommonConst.NEW_ORDER_VAL?"新規":"決済";;
	      		confirm.sellbuy= inputData.bsMulti==CommonConst.SELL_TYPE_VAL?"売":"買";
	      		confirm.execTypeClass = inputData.execType;
	      		confirm.sellbuyClass = inputData.bsMulti;
	      		confirm.qty= inputData.qty;
	      		confirm.tradeUnit= this.productList.tradeUnit;
	      		// confirm.priceOco= inputData.priceOco;
            // confirm.priceOco2= inputData.priceOco2;
            confirm.priceOco = StringUtil.formatNumber(inputData.priceOco, format);
            confirm.priceOco2 = StringUtil.formatNumber(inputData.priceOco2, format);
	      		if(inputData.orderTime=="1"){
    					confirm.orderTime = "当日";
	      		}else if(inputData.orderTime=="2"){
	      			confirm.orderTime = "週末";
	      		}else{
	      			confirm.orderTime = "翌週末";
	      		}
  		  }else{
	      		confirm.orderchooice ="ifdoco";
	      		confirm.sellbuy= inputData.bsMulti==CommonConst.SELL_TYPE_VAL?"売":"買";
	      		confirm.sellbuyClass = inputData.bsMulti;
	      		confirm.qty= inputData.qty;
	      		confirm.tradeUnit= this.productList.tradeUnit;
            // confirm.price= inputData.priceIfdOco;
            confirm.price = StringUtil.formatNumber(inputData.priceIfdOco, format);

	      		if(inputData.orderIfdType==CommonConst.EXEC_LIMIT_P_VAL){
      		  confirm.orderTypeName = "指値";
	      		}else{
	      		  confirm.orderTypeName = "逆指値";
	      		}
	      		if(inputData.orderTime=="1"){
	    				confirm.orderTime = "当日";
	      		}else if(inputData.orderTime=="2"){
	      			confirm.orderTime = "週末";
	      		}else{
	      			confirm.orderTime = "翌週末";
	      		}
	      		confirm.sellbuyOco= inputData.bsMulti!=CommonConst.SELL_TYPE_VAL?"売":"買";
	      		confirm.qtyOco= inputData.qtyIfd2;
	      		// confirm.priceOco= inputData.priceIfdOcoLimit;
            // confirm.priceOco2= inputData.priceIfdOcoStop;
            confirm.priceOco = StringUtil.formatNumber(inputData.priceIfdOcoLimit, format);
            confirm.priceOco2 = StringUtil.formatNumber(inputData.priceIfdOcoStop, format);
	      		if(inputData.orderTimeIfd2=="1"){
	    				confirm.orderTimeOco = "当日";
	      		}else if(inputData.orderTimeIfd2=="2"){
	      			confirm.orderTimeOco = "週末";
	      		}else{
	      			confirm.orderTimeOco = "翌週末";
	      		}
  		  }
      }
	      		this.updateView();
  }
  public orderSendSelect(){
		  this.isLoading = true;
			this.componentorderSendButton.errCanvas =false;
			
			let isSingleOrder:boolean = this.isSingleOrder(); // #2621
			if(isSingleOrder == true) { // #2621
  			this.singleOrderSend();
      } else {
  		  if(this.componentorderInput.ifdOCOType =="1"){
  				this.orderIfdSend();
  		  }else if(this.componentorderInput.ifdOCOType =="2"){
	      	this.orderOcoSend();
  		  }else{
  				this.orderIfdOcoSend();
  		  }
      }
  }


  public singleOrderSend(){
    var input:values.IReqSingleOrder;

    if(this.componentorderInput.orderType == CommonConst.EXEC_MARKET_P_VAL) {   // 成行
      input = {
        cfdProductCode  : this.productCode,
        orderType       : CommonConst.ORDER_NORMAL,  // 通常
        buySellType     : this.componentorderInput.buysellType,
        settleType      : this.componentorderInput.execType,
        executionType   : this.componentorderInput.orderType,
        orderQuantity   : this.componentorderInput.qty.toString(),
        priceId         : this.priceId,
        orderBidPrice   : this.componentorderInput.bidPrice.toString(),
        orderAskPrice   : this.componentorderInput.askPrice.toString()
      };
      if((this.componentorderInput.allowqty > 0) || (this.componentorderInput.allowqty && this.componentorderInput.allowqty.toString().length > 0)){
        input.allowedSlippage =  this.componentorderInput.allowqty.toString();
      }
    } else if (this.componentorderInput.orderType == CommonConst.EXEC_LIMIT_P_VAL) {  // 指値
      input= {
        cfdProductCode  : this.productCode,
        orderType       : CommonConst.ORDER_NORMAL,  // 通常
        buySellType     : this.componentorderInput.buysellType,
        settleType      : this.componentorderInput.execType,
        executionType   : this.componentorderInput.orderType,
        orderQuantity   : this.componentorderInput.qty.toString(),
        orderPrice:this.componentorderInput.limitPrice.toString(),
        invalidDate:this.componentorderInput.orderTime.toString()
      }
    } else if (this.componentorderInput.orderType == CommonConst.EXEC_STOP_P_VAL) {  // 指値
      input= {
        cfdProductCode  : this.productCode,
        orderType       : CommonConst.ORDER_NORMAL,  // 通常
        buySellType     : this.componentorderInput.buysellType,
        settleType      : this.componentorderInput.execType,
        executionType   : this.componentorderInput.orderType,
        orderQuantity   : this.componentorderInput.qty.toString(),
        orderPrice:this.componentorderInput.stopPrice.toString(),
        invalidDate:this.componentorderInput.orderTime.toString()
      }
    }

    // console.log(input);

	  this.business.singleOrder(input).subscribe(val=>{
      console.log(val);
	  	if(val.status == ERROR_CODE.OK){
				MessageBox.info(
					{title:Messages.STR_0014, message:Messages.STR_0016(val.result.orderJointId.substr(-4))}, 
					() => {
						if(this.componentorderSendButton.isClose){
							this.backToOrderInputPanel();
						} else {
							this.frameClose();
						}
					}
				);
	  	} else if (val.status == ERROR_CODE.NG) {
				MessageBox.error({title:Messages.STR_0015, message:Messages.ERR_0001 + '[CFDS3601T]'}, () => this.backToOrderInputPanel());
	  	} else if (val.status == ERROR_CODE.WARN) {
			  MessageBox.warning({title:Messages.STR_0015, message:GetWarningMessage(val.clientInfoMessage)} , () => this.backToOrderInputPanel());
			}
		},
		err => {
			if (err.status == ERROR_CODE.NETWORK) {
				MessageBox.error({ title: Messages.STR_0015, message: Messages.ERR_0052 + '[CFDS3602C]' }, () => this.backToOrderInputPanel());
			}
		}
	  );
	}
  public orderIfdSend(){
	    var input:values.IReqIfdOrder= {
	        cfdProductCode: this.productCode,
	        orderType : CommonConst.ORDER_IFD,
	        buySellTypeNew : this.componentorderInput.bsMulti,
	        executionTypeNew : this.componentorderInput.orderIfdType,
	        orderQuantityNew : this.componentorderInput.qty.toString(),
	        orderPriceNew : this.componentorderInput.priceIfd.toString(),
	        invalidDateNew : this.componentorderInput.orderTime,
	        buySellTypeSettle : this.componentorderInput.bsMulti==CommonConst.SELL_TYPE_VAL?"2":"1",
	        executionTypeSettle : this.componentorderInput.orderOcoType,
	        orderQuantitySettle : this.componentorderInput.qtyIfd2.toString(),
	        orderPriceSettle :  this.componentorderInput.priceIfd2.toString(),
	        invalidDateSettle : this.componentorderInput.orderTimeIfd2
     }
    //  console.log(input);
	  this.business.ifdOrder(input).subscribe(val=>{
			if(val.status == ERROR_CODE.OK){

				MessageBox.info({title:Messages.STR_0014, message:Messages.STR_0016(val.result.orderJointId.substr(-4))},
					() => {
						if (this.componentorderSendButton.isClose) {
							this.backToOrderInputPanel();
						} else {
							this.frameClose();
						}
					});
	  	} else if (val.status == ERROR_CODE.NG) {
				MessageBox.error({title:Messages.STR_0015, message:Messages.ERR_0001 + '[CFDS3801T]'},
				　　() => this.backToOrderInputPanel())
	  	} else if (val.status == ERROR_CODE.WARN) {
			  MessageBox.warning({title:Messages.STR_0015, message:GetWarningMessage(val.clientInfoMessage)}, () => this.backToOrderInputPanel());
			}

		},
		err => {
			if (err.status == ERROR_CODE.NETWORK) {
				MessageBox.error({ title: Messages.STR_0015, message: Messages.ERR_0052 + '[CFDS3802C]' }, () => this.backToOrderInputPanel());
			}
		});
	}
  public orderOcoSend(){
    var input:values.IReqOcoOrder={
      cfdProductCode:this.productCode,
      orderType: CommonConst.ORDER_OCO,
      buySellType:this.componentorderInput.bsMulti,
      settleType:this.componentorderInput.execType,
      orderQuantity:this.componentorderInput.qty.toString(),
      orderPriceLimit:this.componentorderInput.priceOco.toString(),
      orderPriceStop:this.componentorderInput.priceOco2.toString(),
      invalidDate:this.componentorderInput.orderTime
    }
     console.log(input);
	  this.business.ocoOrder(input).subscribe(val=>{
	  	if(val.status == ERROR_CODE.OK){
				MessageBox.info({title:Messages.STR_0014, message:Messages.STR_0016(val.result.orderJointId.substr(-4))},
					() => {
						if (this.componentorderSendButton.isClose) {
							this.backToOrderInputPanel();
						} else {
							this.frameClose();
						}
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

  public orderIfdOcoSend(){
      var input:values.IReqIfdocoOrder= {
          cfdProductCode: this.productCode,
          orderType : CommonConst.ORDER_IFD_OCO,
          buySellTypeNew : this.componentorderInput.bsMulti,
          executionTypeNew : this.componentorderInput.orderIfdType,
          orderQuantityNew : this.componentorderInput.qty.toString(),
          orderPriceNew : this.componentorderInput.priceIfdOco.toString(),
          invalidDateNew : this.componentorderInput.orderTime,
          buySellTypeSettle : this.componentorderInput.bsMulti==CommonConst.SELL_TYPE_VAL?CommonConst.BUY_TYPE_VAL:CommonConst.SELL_TYPE_VAL,
          orderQuantitySettle : this.componentorderInput.qtyIfd2.toString(),
          orderPriceSettleLimit : this.componentorderInput.priceIfdOcoLimit.toString(),
          orderPriceSettleStop :  this.componentorderInput.priceIfdOcoStop.toString(),
          invalidDateSettle : this.componentorderInput.orderTimeIfd2
     }
    //  console.log(input);
  	this.business.ifdocoOrder(input).subscribe(val=>{
  		if(val.status == ERROR_CODE.OK){
				MessageBox.info({title:Messages.STR_0014, message:Messages.STR_0016(val.result.orderJointId.substr(-4))},
					() => {
						if (this.componentorderSendButton.isClose) {
							this.backToOrderInputPanel();
						} else {
							this.frameClose();
						}
					}
				);
	  	} else if (val.status == ERROR_CODE.NG) {
				MessageBox.error({title:Messages.STR_0015, message:Messages.ERR_0001 + '[CFDS3701T]'},
				　　() => this.backToOrderInputPanel())
	  	} else if (val.status == ERROR_CODE.WARN) {
			  MessageBox.warning({title:Messages.STR_0015, message:GetWarningMessage(val.clientInfoMessage)}, () => this.backToOrderInputPanel());
			}
		},
		err => {
			if (err.status == ERROR_CODE.NETWORK) {
				MessageBox.error({ title: Messages.STR_0015, message: Messages.ERR_0052 + '[CFDS3702C]' }, () => this.backToOrderInputPanel());
			}
		});

	}
	/**
	 * 障害#2331を対応するため追加
	 * 注文入力パネルに戻る
	 */
	private backToOrderInputPanel() {
		this.componentAskBid.isReadonly = null;
		// 確認省略チェックオフの場合
		if (!this.componentorderSendButton.isSkip) {
			this.componentorderConfirm.onNavBtnClick("BACK");
			this.componentsingleMulti.singleMultiEvent.emit();
		}
		this.isLoading = false;
		this.updateView();
	}

	// #2410
	protected didAdjustPriceFormat = (price:any, toNumber?:boolean) => {
		if(!price) {
			return(price);
		}

		if(toNumber) {
			return(parseFloat(price));
		}

		return(price);
	}

	protected didProcForAutoPriceUpdateAtFirst() {
		let self = this;
		// 価格設定
		if(self.autoUpdatePrice == true) {
			if(self.autoUpdateBuySellType == CommonConst.BUY_TYPE_VAL || self.autoUpdateBuySellType == CommonConst.SELL_TYPE_VAL) {
				self.didUpdateOrderPrice(self.autoUpdateBuySellType);
			}

			self.autoUpdatePrice = false;
			self.autoUpdateBuySellType = null;
		}
		//
	}

	private initInputOrderPrice(price) {
		let input = this.componentorderInput;
		input.limitPrice = price;
		input.stopPrice = price;
		input.priceIfd = price;
		input.priceIfd2 = price;
		input.priceOco = price;
		input.priceOco2 = price;
		input.priceIfdOco = price;
		input.priceIfdOcoLimit = price;
		input.priceIfdOcoStop = price;
	}

	protected didUpdateOrderPrice(sellbuy:string){
		// #2410
		let self = this;
		let input = self.componentorderInput;

		try {
			// 買はASK
			if(sellbuy == CommonConst.BUY_TYPE_VAL){
				let price:any = self.didAdjustPriceFormat(self.componentAskBid.ask);
				this.initInputOrderPrice(price);
				if(self.componentsingleMulti.orderSelect =="1") {
					input.buysellType = CommonConst.BUY_TYPE_VAL;
					input.buysellTypeBorder = false;
					if(input.orderType ==CommonConst.EXEC_LIMIT_P_VAL){
						input.limitPriceBorder = false;
					} else if(input.orderType ==CommonConst.EXEC_STOP_P_VAL){
						input.stopPriceBorder = false;
					}
				}
				else {
					input.bsMulti = CommonConst.BUY_TYPE_VAL;
					input.buysellTypeBorder2 = false;
					if(input.ifdOCOType == "1") {			// IFD
						input.priceIfdBorder = false;
						input.priceIfd2Border = false;
					}
					else if(input.ifdOCOType =="2") {	// OCO
						input.priceIfdBorder = false;
						input.priceOcoBorder = false;
						input.priceOco2Border = false;
					}
					else {														// IFD-OCO
						input.priceIfdOcoBorder = false;
						input.priceIfdOcoLimitBorder = false;
						input.priceIfdOcoStopBorder = false;
					}
					input.marginCalc();
				}
			}
			// 売はBID
			else {
				let price:any = self.didAdjustPriceFormat(self.componentAskBid.bid);
				this.initInputOrderPrice(price);
				if(self.componentsingleMulti.orderSelect =="1") {
					input.buysellType = CommonConst.SELL_TYPE_VAL;
					input.buysellTypeBorder = false;
					if(input.orderType ==CommonConst.EXEC_LIMIT_P_VAL){
						input.limitPriceBorder = false;
					} else if(input.orderType ==CommonConst.EXEC_STOP_P_VAL){
						input.stopPriceBorder = false;
					}
				}else{
					input.bsMulti = CommonConst.SELL_TYPE_VAL;;
					input.buysellTypeBorder2 = false;
					if(input.ifdOCOType =="1") {			// IFD
						input.priceIfdBorder = false;
						input.priceIfd2Border = false;
					}
					else if(input.ifdOCOType =="2") {	// OCO
						input.priceIfdBorder = false;
						input.priceOcoBorder = false;
						input.priceOco2Border = false;
					}
					else {														// IFD-OCO
						input.priceIfdOcoBorder = false;
						input.priceIfdOcoLimitBorder = false;
						input.priceIfdOcoStopBorder = false;
					}
				}
			}
			// マージン計算
			input.marginCalc();
			this.onErrorDismiss();
			// View更新
			self.updateView();
		}
		catch(e) {
			throw e;
		}
		//
	}
	//

  public onClickOrderPrice(event:Event){
		// #2410
		let self = this;
		try {
			let sellbuy = event["sellbuy"];
			self.didUpdateOrderPrice(sellbuy);

		}
		catch(e) {
			console.error(e);
		}
		//
	}
	
  public onSingleMulti(){

      if(this.componentsingleMulti.orderSelect =="1"){
      	this.setTitle(CommonConst.ORDER_TITLE[this.componentorderInput.execType], this.stockTitle);
   			this.orderTitletool = CommonConst.ORDER_TITLE[this.componentorderInput.execType] + ' ' + this.stockTitletool;
          // this.singleMultiBoolean = true; // #2621
          this.componentorderInput.singleMultiBoolean = true;
          this.componentorderInput.marginCalc();
      }else{
        let title: string;
        if(this.componentorderInput.ifdOCOType == '2')
          title = CommonConst.ORDER_TITLE[this.componentorderInput.execType];
        else
          title = CommonConst.ORDER_TITLE[CommonConst.NEW_ORDER_VAL];
        this.setTitle(title , this.stockTitle);
      	this.orderTitletool = title + ' ' + this.stockTitletool;
          // this.singleMultiBoolean = false; // #2621
          this.componentorderInput.singleMultiBoolean = false;
          this.componentorderInput.marginCalc();
			}
			this.resetTransBtn();
			this.componentorderInput.onErrClick.emit();
      this.updateView();
  }
  /**
   * symbol changed event handler
   *
   * @param event
   */
  public onChangeSymbol(event:Event){
  	this.componentAskBid.bidBlink =false;
  	this.componentAskBid.askBlink =false;
    var symbol = event["selected"];
    this.productName = symbol.symbolName;
		this.productCode = symbol.symbolCode;
    this.stockTitle = this.productName;

    this.stockTitletool = this.productName;
    if(this.componentsingleMulti.orderSelect =="1"){
    	this.setTitle(CommonConst.ORDER_TITLE[this.componentorderInput.execType], this.stockTitle);
    	this.orderTitletool =  CommonConst.ORDER_TITLE[this.componentorderInput.execType] + ' ' +this.stockTitletool;
    }else{
      let title: string;
      if(this.componentorderInput.ifdOCOType == '2')
        title = CommonConst.ORDER_TITLE[this.componentorderInput.execType];
      else
        title = CommonConst.ORDER_TITLE[CommonConst.NEW_ORDER_VAL];
      this.setTitle(title, this.stockTitle);
      this.orderTitletool = title + ' ' + this.stockTitletool;
		}

    // this.subTitle = this.orderTitletool;

		this.componentorderInput.limitPrice = undefined;
		this.componentorderInput.stopPrice = undefined;
		this.componentorderInput.priceIfd = undefined;
		this.componentorderInput.priceIfdOco = undefined;
    this.componentorderInput.priceIfd2 = undefined;
    this.componentorderInput.priceOco = undefined;
		this.componentorderInput.priceOco2 = undefined;
		this.componentorderInput.priceIfdOcoLimit = undefined;
    this.componentorderInput.priceIfdOcoStop = undefined;

    this.productList =this.business.symbols.getSymbolInfo(this.productCode);
    this.componentorderInput.maxAllow = 99*this.productList.boUnit;
    this.componentorderInput.tradeUnit =this.productList.tradeUnit;
    this.componentorderInput.boUnit =this.productList.boUnit;
    this.componentorderInput.productList =this.productList;

    if(this.componentorderInput.boUnit >=1 ){
    	this.componentorderInput.priceMax = 999999;
    }else if(this.componentorderInput.boUnit ==0.1 ){
    	this.componentorderInput.priceMax = 99999.9;
    }else if(this.componentorderInput.boUnit ==0.01  ){
    	this.componentorderInput.priceMax = 9999.99;
    }else if(this.componentorderInput.boUnit ==0.001  ){
    	this.componentorderInput.priceMax = 999.999;
    }

    this.componentAskBid.productList = this.productList;
    this.componentAskBid.currency = this.productList.currency;

    // close tick
    if(this.subscribeTick){
    	this.subscribeTick.unsubscribe();
    }

    // open new tick
    var input = {productCodes:symbol.symbolCode};

		// get subscribe object
		
    this.updateSettingOrderProduct();


    this.business.getConversionRate().subscribe(val=>{

        for(let conversionRate of val.result.conversionRateList){

            if(conversionRate.currency == this.productList.currency){
                this.conversionBid = conversionRate.bid;
                this.componentorderInput.conversionBidUpdate(conversionRate.bid);
            }
        }

        this.business.notifyer.conversionRate().subscribe(val=>{
            if(val.conversionRateList !=null){
                for(let conversionRateReal of val.conversionRateList){
                    if(conversionRateReal.currency == this.productList.currency){
                        this.conversionBid = conversionRateReal.bid;
                        	this.componentorderInput.conversionBidUpdate(conversionRateReal.bid);
                    }
                }
            }

          });
    });


    var inputAtt = {cfdProductCode:this.productCode};
    this.business.getAttentionInfoList(inputAtt).subscribe(val=>{

      if(val.status == "0"){
      		if(val.result.attentionProductList == null || val.result.attentionProductList.length ==0){
            this.hasAttentionMessage=false;
            this.attentionMessage = '';
      		}else{
						this.attentionMessage = GetAttentionMessage(val.result.attentionProductList);
      			this.hasAttentionMessage=true;      			
      		}
      }
      this.updateView();
    });

    // request price info
    this.business.getPriceList(input).subscribe(val=>{
      if( val && val.result.priceList ){
        var price = val.result.priceList[0];

        // request real tick
        this.subscribeTick = this.business.symbols.tick(symbol.symbolCode).subscribe(realPrice=>{
					this.validFlag = realPrice.validFlag;
					this.priceId = realPrice.priceId;
        	this.componentorderInput.priceUpdate(realPrice);
					this.componentAskBid.realUpdate(realPrice);
					this.resetTransBtn();
          this.updateView();
        });

        // update ask & bid
        this.validFlag = price.validFlag;
        this.priceId = price.priceId;
        this.componentorderInput.priceUpdate(price);
				this.componentAskBid.update(price);
				this.resetTransBtn();
				
				// 価格設定
				this.didProcForAutoPriceUpdateAtFirst();
				//
      }
		})
		
		this.componentorderInput.onErrClick.emit();
	}

	/**
	 * 設定画面で設定されている注文（銘柄別）情報を画面に更新する。
	 */
	public updateSettingOrderProduct() {
		
		// 取引数量
		let configOrderProduct:any = this.resource.config_orderProduct(this.productCode);
		this.componentorderInput.qty     = 
		this.componentorderInput.qtyIfd2 = configOrderProduct.initOrderQuantity;
		
		// 許容スリッページ
		if (configOrderProduct.initAllowSlippage == false) {
      this.componentorderInput.allowqty = configOrderProduct.initAllowSlippageValue;
		} else {
			this.componentorderInput.allowqty = null;
		}
	}
	
  public onOrderType(){
		this.resetTransBtn();
	}
	
	public resetTransBtn() {
		this.componentAskBid.isExecMarket = (this.componentorderInput.orderType == CommonConst.EXEC_MARKET_P_VAL
			                                && this.componentsingleMulti.orderSelect == "1");
		if (!this.componentAskBid.ask 
			|| !this.componentAskBid.bid
			|| (this.validFlag == CommonConst.PRICE_FLAG_NG
					&& this.componentsingleMulti.orderSelect == "1"
					&& this.componentorderInput.orderType == CommonConst.EXEC_MARKET_P_VAL)) {
			this.componentorderSendButton.buttonDisabled = true;
		} else {
			this.componentorderSendButton.buttonDisabled = false;
		}
	}

  public onPanelTitleRefresh() {
    if(this.componentsingleMulti.orderSelect =="1"){
      this.setTitle(CommonConst.ORDER_TITLE[this.componentorderInput.execType], this.stockTitle);
      this.orderTitletool = CommonConst.ORDER_TITLE[this.componentorderInput.execType] + ' ' + this.stockTitletool;
    }else{
      let title: string;
      if(this.componentorderInput.ifdOCOType == '2')
        title = CommonConst.ORDER_TITLE[this.componentorderInput.execType];
      else
        title = CommonConst.ORDER_TITLE[CommonConst.NEW_ORDER_VAL];
      this.setTitle(title, this.stockTitle);
      this.orderTitletool = title + ' ' + this.stockTitletool;
    }
    this.changeRef.detectChanges();
	}
	
	public onErrorDismiss(){
		if (!this.componentorderInput.allowqtyBorder &&
				!this.componentorderInput.buysellTypeBorder &&
				!this.componentorderInput.buysellTypeBorder2 &&
				!this.componentorderInput.orderTimeBorder &&
				!this.componentorderInput.qtyBorder && 
				!this.componentorderInput.limitPriceBorder &&
				!this.componentorderInput.stopPriceBorder &&
				!this.componentorderInput.priceIfdBorder &&
				!this.componentorderInput.priceIfdOcoBorder &&
				!this.componentorderInput.orderIfdTypeBorder &&
				!this.componentorderInput.orderTimeIfd2Border &&
				!this.componentorderInput.qtyIfd2Border &&
				!this.componentorderInput.priceIfd2Border &&
				!this.componentorderInput.priceOcoBorder &&
				!this.componentorderInput.priceOco2Border &&
				!this.componentorderInput.priceIfdOcoLimitBorder &&
				!this.componentorderInput.priceIfdOcoStopBorder &&
				!this.componentorderInput.orderOcoTypeBorder) {
			this.componentorderSendButton.errCanvas =false;
		}
	}

}
