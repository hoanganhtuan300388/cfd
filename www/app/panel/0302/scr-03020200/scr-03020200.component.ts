/**
 * 
 * ロスカットレート変更
 * 
 */
import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { PanelManageService, BusinessService, PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips, StringUtil} from '../../../core/common';
import { MessageBox } from '../../../util/utils';
import { AskBidUnitComponent } from '../../../component/ask-bid-unit/ask-bid-unit.component';
import { ERROR_CODE } from "../../../../../common/businessApi";
import * as values from "../../../values/Values";
import { GetAttentionMessage } from '../../../util/commonUtil';
declare var moment;

// #2565
import { ILayoutInfo } from "../../../values/Values";
import { DeepCopy } from '../../../util/commonUtil';
//

import { Messages } from '../../../../../common/message'

const TITLE_GET_LOSSCUT_ERR = "ロスカットレート情報取得エラー";
const TITLE_CALC_LOSSCUT_ERR = "ロスカットレート計算エラー";
const TITTLE_CHANGE_LOSSCUT_ERR = "ロスカットレート変更エラー";

//-----------------------------------------------------------------------------
// COMPONENT : Scr03020200Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03020200',
  templateUrl: './scr-03020200.component.html',
  styleUrls: ['./scr-03020200.component.scss']
})
export class Scr03020200Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  @ViewChild('AskBidUnit') public compAskBid: AskBidUnitComponent;

  // params
  public productCode:string = '';
  public buySellType:string = '';
  public positionKey:string[] = [];

  // view state
  public isAll:boolean = false;
  public calcType:string = 'losscut'; // losscut, margin
  public calcState:string = 'before'; // before, after
  public showLoading:boolean = false; // loading
  public inputMargin:string = ''; // margin inputbox
  public inputLosscut:string = ''; // losscut inputbox
  public addCancelType:string = '+'; // +,-
  public maxLosscut = "999999999999999";
  public modePlus:string = "+";

  // view data
  public productName:string = '';
  public simpleName:string = '';
  public margin:string = ''; // 必要証拠金
  public optionalMarginBefore:string = ''; // 任意証拠金（現在）
  public optionalMarginAfter:string = ''; // 任意証拠金（変更後）
  public optionalMarginVariance:string = ''; // 任意証拠金差異額
  public marginBefore:string = ''; // 拘束証拠金（現在）
  public marginAfter:string = ''; // 拘束証拠金（変更後）
  public orderQuantity:string = ''; // 建玉数
  public orderPrice:string = ''; // 建単価
  public orderPriceRange:string = ''; // 建単価 Range
  public losscutRateBefore:string = ''; // ロスカットレート（現在）
  public losscutRateAfter:string = ''; // ロスカットレート（変更後）
  public losscutRateBeforeRange:string = ''; // ロスカットレート（現在） Range
  public marketPowerBefore:string = ''; // 取引余力（現在）
  public marketPowerAfter:string = ''; // 取引余力（変更後）
  public message:string = '-';
  public boUnit = 1;
  public baseLosscut;

  // tooltips & messages
  public losscutError:boolean = false;
  public losscutTooltip:boolean = false;
  public losscutMessage:string = "";
  public marginError:boolean = false;
  public marginTooltip:boolean = false;
  public marginMessage:string = "";
  
  // product attentions
  public hasAttentionMessage:boolean = false;
  public showAttentionTooltip:boolean = false;
  public attentionTooltip:string = '';
   
  // response data
  public subscribeTick:Subscription;
  public productInfo:values.IProductInfo;
  public losscutRateInfo:any;
  public resLoscutRateInfo:values.IResLosscutRateInfo;
  public resCalcLosscutRate:values.IResCalcLosscutRate;

  public baseIdx:number = 0;

  public isCalcBtnDisable:boolean = false;
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public element:  ElementRef,
               public business: BusinessService,
               public changeRef:ChangeDetectorRef ) {
    super( '03020200', screenMng, element, changeRef);
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
      layout.option = {};
      layout.option.buySellType = self.buySellType;
      layout.option.isAll = self.isAll;

      if(self.isAll != true) {
        if(self.positionKey && self.positionKey.length > 0) {
          layout.option.positionKey = self.positionKey[0];
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
  
	protected initLayout(param:any){
    super.initLayout(param);

    if(param) {
      this.isAll = param.layout.option.isAll;
      this.productCode = param.layout.productCode;
      this.buySellType = param.layout.option.buySellType;
  
      this.productInfo = this.business.symbols.getSymbolInfo(this.productCode);
      this.productName = this.productInfo.meigaraSeiKanji;
      this.simpleName = this.productInfo.meigaraRyakuKanji;
      this.compAskBid.productList = this.productInfo;
      this.compAskBid.currency = this.productInfo.currency;

      this.getPriceList();
      this.attentionInfo();

      if(this.isAll == true){
        this.business.getProductPositionList({cfdProductCode:this.productCode}).subscribe(val=>{
          val.result.positionList.forEach(m=>{
            if(m.buySellType == this.buySellType){
              this.positionKey.push(m.positionKey);
            }
          });
          this.getLosscutRateInfo();
        })
      } else{
        this.positionKey.push(param.layout.option.positionKey);
        this.getLosscutRateInfo();
      }

      if(this.productInfo){
        if(this.isAll){
          this.setTitle("ロスカットレート変更[一括]", this.simpleName);
        } else {
          let positionKey = this.positionKey[0].match(/\d{4}$/) ? this.positionKey[0].match(/\d{4}$/)[0] : '';
          this.setTitle("ロスカットレート変更[" + positionKey+']', this.simpleName);
        }
      }
    }
    this.baseIdx = Number(this.uniqueId.split("_")[2])*1000;
    this.updateView();
  }  

  ngOnDestroy(){
    super.ngOnDestroy();
    if(this.subscribeTick){
      this.subscribeTick.unsubscribe();
      this.subscribeTick = null;
    }
  }
  
  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  public onChangeAskBidUnit($event){
  }

  public setAttentionTooltip(isShow?){
    this.showAttentionTooltip = isShow;
    this.updateView();
  }

  public hideError(){
    this.marginTooltip = false;
    this.losscutTooltip = false;
    this.marginError = false;
    this.losscutError = false;
  }

  public showTooltip(){
    if(!this.marginTooltip) this.marginTooltip = true;
    if(!this.losscutTooltip) this.losscutTooltip = true;
    this.updateView();
  }

  public hideTooltip(){
    if(this.marginTooltip) this.marginTooltip = false;
    if(this.losscutTooltip) this.losscutTooltip = false;
    this.updateView();
  }

  // public onInputEventLosscut($event) {
  //   let updown;
  //   if($event.keyCode == 38 || ($event.wheelDeltaY && $event.wheelDeltaY > 0)) updown = 'UP';
  //   if($event.keyCode == 40 || ($event.wheelDeltaY && $event.wheelDeltaY < 0)) updown = 'DOWN';
  //   if(!updown) return;
  //   this.onChangeLosscut(updown);
  // }

  // public onChangeLosscut(updown){
  //   this.hideError();
  //   let boUnit:number = this.productInfo.boUnit;
  //   let numLosscut:number = Number(this.inputLosscut);
  //   if(!this.inputLosscut || this.inputLosscut == '') {
  //     this.inputLosscut = StringUtil.formatNumber(this.resLoscutRateInfo.result.losscutRateCalcBefore,StringUtil.getBoUnitFormat(boUnit,false));
  //   } else {
  //     if(updown == "UP" && numLosscut >= 0) numLosscut += boUnit;
  //     else if(updown == "DOWN" && numLosscut > 0) numLosscut -= boUnit;
  //     if(numLosscut < 0) numLosscut = 0;
  //     this.inputLosscut = StringUtil.formatNumber(numLosscut,StringUtil.getBoUnitFormat(boUnit,false));
  //   }
  //   this.updateView();
  // }
  // public onChangeLosscut(ctrl, updown){
  //   if(!this.inputLosscut || this.inputLosscut == '') {
  //     let fmt = StringUtil.getBoUnitFormat(this.boUnit,false);
  //     this.inputLosscut = StringUtil.formatNumber(this.resLoscutRateInfo.result.losscutRateCalcBefore, fmt);
  //   }else{
  //     if(updown == "UP"){
  //       ctrl.increase();
  //     }else{
  //       ctrl.decrease();
  //     }
  //   }
  // }

  public onInputEventMargin($event) {
    let updown;
    if($event.keyCode == 38 || ($event.wheelDeltaY && $event.wheelDeltaY > 0)) updown = 'UP';
    if($event.keyCode == 40 || ($event.wheelDeltaY && $event.wheelDeltaY < 0)) updown = 'DOWN';
    if(!updown) return;
    this.onChangeMargin(updown);
  }

  public onChangeMargin(updown){
    this.hideError();
    let numMargin:number = this.inputMargin ? Number(this.inputMargin) : 0;
    let boUnit:number = this.productInfo.boUnit;
    if(updown == "UP" && numMargin >= 0) numMargin += 1;
    else if(updown == "DOWN" && numMargin > 0) numMargin -= 1;
    if(numMargin < 0) numMargin = 0;
    this.inputMargin = String(numMargin);
    this.updateView();
  }

  public changeAddCancelType($event, type){
    this.addCancelType = type;
  }

  public changeState(state:string){
    this.calcState = state;
    this.clearAfterView();
    this.getLosscutRateInfo();
  }

  public clearAfterView(){
    this.margin = ''; // 必要証拠金
    this.optionalMarginAfter = ''; // 任意証拠金（変更後）
    this.optionalMarginVariance = ''; // 任意証拠金差異額
    this.marginAfter = ''; // 拘束証拠金（変更後）
    this.losscutRateAfter = ''; // ロスカットレート（変更後）
    this.marketPowerAfter = ''; // 取引余力（変更後）
    this.message = '-';
  }

  public format(num:number,maxLen?:number,boUnit?:number,psign?:boolean):string {
    let format  = boUnit ? StringUtil.getBoUnitFormat(boUnit) : '#,###';
    let str = num ? StringUtil.formatNumber(num, format, psign) : '0';
    if(psign && maxLen) maxLen++;
    if(maxLen && str.length > maxLen) str = str.substr(str.length-maxLen,maxLen);
    return str;
  }

  public format2(num:number,maxLen?:number,boUnit?:number,psign?:boolean):string {
    let format  = boUnit ? StringUtil.getBoUnitFormat(boUnit) : '#,###';
    let str = num ? StringUtil.formatNumber(num, format, psign) : num.toString();
    if(psign && maxLen) maxLen++;
    if(maxLen && str.length > maxLen) str = str.substr(str.length-maxLen,maxLen);
    return str;
  }  

  //--------------//
  // HTTP REQUEST //
  //--------------//
  public getPriceList(){
    let productCode = this.productCode;

    let input:values.IReqPriceList = {
      productCodes:productCode
    };

    this.business.getPriceList(input).subscribe(
      val=>{
        switch(val.status){
          case ERROR_CODE.OK:
            // request real tick
            this.subscribeTick = this.business.symbols.tick(productCode).subscribe(val=>{
              this.compAskBid.realUpdate(val);
            });
            
            // update ask & bid
            let price = val.result.priceList[0];
            this.compAskBid.update(price);
            break;
          case ERROR_CODE.WARN:
          case ERROR_CODE.NG:
        }

      },
      err=>{
        switch(err.status){
          case ERROR_CODE.NETWORK:
          case ERROR_CODE.HTTP:
        }
      }
    )
  }

  public getLosscutRateInfo(){    
    let input:values.IReqLosscutRateInfoList = {
      positionKeys : this.positionKey
    };

    this.showLoading = true;
    this.business.getLosscutRateInfo(input).subscribe(
      val=>{
        this.showLoading = false;
        console.log(val);
        this.resLoscutRateInfo = val;
        switch(val.status){
          case ERROR_CODE.OK:
          this.calcState = 'before';
          let losscutRateInfo = this.resLoscutRateInfo.result;
          this.boUnit = this.productInfo.boUnit;
          this.baseLosscut = this.resLoscutRateInfo.result.losscutRateCalcBefore;

          let unit = this.boUnit.toString().split('.')[1];
          if(unit){
            this.maxLosscut = "999999999999999";
            unit = unit.replace(/\d/g,'9');
            this.maxLosscut += '.'+unit;
          }
          
          if(losscutRateInfo){
            this.margin = this.format(losscutRateInfo.margin,11);
            this.optionalMarginBefore = this.format2(losscutRateInfo.optionalMarginBefore,11);
            this.optionalMarginAfter = '';
            this.optionalMarginVariance = '';
            this.marginBefore = this.format2(losscutRateInfo.optionalMarginBeforeTotal,11);
            this.marginAfter = '';
            this.orderQuantity = this.format(losscutRateInfo.quotationQuantity,8) +' ('+(this.format(losscutRateInfo.orderQuantity,8)?this.format(losscutRateInfo.orderQuantity,8):'0')+')';

            if(this.isAll){
              this.orderPrice = this.format(losscutRateInfo.quotationPrice,8,this.boUnit);
              this.orderPriceRange = ' ('+this.format(losscutRateInfo.minQuotationPrice,11,this.boUnit) + '～' + this.format(losscutRateInfo.maxQuotationPrice,11,this.boUnit)+')';
              this.losscutRateBefore = this.format(losscutRateInfo.losscutRateCalcBefore,11,this.boUnit);
              this.losscutRateBeforeRange = ' ('+this.format(losscutRateInfo.minLosscutRate,8,this.boUnit) + '～' + this.format(losscutRateInfo.maxLosscutRate,11,this.boUnit)+')';
            } else {
              this.orderPrice = this.format(losscutRateInfo.quotationPrice,8,this.boUnit);
              this.orderPriceRange = '';
              this.losscutRateBefore = this.format(losscutRateInfo.losscutRateCalcBefore,11,this.boUnit);
              this.losscutRateBeforeRange = '';
            }
            
            this.losscutRateAfter = '';
            this.marketPowerBefore = this.format(losscutRateInfo.marketPowerBefore,11);
            this.marketPowerAfter = '';
  
            if(this.isAll){
              this.message = '希望のロスカットレートを入力し、［計算］を押してください。';
            } else {
              this.message = '希望のロスカットレートまたは任意証拠金の増減額を入力し、[計算]を押してください。';
            }
          }
          this.updateView();
          break;

          case ERROR_CODE.WARN:
          MessageBox.warning({
            title:TITLE_GET_LOSSCUT_ERR,
            message:val.clientInfoMessage[0].message
          },
          ()=>{
            this.afterGetLosscutErr();
          });
          if(this.isAll){
            this.message = '希望のロスカットレートを入力し、［計算］を押してください。';
          } else {
            this.message = '希望のロスカットレートまたは任意証拠金の増減額を入力し、[計算]を押してください。';
          }
          break;

          case ERROR_CODE.NG:
          MessageBox.error({
            title:TITLE_GET_LOSSCUT_ERR,
            message:"データが取得できませんでした。しばらくしてからもう一度お試しください。[CFDS2901T]"
          },
          ()=>{
            this.afterGetLosscutErr();
          });
          break;
        }
      },
      err => {
        if (err.status == ERROR_CODE.NETWORK) {
          MessageBox.error({
            title: TITLE_GET_LOSSCUT_ERR,
            message: Messages.ERR_0002 + "[CFDS2902C]"
          },
            () => {
              this.afterGetLosscutErr();
            });
        }
      }
    )
  }

  public afterGetLosscutErr() {
    this.showLoading = false;
    this.calcState = 'before';
    this.isCalcBtnDisable = true;
    this.updateView();
  }

  public calcLosscutRate(){
    let input:values.IReqCalcLosscutRate = {
      positionKeys:this.positionKey
    };

    this.hideError();

    let numMargin = this.inputMargin ? Number(this.inputMargin) : 0;

    if(this.calcType == 'losscut'){
      
      if (this.isEmptyStr(this.inputLosscut)) {
        this.losscutMessage = "ロスカットレートを入力してください。";
        this.losscutError = true;
        this.updateView();
        return
      }
      let floatFormat = "^(0|[1-9][0-9]*)+(.[0-9]{1,})?$";
      if (!this.inputLosscut.match(floatFormat) || Number(this.inputLosscut) == 0) {
        this.losscutMessage = "ロスカットレートを正しく入力してください。";
        this.losscutError = true;
        this.updateView();
        return
      }
    } else if (this.calcType == 'margin') {

      if (this.isEmptyStr(this.inputMargin)) {
        this.marginError = true;
        this.marginMessage = "任意証拠金の増減額を入力してください。";
        this.updateView();
        return
      } 
      if (Number(this.inputMargin) < 1) {
        this.marginError = true;
        this.marginMessage = "任意証拠金の増減額が0です。";
        this.updateView();
        return
      }
    }

    

    if(this.calcType == 'losscut'){
      input.losscutRate = this.inputLosscut;
    } else {
      input.addCancelAmount = this.addCancelType == '-' ? '-'+this.inputMargin : this.inputMargin;
    }

    this.showLoading = true;
    this.business.calcLosscutRate(input).subscribe(
      val=>{
        this.showLoading = false;
        this.resCalcLosscutRate = val;
        switch(val.status){

          case ERROR_CODE.OK:
          this.calcState = 'after';
          let losscutRateInfo = this.resLoscutRateInfo.result;
          let calcLosscutRate = this.resCalcLosscutRate.result;
          let boUnit = this.productInfo.boUnit;
          if(losscutRateInfo && calcLosscutRate){
            this.margin = this.format(losscutRateInfo.margin,11);
            this.optionalMarginBefore = this.format(calcLosscutRate.currentOptionalMargin,11);
            this.optionalMarginAfter = this.format(calcLosscutRate.optionalMargin,11);
            this.optionalMarginVariance = this.format(calcLosscutRate.optionalMarginvariance,null,null,true);
            this.marginBefore = this.format(calcLosscutRate.currentMargin,11);
            this.marginAfter = this.format(calcLosscutRate.optionalMarginAfterTotal,11);
            this.orderQuantity = this.format(losscutRateInfo.quotationQuantity,8) +' ('+(this.format(calcLosscutRate.currentOrderQuantity,8)?this.format(calcLosscutRate.currentOrderQuantity,8):'0')+')';

            if(this.isAll){
              //this.orderPrice = this.format(calcLosscutRate.currentLosscutRate,8,boUnit);
              this.orderPriceRange = ' ('+this.format(calcLosscutRate.minQuotationPrice,8,boUnit) + '～' + this.format(calcLosscutRate.maxQuotationPrice,8,boUnit)+')';
              this.losscutRateBefore = this.format(calcLosscutRate.currentLosscutRate,8,boUnit);
              this.losscutRateBeforeRange = ' ('+this.format(calcLosscutRate.minLosscutRate,8,boUnit) + '～' + this.format(calcLosscutRate.maxLosscutRate,8,boUnit)+')';
            } else {
              //this.orderPrice = this.format(calcLosscutRate.currentLosscutRate,8,boUnit);
              this.orderPriceRange = '';
              this.losscutRateBefore = this.format(calcLosscutRate.currentLosscutRate,8,boUnit);
              this.losscutRateBeforeRange = '';
            }
  
            this.losscutRateAfter = this.format(calcLosscutRate.losscutRate,13,boUnit);
            this.marketPowerBefore = this.format(calcLosscutRate.currentPowerAmount,11);
            this.marketPowerAfter = this.format(calcLosscutRate.powerAmount,11);
  
            if(calcLosscutRate.optionalMarginvariance > 0){
              let variance = this.format(calcLosscutRate.optionalMarginvariance);
              this.message = '任意証拠金に' + variance + '円増額します。' + '<br/>' + '変更後のロスカットレートは、' + this.losscutRateAfter + 'です。' + '<br/>' + 'よろしければ［実行］を押してください。';
            } else {
              let variance = this.format(calcLosscutRate.optionalMarginvariance*-1);
              this.message = '任意証拠金から' + variance + '円減額します。' + '<br/>' + '変更後のロスカットレートは、' + this.losscutRateAfter + 'です。' + '<br/>' + 'よろしければ［実行］を押してください。';
            }
          }
          this.updateView();
          break;

          case ERROR_CODE.WARN:
          MessageBox.warning({
            title:TITLE_CALC_LOSSCUT_ERR,
            message:val.clientInfoMessage[0].message
          },
          ()=>{
            this.showLoading = false;
            this.updateView();
          });
          break;

          case ERROR_CODE.NG:
          MessageBox.error({
            title:TITLE_CALC_LOSSCUT_ERR,
            message:Messages.ERR_0001+"[CFDS3001T]"
          },
          ()=>{
            this.showLoading = false;
            this.updateView();
          });
          break;
        }
      },
      err => {
        if (err.status == ERROR_CODE.NETWORK) {
          MessageBox.error({
            title: TITLE_CALC_LOSSCUT_ERR,
            message: Messages.ERR_0002 + "[CFDS3002C]"
          },
            () => {
              this.showLoading = false;
              this.updateView();
            });
        }
      }
    )
  }

  private isEmptyStr(value):boolean {
    if (value == undefined || value == null || value.length == 0) {
      return true;
    }
    return false;
  }

  public changeLosscutRate(){
    let input:values.IReqChangeLosscutRate = {
      positionKeys:this.positionKey,
      optionalMarginAfterCalc:String(this.resCalcLosscutRate.result.optionalMargin)
    };

    if(this.calcType == 'losscut'){
      input.losscutRate = this.inputLosscut;
    } else {
      input.addCancelAmount = input.addCancelAmount = this.addCancelType == '-' ? '-'+this.inputMargin : this.inputMargin;
    }

    this.showLoading = true;
    this.business.changeLosscutRate(input).subscribe(
      val=>{
        this.showLoading = false;
        switch(val.status){
          case ERROR_CODE.OK:
          MessageBox.info({
            title:"ロスカットレート変更完了",
            message:"変更が完了しました。\n[ロスカットレート]"+this.losscutRateAfter
          },
          ()=>{
            this.close();
          });
          break;

          case ERROR_CODE.WARN:
          MessageBox.warning({
            title:TITTLE_CHANGE_LOSSCUT_ERR,
            message:val.clientInfoMessage[0].message
          },
          ()=>{
            this.showLoading = false;
            this.updateView();
          });
          break;

          case ERROR_CODE.NG:
          MessageBox.error({
            title:TITTLE_CHANGE_LOSSCUT_ERR,
            message:Messages.ERR_0001+"[CFDS3101T]"
          },
          ()=>{
            this.showLoading = false;
            this.updateView();
          });
          break;
        }
      },
      err => {
        if (err.status == ERROR_CODE.NETWORK) {
          MessageBox.error({
            title: TITTLE_CHANGE_LOSSCUT_ERR,
            message: "ロスカットレート変更が受け付けられなかった可能性があります。【建玉一覧】にてロスカットレートをご確認ください。[CFDS3102C]"
          },
            () => {
              this.showLoading = false;
              this.updateView();
            });
        }
      }
    )
  }

  public attentionInfo(){
    let input:values.IReqAttentionInfo = {
      cfdProductCode:this.productCode
    };

    this.business.getAttentionInfoList(input).subscribe(
      val=>{
        switch(val.status){
          case ERROR_CODE.OK:
          if(val.result.attentionProductList && val.result.attentionProductList.length != 0){
            this.attentionTooltip = GetAttentionMessage(val.result.attentionProductList);
      			this.hasAttentionMessage=true;	
      			this.updateView();
          }else{
      			this.hasAttentionMessage=false;
      		}
        }
      }
    )
  }

  public dismissError(errKbn) {
    this[errKbn] = false;
  }
}
