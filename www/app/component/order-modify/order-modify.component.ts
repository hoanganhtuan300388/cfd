/**
 *
 * 注文変更
 *
 */
import { Component, OnInit, ElementRef, ChangeDetectorRef, Output,EventEmitter } from '@angular/core';
import { PanelViewBase, ComponentViewBase, StringUtil,
         PanelManageService, ResourceService,
         CommonConst, Tooltips,
         IViewState, IViewData, ViewBase } from "../../core/common";
import { loadavg } from 'os';

//-----------------------------------------------------------------------------
// COMPONENT : OrderModifyComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'order-modify',
  templateUrl: './order-modify.component.html',
  styleUrls: ['./order-modify.component.scss']
})
export class OrderModifyComponent extends ComponentViewBase{
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
	public price;
	public boUnit:number = 0;
	public productInfo;
	public losscutRange;
	public settleType;
	public settleType2;
	public buySellType;
	public executionType;
	public orderType:string ="1";
	public orderType2:string ;
	public orderStatus;
	public orderStatus2;
	public qty;
	public losscutRate;
	public tradeUnit;
	public autoType ="1";
	public orderTime;
	public orderTime2;

	public ifdOCOType;
	public plusLabel:boolean=true;
	public trailing:boolean=false;


	public losscut;
  public losscut2;
  public conversionBid;

  public buySellType2;
  public qty2;
  public price2;
  public price3;
  public executionType2;

  public isSave ;
  public trailPrice2;
  public trailWidth;
  public leverageRatio;

  public needMargin:string ="-";;
  public tempMargin:string ="-";;
  public needTempMargin:string ="-";;
  public needMarginFull:string ="-";;
  public tempMarginFull:string ="-";;
  public needTempMarginFull:string ="-";;

  public bidPrice ;
  public askPrice ;
  public validFlag ;
  public holdMargin: number = 0;
  public holdMargin2: number = 0;
  public holdMarginTxt: string = '-';
  public holdMarginTxtFull: string = '-';
  public holdMargin2Txt: string = '-';
  public holdMargin2TxtFull: string = '-';
  public holdprice;
  public holdprice2;
  public holdpriceTxt: string;
  public isMean: boolean = false;

  public priceMax;


  public priceMessage;
	public priceBorder;
	public priceTool;
	public losscutBorder;
	public losscutTool;
	public losscut2Border;
	public losscut2Tool;

	public trailWidthMessage;
	public trailWidthBorder;
	public trailWidthTool;
	public price2Message;
	public price2Border;
	public price2Tool;
	public price3Message;
	public price3Border;
	public price3Tool
	public orderTimeBorder;
	public orderTime2Border;
	public orderTimeTool;
	public orderTime2Tool;
	// public holdqty;
	public orderTypeFlg1:boolean = false;
	public orderTypeFlg2:boolean = false;
	public orderTypeFlg3:boolean = false;
	public orderTypeFlg4:boolean = false;

	public showDisableDiv:boolean;

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
  onErrClick = new EventEmitter<any>();   // go, back button click
  @Output()
  onErrorDismiss = new EventEmitter();
	public getDefaultPrice(){
    if(this.buySellType == CommonConst.SELL_TYPE_VAL) {
      return(this.bidPrice);
    }
    else {
      return(this.askPrice);
    }
	}

	public onOrderType(orderType){

		/*if(this.validFlag == '1' && orderType=='1') return;
			this.orderType = orderType;
	    if(this.orderType =="2" ||  this.orderType =="3"){

	        if(this.price == null || this.price == undefined){
	            if(this.buysellType =="1"){
	                this.price = this.bidPrice;
	            }else{
	                this.price = this.askPrice;
	            }

	        }
	        console.log("onOrderType");
	    }else{

	    }*/

	    this.updateView();
	}
	// public onclickTrail(e, updown){  // 注文指値価格
	// 	if(this.trailWidth ==null || this.trailWidth ==undefined || this.trailWidth < 0){
	//     this.trailWidth =5
	// 	}
	//    if(updown == "UP") {
	//     	 this.trailWidth += 1;
	//    }
	//    else {
	//   	  if(this.trailWidth ==5){
	//     	 return;
	//     	}
	//        this.trailWidth -= 1;

	//    }
	//    this.onErrClick.emit();
	// }
/* 	public onChangeInupt(){
		this.onErrClick.emit();
	} */

	public conversionBidUpdate(bidPrice){
    this.conversionBid = parseFloat(bidPrice);
    this.marginCalc();
  }
	public priceUpdate(price){
    this.bidPrice = Number(price.bid);
    this.askPrice = Number(price.ask);
    this.validFlag = price.validFlag;
  }

	public marginCalc(){
    if(this.settleType == CommonConst.SETTLE_ORDER_VAL) {
      if(this.orderType == CommonConst.ORDER_OCO)
        this.holdMarginCalcOco();
      else
        this.holdMarginCalc();
      return;
    }

		let orderPrice:number = 0;
		let losscutPrice:number = 0;
    let numNeedMargin:number = 0;
    let numTempMargin:number = 0;

		if(this.orderType== CommonConst.ORDER_OCO){
      if(!Number(this.price) && !Number(this.price2)) { // 値、逆指値両方に「空白、０」が入力されている場合
        // 必要証拠金、任意証拠金、拘束証拠金には「-円」を表示する
        this.needMargin = '-';      // 必要証拠金
        this.tempMargin = '-';      // 任意証拠金
        this.needTempMargin = '-';  // 拘束証拠金
      }
      else {
        // 必要証拠金 = 注文価格× 取引数量 × 取引単位 × コンバージョンレートBID  / レバレッジ
        // 「指値」、「逆指値」の値を比較して、値が大きい方を必要証拠金計算式の注文価格に適用して計算する
        orderPrice = Math.max(Number(this.price), Number(this.price2));
        // if((this.price!="" && this.price!=0) || (this.price2!="" && this.price2!=0)){
        //   if(Number(this.price) > Number(this.price2)){
        //     orderPrice = this.price;
        //   }else{
        //     orderPrice = this.price2;
        //   }
        numNeedMargin = Math.floor(orderPrice * this.qty * this.tradeUnit * this.conversionBid / this.productInfo.leverageRatio);
        //   //let priceLosscut;
        this.needMarginFull = StringUtil.Comma(numNeedMargin);
        this.needMargin = this.ajustNum(this.needMarginFull);

        if(this.autoType != '1' && (this.losscut === undefined || !(String(this.losscut).length) && (this.losscut2 === undefined) || !(String(this.losscut2).length))) {
          this.tempMargin = '-';      // 任意証拠金
          this.needTempMargin = this.needMargin;  // 拘束証拠金
        }
        else
        {
          let price:number = 0;
          let price2:number = 0;
          let losscut: number = 0;
          let losscut2: number = 0;
          let tempM: number = 0;
          let tempM2: number = 0;

          if(!Number(this.price) || this.losscut === undefined) {   // 指値価格、ロスカットレートが無い場合
            price = Number(this.price2);
            if(this.autoType == '1') { // losscut auto
              losscut = null;
            }
            else
              losscut = Number(this.losscut2);
          }
          else {
            price = Number(this.price);
            if(this.autoType == '1') { // losscut auto
              losscut = null;
            }
            else
              losscut = Number(this.losscut);
          }

          if(!Number(this.price2) || this.losscut2 === undefined) { // 逆指値価格、ロスカットレートが無い場合
            price2 = Number(this.price);
            if(this.autoType == '1') { // losscut auto
              losscut2 = null;
            }
            else
              losscut2 = Number(this.losscut);
          }
          else {
            price2 = Number(this.price2);
            if(this.autoType == '1') { // losscut auto
              losscut2 = null;
            }
            else
              losscut2 = Number(this.losscut2);
          }

          // 任意証拠金
          //   ・売買区分が「1：売」
          //   (ロスカットレート－注文価格－ロスカット幅)×コンバージョンレートBID×注文数量×取引単位
          //  ・売買区分が「2：買」
          //   (ロスカットレート－注文価格＋ロスカット幅)×コンバージョンレートBID×注文数量×取引単位×（－1）
          //  ※最後に小数点以下切り捨て（ROUND_DOWN）
          if(this.buySellType == CommonConst.SELL_TYPE_VAL){  // 売り
            if(losscut || losscut != null) {
              let val: number = ((losscut * 1000) - (price * 1000) - (this.losscutRange * 1000)) / 1000;
              tempM = parseInt((val * this.conversionBid * this.qty * this.tradeUnit).toString());
            }
            else {
              tempM = null;
            }
            if(losscut2 || losscut2 != null) {
              let val: number = ((losscut2 * 1000) - (price2 * 1000) - (this.losscutRange * 1000)) / 1000;
              tempM2 = parseInt((val * this.conversionBid * this.qty * this.tradeUnit).toString());
            }
            else {
              tempM2 = null;
            }
          }
          else{  // 買い
            if(losscut || losscut != null) {
              let val: number = ((losscut * 1000) - (price * 1000) + (this.losscutRange * 1000)) / 1000;
              tempM = parseInt((val * this.conversionBid * this.qty * this.tradeUnit * -1).toString());
            }
            else {
              tempM = null;
            }
            if(losscut2 || losscut2 != null) {
              let val: number = ((losscut2 * 1000) - (price2 * 1000) + (this.losscutRange * 1000)) / 1000;
              tempM2 = parseInt((val * this.conversionBid * this.qty * this.tradeUnit * -1).toString());
            }
            else {
              tempM2 = null;
            }
          }
          if(!tempM && !tempM2) {
            if((tempM == 0 && tempM2 == 0) && (losscut && losscut2)) {  // 計算して数字が0の場合は0を表示するように
              numTempMargin = Math.max(tempM, tempM2);
              this.tempMarginFull = StringUtil.CommaWithZero(numTempMargin);
              this.tempMargin = this.ajustNum(this.tempMarginFull);
  
              this.needTempMarginFull = StringUtil.CommaWithZero(numNeedMargin + numTempMargin);
              this.needTempMargin = this.ajustNum(this.needTempMarginFull);
            }
            else {
              this.tempMargin = '-';      // 任意証拠金
              this.needTempMargin = this.needMargin;  // 拘束証拠金
            }
          }
          else {
            numTempMargin = Math.max(tempM, tempM2);
            this.tempMarginFull = StringUtil.CommaWithZero(numTempMargin);
            this.tempMargin = this.ajustNum(this.tempMarginFull);

            this.needTempMarginFull = StringUtil.CommaWithZero(numNeedMargin + numTempMargin);
            this.needTempMargin = this.ajustNum(this.needTempMarginFull);
          }
        }
      }
    }
    else{   // oco以外の場合
      if(!Number(this.price)) { // 指値両方に「空白、０」が入力されている場合
        // 必要証拠金、任意証拠金、拘束証拠金には「-円」を表示する
        this.needMargin = '-';      // 必要証拠金
        this.tempMargin = '-';      // 任意証拠金
        this.needTempMargin = '-';  // 拘束証拠金
        this.updateView();
        return;
      }
      let numNeedMargin = Math.floor(Number(this.price) * this.qty * this.tradeUnit * this.conversionBid / this.productInfo.leverageRatio);
      let priceLosscut:number = 0;
      let losscut: number = 0;
      if(this.autoType == '1') {
        losscut = null;
      }
      else
        losscut = this.losscut;
      this.needMarginFull = StringUtil.Comma(numNeedMargin);
      this.needMargin = this.ajustNum(this.needMarginFull);

      if(losscut == null || losscut === undefined || !((losscut.toString()).length) ) {
        this.tempMarginFull = '-';
        this.tempMargin = '-';
        this.needTempMarginFull = StringUtil.Comma(numNeedMargin);
        this.needTempMargin = this.ajustNum(this.needTempMarginFull);
      }
      else {
        // 小數點計算のため
        if(this.buySellType == CommonConst.SELL_TYPE_VAL){
          priceLosscut = ((losscut * 1000) - (Number(this.price) * 1000) - (Number(this.losscutRange) * 1000)) / 1000;
        }else{
          priceLosscut = ((losscut * 1000) - (Number(this.price) * 1000) + (Number(this.losscutRange) * 1000)) * -1 / 1000;
        }
        // 任意証拠金
        //   ・売買区分が「1：売」
        //   (ロスカットレート－注文価格－ロスカット幅)×コンバージョンレートBID×注文数量×取引単位
        //  ・売買区分が「2：買」
        //   (ロスカットレート－注文価格＋ロスカット幅)×コンバージョンレートBID×注文数量×取引単位×（－1）
        //  ※最後に小数点以下切り捨て（ROUND_DOWN）
        let numTempMargin = parseInt((priceLosscut *  this.conversionBid * this.qty * this.tradeUnit).toString());
        this.tempMarginFull = StringUtil.CommaWithZero(numTempMargin);
        this.tempMargin = this.ajustNum(this.tempMarginFull);

        this.needTempMarginFull = StringUtil.CommaWithZero(numNeedMargin + numTempMargin);
        this.needTempMargin = this.ajustNum(this.needTempMarginFull);
      }
    }
    this.updateView();
	}

  /**
   * 1億以上で枠内に収まらない場合は見切れる部分に"..."を付与して返却する
   */
  private ajustNum(num:string) :string {
    if (num.length > 12) {
      num = num.substring(0, 9) + "...";
    }
    return num;
  }

	public holdMarginCalc(){
		let price;
    let holdvalue;
    let decPCnt = StringUtil.getDecimalPCnt(this.boUnit);
    if(this.settleType != CommonConst.SETTLE_ORDER_VAL) {
      return;
    }

		if(this.executionType == "1"){  // 成行
			if(this.buySellType == CommonConst.SELL_TYPE_VAL){
				price = this.bidPrice;
			}else{
				price = this.askPrice;
			}
		}else{
			price = this.price;
		}

    if(price == undefined || !Number(price)) {
      this.holdMargin = 0;
      this.holdMarginTxt = '-'
      this.holdMarginTxtFull = '-'
    }
    else {
      if(this.buySellType == CommonConst.SELL_TYPE_VAL){
        // (注文価格※1－建値※2)×取引数量×銘柄の取引単位×コンバージョンレート.BID
        holdvalue =  Number((price - this.holdprice).toFixed(decPCnt));
      }else{
        // (建値※2－注文価格※1)×取引数量×銘柄の取引単位×コンバージョンレート.BID
        holdvalue =  Number((this.holdprice - price).toFixed(decPCnt));
      }
      this.holdMargin = Math.floor(holdvalue * this.qty * this.conversionBid *  this.tradeUnit);
      this.holdMarginTxtFull = StringUtil.formatNumber(this.holdMargin, '#,##0', true);
      this.holdMarginTxt = this.ajustNum(this.holdMarginTxtFull);
    }

    this.updateView();
	}

	public holdMarginCalcOco(){

    if(this.settleType != CommonConst.SETTLE_ORDER_VAL || this.orderType != CommonConst.ORDER_OCO) {
      this.marginCalc();
      this.updateView();
      return;
    }

    // if(this.buySellType != CommonConst.SELL_TYPE_VAL) {
    //   this.marginCalc();
    // }

		let price;
		let price2;
		let holdprice;
    let holdprice2;
    let decPCnt = StringUtil.getDecimalPCnt(this.boUnit);

		price = this.price;
		price2 = this.price2;
		if(this.buySellType == CommonConst.SELL_TYPE_VAL){
      if(!String(price).length || price == '0') {
        this.holdMargin = 0;
        this.holdMarginTxt = '-';
        this.holdMarginTxtFull = '-'
      }
      else {
        holdprice =  Number((price - this.holdprice).toFixed(decPCnt));
        this.holdMargin = Math.floor(holdprice * this.qty * this.conversionBid *  this.tradeUnit);
        this.holdMarginTxtFull = StringUtil.formatNumber(this.holdMargin, '#,##0', true);
        this.holdMarginTxt = this.ajustNum(this.holdMarginTxtFull);
      }
      if(!String(price2).length || price2 == '0') {
        this.holdMargin2 = 0;
        this.holdMargin2Txt = '-';
        this.holdMargin2TxtFull = '-';
      }
      else {
        holdprice2 =  Number((price2 - this.holdprice).toFixed(decPCnt));
        this.holdMargin2 = Math.floor(holdprice2 * this.qty * this.conversionBid *  this.tradeUnit);
        this.holdMargin2TxtFull = StringUtil.formatNumber(this.holdMargin2, '#,##0', true);
        this.holdMargin2Txt = this.ajustNum(this.holdMargin2TxtFull);
      }
    }
    else{
      if(!String(price).length || price == '0') {
        this.holdMargin = 0;
        this.holdMarginTxt = '-';
        this.holdMarginTxtFull = '-'
      }
      else {
        holdprice =  Number((this.holdprice-price).toFixed(decPCnt));
        this.holdMargin = Math.floor(holdprice * this.qty * this.conversionBid *  this.tradeUnit);
        this.holdMarginTxtFull = StringUtil.formatNumber(this.holdMargin, '#,##0', true);
        this.holdMarginTxt = this.ajustNum(this.holdMarginTxtFull);
      }
      if(!String(price2).length || price2 == '0') {
        this.holdMargin2 = 0;
        this.holdMargin2Txt = '-';
        this.holdMargin2TxtFull = '-';
      }
      else {
        holdprice2 = Number((this.holdprice-price2).toFixed(decPCnt));
        this.holdMargin2 = Math.floor(holdprice2 * this.qty * this.conversionBid *  this.tradeUnit);
        this.holdMargin2TxtFull = StringUtil.formatNumber(this.holdMargin2, '#,##0', true);
        this.holdMargin2Txt = this.ajustNum(this.holdMargin2TxtFull);
      }
		}
		// this.marginCalc();

		this.updateView();
	}

	public setModifyInfo(orderList: any, priceValue: any){
    // if(orderList[0].settleType == CommonConst.NEW_ORDER_VAL) {
    //   this.losscut = this.boUnit;
  // }
    if(this.holdprice) {
      let format = StringUtil.getBoUnitFormat(this.boUnit,true);
      this.holdpriceTxt = StringUtil.formatNumber(this.holdprice, format);
      if (this.isMean) {
        this.holdpriceTxt = '平均 ' + this.holdpriceTxt
      }
    }
		if(orderList.length >1){
			this.orderType =orderList[0].orderType;
			this.settleType =orderList[0].settleType;
			this.trailWidth = orderList[0].trailWidth;
			// this.holdprice = orderList[0].holdprice?orderList[0].holdprice:0;
			if(orderList[0].orderType =="2" || orderList[0].orderType =="4"){
				this.orderType2=orderList[1].orderType;
				this.orderStatus=orderList[0].orderStatus;
				this.orderStatus2=orderList[1].orderStatus;
				this.buySellType = orderList[0].buySellType;
        this.qty = orderList[0].orderQuantity;
        if(priceValue)
          this.price = priceValue;
        else
				  this.price = this.getDecimalFormatPriceWithoutComma(orderList[0].orderPrice);
				this.executionType = orderList[0].executionType;
				this.orderTime = orderList[0].invalidDateType;
				this.buySellType2 = orderList[1].buySellType;
        this.qty2 = orderList[1].orderQuantity;
        if(priceValue)
          this.price2 = priceValue;
        else
				  this.price2 = this.getDecimalFormatPriceWithoutComma(orderList[1].orderPrice);
				this.executionType2 = orderList[1].executionType;
				this.orderTime2 = orderList[1].invalidDateType;
				this.autoType = orderList[0].losscutRate==null?"1":"2";
				if(this.autoType =="2"){
					this.losscut = orderList[0].losscutRate;
				}
				if(this.settleType=="0"){
					this.marginCalc();
				}
				if(this.orderStatus == "2"){
					this.showDisableDiv = true;
					let coverDiv = $(this.element.nativeElement).find(".poup_div_class");
					if (this.autoType == "2") {
						coverDiv.css("height",264);
					}
				}
				// ifd-oco
				if(orderList[2]){
          if(priceValue)
            this.price3 = priceValue;
          else
            this.price3 = this.getDecimalFormatPriceWithoutComma(orderList[2].orderPrice);
				}
			}else if(orderList[0].orderType =="3"){
				this.buySellType = orderList[0].buySellType;
        this.qty = orderList[0].orderQuantity;
        if(priceValue) {
          this.price = priceValue;
          this.price2 = priceValue;
        }
        else {
          this.price = this.getDecimalFormatPriceWithoutComma(orderList[0].orderPrice);
          this.price2 = this.getDecimalFormatPriceWithoutComma(orderList[1].orderPrice);
        }

				this.orderTime = orderList[0].invalidDateType;

				if(orderList[0].losscutRate !=null ||  orderList[1].losscutRate !=null){
					this.autoType ="2";
					this.losscut = this.getDecimalFormatPriceWithoutComma(orderList[0].losscutRate);
					this.losscut2 = this.getDecimalFormatPriceWithoutComma(orderList[1].losscutRate);
				}else{
					this.autoType ="1";
				}

				if(this.settleType=="1"){
					this.holdMarginCalcOco();
				}else{
					this.marginCalc();
				}

			}else{
				this.buySellType = orderList[0].buySellType;
				this.orderType2=orderList[1].orderType;
				this.orderStatus=orderList[0].orderStatus;
				this.orderStatus2=orderList[1].orderStatus;
				this.trailWidth = orderList[0].trailWidth;
				this.qty = orderList[0].orderQuantity;
				this.executionType = orderList[0].executionType;
				this.buySellType2 = orderList[1].buySellType;
        this.qty2 = orderList[1].orderQuantity;
				// this.holdprice = orderList[0].holdprice?orderList[0].holdprice:0;
        if(priceValue) {
          this.price = priceValue;
          this.price2 = priceValue;
          this.price3 = priceValue;
        }
        else {
          this.price = this.getDecimalFormatPriceWithoutComma(orderList[0].orderPrice);
          this.price2 = this.getDecimalFormatPriceWithoutComma(orderList[1].orderPrice);
          this.price3 = this.getDecimalFormatPriceWithoutComma(orderList[2].orderPrice);
        }

				this.orderTime = orderList[0].invalidDateType;
				this.orderTime2 = orderList[1].invalidDateType;

				this.autoType = orderList[0].losscutRate==null?"1":"2";
				if(this.autoType =="2"){
					this.losscut = orderList[0].losscutRate;
				}
				this.marginCalc();
			}
    }
    else{
			this.settleType =orderList[0].settleType;
			this.buySellType = orderList[0].buySellType;
			this.orderType = orderList[0].orderType;
			this.executionType = orderList[0].executionType;
			this.qty = orderList[0].orderQuantity;
			this.orderTime = orderList[0].invalidDateType;

      if(priceValue)
        this.price = priceValue;
      else
			  this.price = this.getDecimalFormatPriceWithoutComma(orderList[0].orderPrice);

			if(this.settleType =='0'){

				this.autoType = orderList[0].losscutRate==null?"1":"2";
				if(this.autoType =="2"){
					this.losscut = orderList[0].losscutRate;
				}
				this.marginCalc();
 		  }else{
 			  if(this.orderType =="6"){
 				  this.isSave =true;
 				  this.trailWidth = orderList[0].trailWidth;
	 				 if(orderList[0].trailPrice != null){
	 					if(this.buySellType =="2"){
	 		        if(orderList[0].trailPrice < this.price){
	 		            this.trailing=true;
	 		        }
	 					}else{
	 		        if(orderList[0].trailPrice > this.price){
	 		        	this.trailing=true;
	 		        }
	 					}

						this.trailPrice2 = this.getDecimalFormatPriceWithoutComma(orderList[0].trailPrice);
	 					if(this.trailing){
							 this.trailPrice2 = this.getDecimalFormatPrice(orderList[0].orderPrice) +" [現在 : "+
											   this.getDecimalFormatPrice(orderList[0].trailPrice)+"]";
	 				  }
	 				}
 			  }else{
 				  this.isSave =false;
 			  }
 			 this.holdMarginCalc();
 		  }
		}
		this.updateView();
	}

	private getDecimalFormatPrice(price) {
		return StringUtil.currency(price, this.boUnit);
  }

	private getDecimalFormatPriceWithoutComma(price) {
		return (StringUtil.currency(price, this.boUnit)).replace(/,/g, '');
	}

  /**
   * return style class of transfer price
   * @param price
   */
  public getClassByLen(price) {
    if (price == null) return '';
    if (StringUtil.countLength(price) < 11) {
      return 'label-num';
    } else {
      return 'label-bright';
    }
  }

  public onClickOrderTime(orderTimeType) {
    if (orderTimeType == "orderTime") {
      if (this.orderTime > this.orderTime2) {
        this.orderTime2 = "";
      }
      this.orderTimeBorder = false;
    } else if (orderTimeType == "orderTime2") {
      this.orderTime2Border = false;
    }
    this.updateView();
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
	public marginChange(plusLabel){
		this.plusLabel =plusLabel;
	}
	public priceErr(priceTool){
		this.priceTool =priceTool;
		this.updateView();
	}
	public price2Err(price2Tool){
    this.price2Tool =price2Tool;
    this.updateView();
	}
	public price3Err(price3Tool){
    this.price3Tool =price3Tool;
    this.updateView();
	}
	public trailErr(trailWidthTool){
    this.trailWidthTool =trailWidthTool;
    this.updateView();
	}
	public losscutErr(losscutTool){
    this.losscutTool = losscutTool;
    this.updateView();
	}
	public losscut2Err(losscut2Tool){
    this.losscut2Tool = losscut2Tool;
    this.updateView();
	}
	public orderTimeErr(orderTimeTool){
    this.orderTimeTool = orderTimeTool;
    this.updateView();
  	}
	public orderTime2Err(orderTime2Tool){
    this.orderTime2Tool = orderTime2Tool;
    this.updateView();
  }

  public dismissError(errKbn) {
    this[errKbn] = false;
    this.onErrorDismiss.emit();
  }
  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
}
