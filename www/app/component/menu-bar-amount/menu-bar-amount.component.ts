import { Component, ElementRef, ChangeDetectorRef } from '@angular/core';
import { PanelManageService } from '../../service/panel-manage.service';
import { ComponentViewBase,BusinessService } from '../../core/common';
import { ResourceService } from '../../service/resource.service';
import { IPowerAmount } from '../../values/values';
import { Messages } from '../../../../common/message';
import { ERROR_CODE } from '../../../../common/businessApi';

declare var moment:any;


@Component({
  selector: 'menu-bar-amount',
  templateUrl: './menu-bar-amount.component.html',
  styleUrls: ['./menu-bar-amount.component.scss']
})

export class MenuBarPowerAmountComponent extends ComponentViewBase {
  public powerAmount={
    tradeRemainingPowerSecurities:0,
    tradeRemainingPowerCommodity:0,
    tradeRemainingPowerStock:0,
    tradeRemainingPowerVariety:0,
    outstandingProfitLoss:0,
    quotationAppraisementTotal:0
  }

  public disabledCheck = false;
  public pageInfoStatus : string;
  public noInfoMsg : string = "";
  public noInternetMsg : string = "";
  public dataTime :string;
  public cfdStatus:boolean = false; // // CFD口座開設済フラグ  true：開設済み、false：未開設

  constructor(public panelMng: PanelManageService,
              public element: ElementRef,
              public changeRef:ChangeDetectorRef,
              public resource: ResourceService,
              private business:BusinessService,) {
    super(panelMng, element, changeRef);
  }

  /**
   *
   */
  ngOnInit() {
    super.ngOnInit();

    this.getUserInfo();

    this.getPowerAmount();

    if (this.business != null && this.business.notifyer != null) {
      this.business.notifyer.powerAmount().subscribe(
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

  /**
   *
   */
  public openScreen(scrId) {
    this.panelMng.openPanel('0', scrId);
  }

  /**
   * 余力情報取得
   */
  public getPowerAmount() {
    this.disabledCheck = true;
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

  public processForOk(res){
    this.pageInfoStatus = '1';
    this.disabledCheck = false;
    $(".show-when-window-wide").removeClass("show-when-window-wide2");
    $(".navbar-amount-row").removeClass("navbar-amount-row2");
    this.dataTime = moment(res.datetime,'YYYYMMDDHHmmss').format('MM/DD HH:mm:ss');
    this.update(res.result);
  }

  public processForNg(res){
    this.pageInfoStatus = '2';
    this.noInfoMsg = Messages.ERR_0004 + '[CFDS0501T]';
    this.disabledCheck = false;
    $(".show-when-window-wide").addClass("show-when-window-wide2");
    $(".navbar-amount-row").addClass("navbar-amount-row2");
    this.dataTime = '';
    this.updateView();
  }

  public processForErr() {
    this.pageInfoStatus = '3';
    this.noInternetMsg = Messages.ERR_0005 + '[CFDS0502C]';
    this.disabledCheck = false;
    $(".show-when-window-wide").addClass("show-when-window-wide2");
    $(".navbar-amount-row").addClass("navbar-amount-row2");
    this.dataTime = '';
    this.updateView();
  }

  private update(data:IPowerAmount){
    if(data){
      this.powerAmount.tradeRemainingPowerSecurities = data.tradeRemainingPowerSecurities;
      this.powerAmount.tradeRemainingPowerCommodity = data.tradeRemainingPowerCommodity;
      this.powerAmount.tradeRemainingPowerStock = data.tradeRemainingPowerStock;
      this.powerAmount.tradeRemainingPowerVariety = data.tradeRemainingPowerVariety;
      this.powerAmount.outstandingProfitLoss = data.outstandingProfitLoss;
      this.powerAmount.quotationAppraisementTotal = data.quotationAppraisementTotal;

      this.updateView();
    }
  }
  
  // open web-browser
  public openUrl(link:string){
    let url: string = '';

    url = this.resource.environment.clientConfig[link];
    url = this.resource.environment.clientConfig[link];
    if( (!this.resource.environment.demoTrade)&& (link == 'kouzaOpenURL')) {
      url += '&sessionId=' + this.resource.environment.session.sessionId;
    }    
    const electron = (window as any).electron;
    if(electron){
      const shell = electron.shell;

      shell.openExternal(url);
    }
  }   

  private getUserInfo(){
    let _self=this;
    this.business.getUserInfo().subscribe(val => {
      this.cfdStatus = val.result.cfdStatus;
    });
  }    

}
