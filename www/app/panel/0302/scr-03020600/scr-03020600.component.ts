/**
 *
 * 振替
 *
 */
import { Component, OnInit, ElementRef, ChangeDetectorRef, Output, ViewChild, EventEmitter } from '@angular/core';
import { PanelManageService, ResourceService, PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips, BusinessService, StringUtil } from '../../../core/common';
import { MessageBox } from '../../../util/utils';
import { ValidatorNumber } from '../../../util/validator.directive';
import { AskBidUnitComponent } from '../../../component/ask-bid-unit/ask-bid-unit.component';
import { IReqGetCashTransferInfo, IResGetCashTransferInfo, IReqCashTransfer, IResCashTransfer } from "../../../values/Values";
import { ERROR_CODE } from "../../../../../common/businessApi";
import { Messages, GetWarningMessage} from '../../../../../common/message';

declare var $:any;

//-----------------------------------------------------------------------------
// COMPONENT : Scr03020600Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03020600',
  templateUrl: './scr-03020600.component.html',
  styleUrls: ['./scr-03020600.component.scss']
})
export class Scr03020600Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------

  @ViewChild('slider') slider: ElementRef;
  @ViewChild('inPrice') public inputValidator: ValidatorNumber;

  public transferAmount:number = 0;
  public nowDate:string;
  public outText:string="証券取引口座";
  public inText:string="CFD取引口座";
  public toCFD:boolean=true;
  public inAmount:string="0";
  public outAmount:string="0";
  public price:string="";
  public priceTxt: string = "";
  public tooltipMsg:string="";
  public tooltipCheck:boolean=false;
  public tooltipMouseOver:boolean=false;
  public disabledCheck:boolean=true;
  public loaded:boolean = true;
  public cashTransferInfoData:any={cfdTransferPowerAmount:'0', secTransferPowerAmount:'0'};

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public element: ElementRef,
               public changeRef:ChangeDetectorRef,
               public resource:ResourceService,
               public business: BusinessService) {
    super( '03020600', screenMng, element, changeRef);
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  initLayout(param:any){
    super.initLayout(param);
    this.getCashTransferInfo();
  }
  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  public getNowDate():string {
    console.log('getNowDate');
    let now = new Date();
    let year= now.getFullYear();
    let mon = (now.getMonth()+1)>9 ? ''+(now.getMonth()+1) : '0'+(now.getMonth()+1);
    let day = now.getDate()>9 ? ''+now.getDate() : '0'+now.getDate();
    let hh = now.getHours()>9 ? ''+now.getHours() : '0'+now.getHours();
    let mm = now.getMinutes()>9 ? ''+now.getMinutes() : '0'+now.getMinutes();
    let ss = now.getSeconds()>9 ? ''+now.getSeconds() : '0'+now.getSeconds();

    let rtn_data= year+'/'+mon+'/'+day+' '+hh+':'+mm+':'+ss;

    return rtn_data;
  }

  /**
   * return style class of transfer price
   *
   * @param tabName
   * @param event
   */
  public getClassByPriceLen() {
    if (StringUtil.countLength(this.price.replace(/\,/g,"")) <= 14) {
      return 'text-enormous';
    } else {
      return 'text-huge';
    }
  }

  /**
   * on click slide button
   *
   * @param tabName
   * @param event
   */
  public onNavBtnClickBack(nav:string){
    if( nav == 'GO'){
      if(this.price==""){
        this.tooltipCheck=true;
        this.tooltipMsg="振替金額を入力してください。";
      } else if(Number(this.price)<1) {
        this.tooltipCheck=true;
        this.tooltipMsg="振替金額は1以上の整数で入力してください。";
      } else {
        this.tooltipCheck=false;
        this.priceTxt = StringUtil.Comma(String(Number(this.price.replace(/\,/g,""))));
        $(this.slider.nativeElement).carousel("next");
      }

    }else if( nav = 'BACK' ){
      $(this.slider.nativeElement).carousel("prev");
    }
  }

  public changeBtnClick($event){
    this.toCFD = !this.toCFD;
    if(this.toCFD) {
      this.outText="証券取引口座";
      this.inText="CFD取引口座";
      this.inAmount=StringUtil.Comma(this.cashTransferInfoData.cfdTransferPowerAmount);
      this.outAmount=StringUtil.Comma(this.cashTransferInfoData.secTransferPowerAmount);
    } else {
      this.outText="CFD取引口座";
      this.inText="証券取引口座";
      this.inAmount=StringUtil.Comma(this.cashTransferInfoData.secTransferPowerAmount);
      this.outAmount=StringUtil.Comma(this.cashTransferInfoData.cfdTransferPowerAmount);
    }
    this.updateView();
  }

  public tooltipMouseOverCheck(check:boolean) {
    this.tooltipMouseOver=check;
    this.updateView();
  }

  public windowClose(){
    this.close();
  }

  public priceBlur() {
    this.inputValidator.active = false;
    //this.price=StringUtil.Comma(String(Number(this.price.replace(/\,/g,""))));
  }

  public priceFocus() {
    this.tooltipCheck = false;
    this.inputValidator.active = true;
    //this.price=this.price.replace(/\,/g,"");
  }

  public getCashTransferInfo(){
    let _self=this;
    this.disabledCheck=true;
    this.business.getCashTransferInfo().subscribe(val => {
      if(val.status=="0") {
        _self.cashTransferInfoData=val.result;
        if(_self.toCFD){
          _self.outAmount=StringUtil.Comma(val.result.secTransferPowerAmount);
          _self.inAmount=StringUtil.Comma(val.result.cfdTransferPowerAmount);
        }else{
          _self.outAmount=StringUtil.Comma(val.result.cfdTransferPowerAmount);
          _self.inAmount=StringUtil.Comma(val.result.secTransferPowerAmount);
        }
        _self.nowDate=_self.getNowDate();

      } else if(val.status=="2") {
        let msg="ただいま、システムが大変込み合っております。大変申し訳ありませんが、しばらくしてログインし直すか、または、当社コールセンターまでお問い合わせください。[CFDS2701T]";
        if(this.resource.environment.demoTrade){
          msg="ただいま、システムが大変込み合っております。大変申し訳ありませんが、しばらくしてログインし直すか、または、当社コールセンターまでお問い合わせください。[CFDS2701T]";
        }
        MessageBox.error({title:"振替情報取得エラー", message:msg});
      } else {
        MessageBox.error({title:"振替情報取得エラー", message:"インターネットに接続されていない、または接続先のサーバーに問題が発生しているため、接続できませんでした。[CFDS2702C]"});
      }
      _self.disabledCheck=false;
      _self.updateView();
    },
    err=>{
      switch(err.status) {
        case ERROR_CODE.NETWORK:
          MessageBox.info({title:'振替情報取得エラー', message:(Messages.ERR_0002 + '[CFDS2702C]')});
          break;
      }
    }    
   );
  }

  public cashTransfer(){
    let _self=this;
    this.loaded=false;
    _self.disabledCheck=false;
    let way:string;
    let amt:number = Number(this.price.replace(/\,/g,""));
    if(this.toCFD) {
      way = '02';
    } else {
      way = '01';
    }
    let input: IReqCashTransfer = {transferWay:way, transferAmount:amt};
    this.business.cashTransfer(input).subscribe(val => {
      if(val.status==ERROR_CODE.OK) {
        MessageBox.info({title:"振替完了",　message:"振替が完了しました。"}, () => {
          _self.close();
        });
      } else if(val.status==ERROR_CODE.WARN) {
        MessageBox.warning({title:"振替エラー", message:GetWarningMessage(val.clientInfoMessage)}, () => {
          _self.onNavBtnClickBack('BACK');
        });
      } else if(val.status==ERROR_CODE.NG) {
        MessageBox.error({title:"振替エラー", message:(Messages.ERR_0001 + '[CFDS2801T]')}, () => {
          _self.onNavBtnClickBack('BACK');
        });
      } 
      _self.loaded=true;
      _self.disabledCheck=false;
      _self.updateView();
    },
    err=>{
      switch(err.status) {
        case ERROR_CODE.NETWORK:
          MessageBox.info({title:'振替エラー', message:(Messages.ERR_0049 + '[CFDS2802C]')});
          _self.onNavBtnClickBack('BACK');
          break;
      }
      _self.disabledCheck=false;
      _self.loaded=true;
      _self.updateView();
    });
  }

}
