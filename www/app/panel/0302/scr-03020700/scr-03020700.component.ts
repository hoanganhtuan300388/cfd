/**
 * 
 * 余力詳細
 * 
 */
import { Component, ElementRef, ChangeDetectorRef } from '@angular/core';
import { PanelManageService, PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips,ResourceService,BusinessService,StringUtil, } from '../../../core/common';
import { IPowerAmount } from '../../../values/values';
import { Messages} from '../../../../../common/message';
import { ERROR_CODE } from '../../../../../common/businessApi';

declare var moment:any;

//-----------------------------------------------------------------------------
// COMPONENT : Scr03020700Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03020700',
  templateUrl: './scr-03020700.component.html',
  styleUrls: ['./scr-03020700.component.scss']
})
export class Scr03020700Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  public infoStatus : string;
  public noInfoMsg : string = "";
  public noInternetMsg : string = "";

  public disabledCheck = false;
  public comRemarginStatusFlg = false;
  public stkRemarginStatusFlg = false;

  public secMarginMaintenanceRatioFlg = false;
  public comMarginMaintenanceRatioFlg = false;
  public stkMarginMaintenanceRatioFlg = false;
  public varMarginMaintenanceRatioFlg = false;

  public dataTime : string;
  public subscribe:any;

  public powerAmount={
    //datetime:'',
    tradeRemainingPowerSecurities:0,
    tradeRemainingPowerCommodity:0,
    tradeRemainingPowerStock:0,
    tradeRemainingPowerVariety:0,
    cashTransferPossible:0,
    needTempMargin:0,
    margin:0,
    optionalMargin:0,
    orderMargin:0,
    orderOptionalMargin:0,
    quotationAppraisementTotal:0,
    outstandingProfitLoss:0,
    outstandingPositionInterestProfitLoss:0,
    outstandingInterestProfitLoss:0,
    outstandingPriceAdjustProfitLoss:0,
    outstandingDividenProfitLoss:0,
    accountBalance:0,
    cashPosition:0,
    cashTransferAmount:0,
    unrealizedStraightPositionProfitLoss:0,
    interestRateAmountPl:0,
    priceAdjustAmountPl:0,
    dividendAmountPl:0,
    secRemarginStatusName:'',
    secRemargin:0,
    comRemargin:0,
    stkRemargin:0,
    varRemargin:0,
    comRemarginStatusName:'',
    stkRemarginStatusName:'',
    varRemarginStatusName:'',
    secReliefRemarginAmount:0,
    secRemainingRemarginAmount:0,
    comReliefRemarginAmount:0,
    comRemainingRemarginAmount:0,
    stkReliefRemarginAmount:0,
    stkRemainingRemarginAmount:0,
    varReliefRemarginAmount:0,
    varRemainingRemarginAmount:0,
    secQuotationAppraisementTotal:0,
    secMargin:0,
    secMarginMaintenanceRatio:"",
    comQuotationAppraisementTotal:0,
    comMargin:0,
    comMarginMaintenanceRatio:"",
    stkQuotationAppraisementTotal:0,
    stkMargin:0,
    stkMarginMaintenanceRatio:"",
    varQuotationAppraisementTotal:0,
    varMargin:0,
    varMarginMaintenanceRatio:"",
    comCashTransferPossibleFromSecAccount:0,
    stkCashTransferPossibleFromSecAccount:0,
    varCashTransferPossibleFromSecAccount:0,
  }
  
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public element: ElementRef,
               public changeRef:ChangeDetectorRef,
               private business:BusinessService,
               public resource:ResourceService,) {                 
    super( '03020700', screenMng, element, changeRef); 
  }

  ngOnInit() {
    super.ngOnInit();
    this.getPowerAmount();

    if (this.business != null && this.business.notifyer != null) {
      this.subscribe = this.business.notifyer.powerAmount().subscribe(
        res => {
          if (res && res.status == ERROR_CODE.OK) {
            this.processForOk(res);
          } else if (res && res.status == ERROR_CODE.NG) {
            this.processForNg(res);
          } else{
            this.processForErr();
          }
        },
        err=>{
          this.processForErr();
        }
      );
    }
  }

  ngOnDestroy(){
    super.ngOnDestroy();
    this.subscribe.unsubscribe();
  }
  /**
   * 余力情報取得
   */
  public getPowerAmount() {
    this.disabledCheck = true;

    //this.business.getPowerAmount().subscribe(
    this.business.getPowerAmountDirect().subscribe(
      res => {
        if (res && res.status == ERROR_CODE.OK) {
          this.processForOk(res);
        } else if (res && res.status == ERROR_CODE.NG) {
          this.processForNg(res);
        }
        
      },
      err=>{
        this.processForErr();
      }
    );
  }

  public processForOk(res) {
    this.infoStatus = '1';
    this.dataTime = moment(res.datetime,'YYYYMMDDHHmm').format('YYYY/MM/DD HH:mm');
    this.disabledCheck = false;
    this.update(res.result);
  }

  public processForNg(res) {
    this.infoStatus = '2';
    this.dataTime = '';
    this.noInfoMsg = Messages.ERR_0004 + '[CFDS0501T]';
    this.disabledCheck = false;
    this.updateView();
  }

  public processForErr() {
    this.infoStatus = '3';
    this.dataTime = '';
    this.noInternetMsg = Messages.ERR_0002 + '[CFDS0502C]';
    this.disabledCheck = false;
    this.updateView();
  }



  // 維持率の計算↓
  // private marginMaintenanceRatioCount(MarginMaintenanceRatio:any){
  //   if(MarginMaintenanceRatio){
  //     let value = "";
  //     let strings = MarginMaintenanceRatio.toString().split(".");
  //     if (strings[1]) {
  //       if(strings[1].length > 2){
  //         let sub = strings[1].substr(0,2);
  //         value = strings[0] + "." + sub;
  //         return MarginMaintenanceRatio = Number(value);
  //       }else if(strings[1].length <= 2){
  //         return MarginMaintenanceRatio;
  //       }
  //     }else{
  //       return MarginMaintenanceRatio;
  //     }
  //   }

  // }

  //   private marginMaintenanceRatioCount(MarginMaintenanceRatio:any){
  //   if(MarginMaintenanceRatio){
  //     let value = "";
  //     let strings = MarginMaintenanceRatio.toString().split(".");
  //     if (strings[1]) {
  //       if(strings[1].length > 2){
  //         let sub = strings[1].substr(0,2);
  //         value = strings[0] + "." + sub;
  //         return value;
  //       }else if(strings[1].length == 2){
  //         let sub = strings[1];
  //         value = strings[0] + "." + sub;
  //         return value;
  //       }else if(strings[1].length < 2){
  //         let sub = strings[1];
  //         value = strings[0] + "." + sub + "0";
  //         return value;
  //       }
  //     }else{
  //       value = MarginMaintenanceRatio.toString() + '.00';
  //       return value;
  //     }
  //   }
  // }

  private update(data:IPowerAmount){
    if(data){
      //this.powerAmount.datetime = data.datetime;
      this.powerAmount.tradeRemainingPowerSecurities = data.tradeRemainingPowerSecurities;
      this.powerAmount.tradeRemainingPowerCommodity = data.tradeRemainingPowerCommodity;
      this.powerAmount.tradeRemainingPowerStock = data.tradeRemainingPowerStock;
      this.powerAmount.tradeRemainingPowerVariety = data.tradeRemainingPowerVariety;
      this.powerAmount.cashTransferPossible = data.cashTransferPossible;
      if(this.powerAmount.cashTransferPossible < 0){
        this.powerAmount.cashTransferPossible = 0;
      }
      this.powerAmount.margin = data.margin;
      this.powerAmount.optionalMargin = data.optionalMargin;
      this.powerAmount.orderMargin = data.orderMargin;
      this.powerAmount.orderOptionalMargin =data.orderOptionalMargin;
      this.powerAmount.needTempMargin = data.margin + data.optionalMargin + data.orderMargin + data.orderOptionalMargin;
      this.powerAmount.quotationAppraisementTotal = data.quotationAppraisementTotal;
      this.powerAmount.outstandingProfitLoss = data.outstandingProfitLoss;
      this.powerAmount.outstandingPositionInterestProfitLoss = data.outstandingPositionInterestProfitLoss;
      this.powerAmount.outstandingInterestProfitLoss = data.outstandingInterestProfitLoss;
      this.powerAmount.outstandingPriceAdjustProfitLoss = data.outstandingPriceAdjustProfitLoss;
      this.powerAmount.outstandingDividenProfitLoss = data.outstandingDividenProfitLoss;
      this.powerAmount.accountBalance = data.accountBalance;
      this.powerAmount.cashPosition = data.cashPosition;
      this.powerAmount.cashTransferAmount = data.cashTransferAmount;
      this.powerAmount.unrealizedStraightPositionProfitLoss = data.unrealizedStraightPositionProfitLoss;
      this.powerAmount.interestRateAmountPl = data.interestRateAmountPl;
      this.powerAmount.priceAdjustAmountPl = data.priceAdjustAmountPl;
      this.powerAmount.dividendAmountPl = data.dividendAmountPl;
      this.powerAmount.secRemarginStatusName = data.secRemarginStatusName ? data.secRemarginStatusName : "-";
      this.powerAmount.secRemargin = data.secRemargin;
      this.powerAmount.comRemargin = data.comRemargin;
      this.powerAmount.stkRemargin = data.stkRemargin;
      this.powerAmount.varRemargin = data.varRemargin;
      this.powerAmount.comRemarginStatusName = data.comRemarginStatusName ? data.comRemarginStatusName : "-";
      this.powerAmount.stkRemarginStatusName = data.stkRemarginStatusName ? data.stkRemarginStatusName : "-";
      this.powerAmount.varRemarginStatusName = data.varRemarginStatusName ? data.varRemarginStatusName : "-";
      this.powerAmount.secReliefRemarginAmount =data.secReliefRemarginAmount;
      this.powerAmount.secRemainingRemarginAmount = data.secRemainingRemarginAmount;
      this.powerAmount.comReliefRemarginAmount = data.comReliefRemarginAmount;
      this.powerAmount.comRemainingRemarginAmount = data.comRemainingRemarginAmount;
      this.powerAmount.stkReliefRemarginAmount = data.stkReliefRemarginAmount;
      this.powerAmount.stkRemainingRemarginAmount = data.stkRemainingRemarginAmount;
      this.powerAmount.varReliefRemarginAmount = data.varReliefRemarginAmount;
      this.powerAmount.varRemainingRemarginAmount = data.varRemainingRemarginAmount;
      this.powerAmount.secQuotationAppraisementTotal = data.secQuotationAppraisementTotal;
      this.powerAmount.secMargin = data.secMargin;
      this.secMarginMaintenanceRatioFlg = (this.powerAmount.secMargin == 0);
      this.powerAmount.secMarginMaintenanceRatio = StringUtil.formatNumber(data.secMarginMaintenanceRatio, '#,###.00');
      this.powerAmount.comQuotationAppraisementTotal = data.comQuotationAppraisementTotal;
      this.powerAmount.comMargin = data.comMargin;
      this.comMarginMaintenanceRatioFlg = (this.powerAmount.comMargin == 0);
      // this.powerAmount.comMarginMaintenanceRatio = this.marginMaintenanceRatioCount(data.comMarginMaintenanceRatio);
      this.powerAmount.comMarginMaintenanceRatio = StringUtil.formatNumber(data.comMarginMaintenanceRatio, '#,###.00');
      this.powerAmount.stkQuotationAppraisementTotal = data.stkQuotationAppraisementTotal;
      this.powerAmount.stkMargin = data.stkMargin;
      this.stkMarginMaintenanceRatioFlg = (this.powerAmount.stkMargin == 0);
      //this.powerAmount.stkMarginMaintenanceRatio = this.marginMaintenanceRatioCount(data.stkMarginMaintenanceRatio);
      this.powerAmount.stkMarginMaintenanceRatio = StringUtil.formatNumber(data.stkMarginMaintenanceRatio, '#,###.00');
      this.powerAmount.varQuotationAppraisementTotal = data.varQuotationAppraisementTotal;
      this.powerAmount.varMargin = data.varMargin;
      this.varMarginMaintenanceRatioFlg = (this.powerAmount.varMargin == 0);
      //this.powerAmount.varMarginMaintenanceRatio = this.marginMaintenanceRatioCount(data.varMarginMaintenanceRatio);
      this.powerAmount.varMarginMaintenanceRatio = StringUtil.formatNumber(data.varMarginMaintenanceRatio, '#,###.00');
      this.powerAmount.comCashTransferPossibleFromSecAccount = data.comCashTransferPossibleFromSecAccount;
      if(this.powerAmount.comCashTransferPossibleFromSecAccount < 0){
        this.powerAmount.comCashTransferPossibleFromSecAccount = 0;
      }
      this.powerAmount.stkCashTransferPossibleFromSecAccount = data.stkCashTransferPossibleFromSecAccount;
      if(this.powerAmount.stkCashTransferPossibleFromSecAccount < 0){
        this.powerAmount.stkCashTransferPossibleFromSecAccount = 0;
      }
      this.powerAmount.varCashTransferPossibleFromSecAccount = data.varCashTransferPossibleFromSecAccount;
      if(this.powerAmount.varCashTransferPossibleFromSecAccount < 0){
        this.powerAmount.varCashTransferPossibleFromSecAccount = 0;
      }
      
      this.updateView();
    }
  }

  public onUrlText(type:any){
    if(type=='1'){
      this.openUrl(this.resource.environment.clientConfig.conversionRateURL);
    }else if(type == '2'){
      this.openUrl(this.resource.environment.clientConfig.tradeRuleURL);
    }
  }

  private openUrl(url:string){
    const electron = (window as any).electron;
    if(electron){
      const shell = electron.shell;

      shell.openExternal(url);
    }
  }


  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
}
