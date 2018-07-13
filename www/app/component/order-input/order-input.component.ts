/**
 *
 * 新規注文入力
 *
 */
import { Component, OnInit, ElementRef, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import {
  PanelViewBase, ComponentViewBase, StringUtil,
  PanelManageService, ResourceService,
  CommonConst, Tooltips,
  IViewState, IViewData, ViewBase
} from "../../core/common";

// #2342
import { BusinessService } from '../../service/business.service';
import { ValidatorNumber } from '../../util/validator.directive';
import { Messages } from '../../../../common/message';
declare var $: any;
//

//-----------------------------------------------------------------------------
// COMPONENT : OrderInputComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'order-input',
  templateUrl: './order-input.component.html',
  styleUrls: ['./order-input.component.scss']
})
export class OrderInputComponent extends ComponentViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  public buysellType: string = "";
  public orderType: string = "";
  public execType: string = "0";    // 新規、決済
  public qty: number;
  public limitPrice: number; // 指値注文価格
  public stopPrice: number; // 逆指値注文価格
  public singleMulti: boolean = true;
  public bidPrice: number = 0;
  public askPrice: number = 0;
  public margin: string = "-";
  public marginFull: string = "-";
  public orderTime: string = "";
  public conversionBid;
  public productList;
  public allowqty: number;
  public validFlag: string = "1";
  public tradeUnit: number = 1;
  public maxAllow: number;
  public boUnit: number = 0;
  public bsMulti: string = "";
  public ifdOCOType: string = "1";
  public priceIfd: number;
  public priceIfdOco: number;
  public qtyIfd2: number = 0;
  public priceIfd2: number;
  public orderIfdType: string;
  public priceOco: number;
  public priceOco2: number;
  public priceIfdOcoLimit: number;
  public priceIfdOcoStop: number;
  public orderOcoType;
  public isdisabled :boolean = false;

  public priceMax: number;
  public orderTimeIfd2: string;
  public singleMultiBoolean: boolean = true;


  public allowqtyBorder: boolean = false;
  public buysellTypeBorder: boolean = false;
  public buysellTypeBorder2: boolean = false;
  public orderTimeBorder: boolean = false;
  public qtyBorder: boolean = false;
  public limitPriceBorder: boolean = false;
  public stopPriceBorder: boolean = false;
  public bsMultiBorder: boolean = false;
  public priceIfdBorder: boolean = false;
  public priceIfdOcoBorder: boolean = false;
  public orderIfdTypeBorder: boolean = false;
  public orderTimeIfd2Border: boolean = false;
  public qtyIfd2Border: boolean = false;
  public priceIfd2Border: boolean = false;
  public priceOcoBorder: boolean = false;
  public priceOco2Border: boolean = false;
  public priceIfdOcoLimitBorder: boolean = false;
  public priceIfdOcoStopBorder: boolean = false;
  public orderOcoTypeBorder: boolean = false;
  public marginBorder: boolean = false;
  public buysellTypeTool: boolean = false;
  public orderTimeTool: boolean = false;
  public qtyTool: boolean = false;
  public allowqtyTool: boolean = false;
  public limitPriceTool: boolean = false;
  public stopPriceTool: boolean = false;
  public bsMultiTool: boolean = false;
  public priceIfdTool: boolean = false;
  public priceIfdOcoTool: boolean = false;
  public orderIfdTypeTool: boolean = false;
  public orderTimeIfd2Tool: boolean = false;
  public qtyIfd2Tool: boolean = false;
  public priceIfd2Tool: boolean = false;
  public priceOcoTool: boolean = false;
  public priceOco2Tool: boolean = false;
  public priceIfdOcoLimitTool: boolean = false;
  public priceIfdOcoStopTool: boolean = false;
  public orderOcoTypeTool: boolean = false;
  public orderTimeOcoTool: boolean = false;
  public marginTool: boolean = false;

  // tooltip-message
  qtyMessage: string;
  qtyIfd2Message: string;
  limitPriceMessage: string;
  stopPriceMessage: string;
  priceIfdMessage: string;
  priceIfdOcoMessage: string;
  priceIfd2Message: string;
  priceOcoMessage: string;
  priceOco2Message: string;
  priceIfdOcoLimitMessage: string;
  priceIfdOcoStopMessage: string;
  orderTimeMessage: string = Messages.ERR_0039;
  orderTimeIfd2Message: string = Messages.ERR_0039;

  // #2344
  public tooltipMessage_complexExecutionType: string = Tooltips.TOOLTIP_MESSAGE_NEW_ORDER_COMPLEX_EXECUTION_TYPE;
  //

  @Output()
  onErrClick = new EventEmitter<any>();   // go, back button click
  @Output()
  onOrderTypeClick = new EventEmitter<any>();   // go, back button click
  @Output()
  onPanelRefresh = new EventEmitter<any>();
  @Output()
  onErrorDismiss = new EventEmitter<any>();
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(public panelMng: PanelManageService,
    public resource: ResourceService,
    public element: ElementRef,
    public changeRef: ChangeDetectorRef,
    public businessService: BusinessService  // #2344
  ) {
    super(panelMng, element, changeRef);

  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  ngOnInit() {
    super.ngOnInit();
    this.initComponent();
  }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  private initComponent() {

  }

  // #2342
  public getDefaultSinglePrice = () => {
    let self = this;
    if(self.buysellType == CommonConst.SELL_TYPE_VAL) {
      return(self.bidPrice);
    }
    else if(self.buysellType == CommonConst.BUY_TYPE_VAL) {
      return(self.askPrice);
    }
    else {
      return(self.askPrice);
    }
  }

  public getDefaultMultiPrice = (isFirst:boolean) => {
    let self = this;
    if(self.bsMulti == CommonConst.SELL_TYPE_VAL) {
      if(isFirst) {
        return(self.bidPrice);
      }
      else {
        return(self.askPrice);
      }
    }
    else if(self.bsMulti == CommonConst.BUY_TYPE_VAL) {
      if(isFirst) {
        return(self.askPrice);
      }
      else {
        return(self.bidPrice);
      }
    }
    else {
      return(self.askPrice);
    }
  }

  // #2414
  public didSetInputPrice(price:any) {
    let self = this;
    if(price) {
      let updatePrice:boolean = false;
      if(price === CommonConst.NEW_ORDER_PRICE_AUTO_UPDATE_PRICE) {
        updatePrice = true;
      }
      else {
        if (this.orderType == "2") {
          self.limitPrice = price;
        } else if (this.orderType == "3") {
          self.stopPrice = price;
        }
      }

      self.marginCalc(updatePrice);

      self.updateView();
    }
  }

  public onClickMultiOrderType() {
    this.onClickRefresh();
    this.onErrClick.emit();
  }

  public priceUpdate(price) {
    this.bidPrice = Number(price.bid);
    this.askPrice = Number(price.ask);

    this.validFlag = price.validFlag;

    this.marginCalc();
  }

  public conversionBidUpdate(bidPrice) {
    this.conversionBid = Number(bidPrice);
    this.marginCalc();
  }

  public isNullNumber(value:number):boolean {
    if (value == null || value == undefined || value.toString().length == 0) {
      return true;
    }
    return false;
  }

  public isEmptyNumber(value:number):boolean {
    if (this.isNullNumber(value) || value == 0) {
      return true;
    }
    return false;
  }

  public isEmptyStr(value:string):boolean {
    if (value == null || value == undefined || value.length == 0) {
      return true;
    }
    return false;
  }

  public marginCalc(updatePrice?:boolean) { // #2410
    let orderPrice = 0;
    let orderQty = 0;
    let decPCnt = StringUtil.getDecimalPCnt(Math.min(this.boUnit, this.tradeUnit));
    if (this.singleMultiBoolean) {
      if (this.execType == "0") {
        if (this.orderType == "1") {
          if (this.buysellType == "" || this.buysellType == "1") {
            orderPrice = this.bidPrice;
          } else {
            orderPrice = this.askPrice;
          }
        } else if (this.orderType == "2"){
          if (this.isEmptyNumber(this.limitPrice)) {
            this.margin = "-";
            this.updateView();
            return;
          } else {
            orderPrice = this.limitPrice;
          }
        } else if (this.orderType == "3"){
          if (this.isEmptyNumber(this.stopPrice)) {
            this.margin = "-";
            this.updateView();
            return;
          } else {
            orderPrice = this.stopPrice;
          }
        }
        if (this.isEmptyNumber(this.qty)) {
          this.margin = "-";
          this.updateView();
          return;
        } else {
          orderQty = this.qty;
        }
        let priceTotal = Number((orderPrice * orderQty * this.tradeUnit * this.conversionBid).toFixed(decPCnt));
        this.margin = StringUtil.Comma(Math.floor(priceTotal / this.productList.leverageRatio));
      } else {
        this.margin = "-";
      }
    } else {
      if (this.ifdOCOType == "1") {
        if (this.isEmptyNumber(this.priceIfd)) {
          this.margin = "-";
          this.updateView();
          return;
        } else {
          orderPrice = this.priceIfd;
        }
        if (this.isEmptyNumber(this.qty)) {
          this.margin = "-";
          this.updateView();
          return;
        } else {
          orderQty = this.qty;
        }
      } else if (this.ifdOCOType == "3") {
        if (this.isEmptyNumber(this.priceIfdOco)) {
          this.margin = "-";
          this.updateView();
          return;
        } else {
          orderPrice = this.priceIfdOco;
        }
        if (this.isEmptyNumber(this.qty)) {
          this.margin = "-";
          this.updateView();
          return;
        } else {
          orderQty = this.qty;
        }
      }
      else { // oco
        if (this.execType == '1' || (this.isEmptyNumber(this.priceOco) && this.isEmptyNumber(this.priceOco2))) {
          this.margin = "-";
          this.updateView();
          return;
        } else if (Number(this.priceOco) < Number(this.priceOco2)) {
          orderPrice = Number(this.priceOco2);
        } else {
          orderPrice = Number(this.priceOco);
        }

        if (this.isEmptyNumber(this.qty)) {
          this.margin = "-";
          this.updateView();
          return;
        } else {
          orderQty = this.qty;
        }

      }
      let priceTotal = Number((orderPrice * orderQty * this.tradeUnit * this.conversionBid).toFixed(decPCnt));
      this.margin = StringUtil.Comma(Math.floor(priceTotal / this.productList.leverageRatio));
    }

    if (this.isEmptyStr(this.margin)) {
      this.margin = "-";
    }

    if (this.margin.length > 12) {
      this.marginBorder = true;
      this.marginFull = this.margin;
      this.margin = this.margin.substring(0, 9) + "...";
    } else {
      this.marginFull = "";
      this.marginBorder = false;
    }
    this.margin = this.margin;

    // #2410
    if(updatePrice) {
      if (this.orderType == "2") {
        this.limitPrice = orderPrice;
      } else if (this.orderType == "3") {
        this.stopPrice = orderPrice;
      }
    }
    //

    this.updateView();
  }

  public onOrderType(orderType) {

    this.orderType = orderType;
    this.marginCalc();
    this.onOrderTypeClick.emit();
    this.onErrClick.emit();
    this.updateView();
  }

  public getIfdOcoType(orderType) {

    if (orderType == "4") {
      return "1";
    } else if (orderType == "5") {
      return "2";
    } else if (orderType == "6") {
      return "3";
    }
  }

  public onclickAllowQty(e, updown) {

    if (this.allowqty == null || this.allowqty == undefined) {
      this.allowqty = this.boUnit;
      return;
    }
    if (this.allowqty < 0) {
      this.allowqty = 0;
    }
    if (updown == "UP") {

      this.allowqty += this.boUnit;

      if (this.boUnit == 0.1) {
        this.allowqty = Number(this.allowqty.toFixed(1));
      } else if (this.boUnit == 0.01) {
        this.allowqty = Number(this.allowqty.toFixed(2));
      } else if (this.boUnit == 0.001) {
        this.allowqty = Number(this.allowqty.toFixed(3));
      }
      if (this.maxAllow < this.allowqty) {
        this.allowqty = this.maxAllow;
      }
    } else {

      this.allowqty -= this.boUnit;
      if (this.boUnit == 0.1) {
        this.allowqty = Number(this.allowqty.toFixed(1));
      } else if (this.boUnit == 0.01) {
        this.allowqty = Number(this.allowqty.toFixed(2));
      } else if (this.boUnit == 0.001) {
        this.allowqty = Number(this.allowqty.toFixed(3));
      }
      if (this.allowqty <= 0) {
        this.allowqty = 0;
      }
    }
    this.updateView();
  }

  public onClickOrderTime(type) {
    if (type == "ifd") {
      if(this.orderTime > this.orderTimeIfd2){
        this.orderTimeIfd2 = "";
      }
    }
    // this.onErrClick.emit();
  }

  public onclickBuysell() {
    this.marginCalc();
    // this.onErrClick.emit();
  }

  public setbuysellType() {
    this.buysellTypeTool = true;
    this.updateView();
  }
  public getbuysellType() {
    this.buysellTypeTool = false;
    this.updateView();
  }
  public setorderTime() {
    this.orderTimeTool = true;
    this.updateView();
  }
  public getorderTime() {
    this.orderTimeTool = false;
    this.updateView();
  }
  public setqty() {
    this.qtyTool = true;
    this.updateView();
  }
  public getqty() {
    this.qtyTool = false;
    this.updateView();
  }
  public setLimitPrice() {
    this.limitPriceTool = true;
    this.updateView();
  }
  public getLimitPrice() {
    this.limitPriceTool = false;
    this.updateView();
  }
  public setStopPrice() {
    this.stopPriceTool = true;
    this.updateView();
  }
  public getStopPrice() {
    this.stopPriceTool = false;
    this.updateView();
  }
  public setallowqty() {
    this.allowqtyTool = true;
    this.updateView();
  }
  public getallowqty() {
    this.allowqtyTool = false;
    this.updateView();
  }
  public setmargin() {
    this.marginTool = true;
    this.updateView();
  }
  public getmargin() {
    this.marginTool = false;
    this.updateView();
  }
  public setpriceIfd() {
    this.priceIfdTool = true;
    this.updateView();
  }
  public getpriceIfd() {
    this.priceIfdTool = false;
    this.updateView();
  }
  public setpriceIfdOco() {
    this.priceIfdOcoTool = true;
    this.updateView();
  }
  public getpriceIfdOco() {
    this.priceIfdOcoTool = false;
    this.updateView();
  }
  public setorderIfdType() {
    this.orderIfdTypeTool = true;
    this.updateView();
  }
  public getorderIfdType() {
    this.orderIfdTypeTool = false;
    this.updateView();
  }
  public setorderTimeIfd2() {
    this.orderTimeIfd2Tool = true;
    this.updateView();
  }
  public getorderTimeIfd2() {
    this.orderTimeIfd2Tool = false;
    this.updateView();
  }
  public setqtyIfd2() {
    this.qtyIfd2Tool = true;
    this.updateView();
  }
  public getqtyIfd2() {
    this.qtyIfd2Tool = false;
    this.updateView();
  }
  public setpriceIfd2() {
    this.priceIfd2Tool = true;
    this.updateView();
  }
  public getpriceIfd2() {
    this.priceIfd2Tool = false;
    this.updateView();
  }
  public setpriceOco() {
    this.priceOcoTool = true;
    this.updateView();
  }
  public getpriceOco() {
    this.priceOcoTool = false;
    this.updateView();
  }
  public setpriceOco2() {
    this.priceOco2Tool = true;
    this.updateView();
  }
  public getpriceOco2() {
    this.priceOco2Tool = false;
    this.updateView();
  }
  public setpriceIfdOcoLimit() {
    this.priceIfdOcoLimitTool = true;
    this.updateView();
  }
  public getpriceIfdOcoLimit() {
    this.priceIfdOcoLimitTool = false;
    this.updateView();
  }
  public setpriceIfdOcoStop() {
    this.priceIfdOcoStopTool = true;
    this.updateView();
  }
  public getpriceIfdOcoStop() {
    this.priceIfdOcoStopTool = false;
    this.updateView();
  }
  public setorderOcoType() {
    this.orderOcoTypeTool = true;
    this.updateView();
  }
  public getorderOcoType() {
    this.orderOcoTypeTool = false;
    this.updateView();
  }
  public setorderTimeOco() {
    this.orderTimeOcoTool = true;
    this.updateView();
  }
  public getorderTimeOco() {
    this.orderTimeOcoTool = false;
    this.updateView();
  }

  public onClickRefresh() {
    this.marginCalc();
    this.onPanelRefresh.emit();
  }

  public dismissError(errKbn) {
    this[errKbn] = false;
    this.onErrorDismiss.emit();
  }

public test(){
  return true;
}
}
