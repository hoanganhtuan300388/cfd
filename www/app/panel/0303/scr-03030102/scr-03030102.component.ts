/**
 *
 * 企業情報
 *
 */
import { Component, ElementRef, ChangeDetectorRef, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import "rxjs/add/observable/zip";
import { PanelManageService, WindowService, BusinessService, ResourceService, PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips, StringUtil } from '../../../core/common';
import { IReqCorporateInfo, IResCorporateInfo, IResProductList } from "../../../values/Values";
import { ERROR_CODE } from "../../../../../common/businessApi";
import { Messages, } from '../../../../../common/message';
import * as values from "../../../values/values";

declare var pq:any;
declare var moment:any;
const electron = (window as any).electron;
//-----------------------------------------------------------------------------
// COMPONENT : Scr03030102Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03030102',
  templateUrl: './scr-03030102.component.html',
  styleUrls: ['./scr-03030102.component.scss']
})
export class Scr03030102Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  public cfdProductCode:string = '-';
  public productName:string = '-';
  public categoryName:string = '-';
  public businessSummary:string = '-';
  public marketCapitalization:string = '-';
  public salesRevenue:string = '-';
  public netIncome:string = '-';
  public enterpriseValue:string = '-';
  public ebitda:string = '-';
  public employees:string = '-';
  public grossProfitMargin:string = '-';
  public per:string = '-';
  public pbr:string = '-';
  public roe:string = '-';
  public salesRevenuePerShare:string = '-';
  public netAssetPerShare:string = '-';
  public dividendPerShare:string = '-';
  public earningsPerShare:string = '-';
  public estimateSalesRevenue:string = '-';
  public estimateNetIncome:string = '-';
  public estimateEps:string = '-';
  public estimatePer:string = '-';
  public url:string = '-';
  public priceCurrency:string;

  public resCorpInfo:IResCorporateInfo;
  public resProduct:IResProductList;

  public errShow: boolean = false;
  public errText: string='';
  private subscrip:any;
  private updateProductCode;

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public window:   WindowService,
               public business: BusinessService,
               public element:  ElementRef,
               public resource:ResourceService,
               public changeRef:ChangeDetectorRef) {
    super( '03030102', screenMng, element, changeRef);
    this.subscrip = screenMng.onChannelEvent().subscribe(val=>{
        if(val.channel == 'currencyList') {
          if(val.arg.productCode == this.cfdProductCode){
            this.updateProductCode = val.arg.productCode;
            this.initLayout(val.arg);
          }
        }
    });
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  ngOnDestroy(){
    super.ngOnDestroy();
    this.subscrip.unsubscribe();
  }

  initLayout(param:any){
    super.initLayout(param);

    if(this.resource.environment.demoTrade){
      this.errText="&nbsp;&nbsp;デモ口座では企業情報をご覧いただけません。<br /><br />&nbsp;&nbsp;口座開設いただくと、企業情報がご利用いた<p>&nbsp;&nbsp;だけます。<br />&nbsp;&nbsp;<a class='openaccount text-link-underline' href='#'>口座開設をご希望の方は、こちらよりお申し込み<p>&nbsp;&nbsp;ください。</a>";
      this.errShow=true;
      let productName;
      if (param.layout && param.layout.option && param.layout.option.productName ) {
        productName = param.layout.option.productName;
        this.cfdProductCode = param.layout.option.productCode;
      } else {
        productName = param.productName;
        this.cfdProductCode = param.productCode;
      }
      if (!this.updateProductCode) {
      this.setTitle( this.title(), productName );
      }
      this.productName = productName;
      this.updateView();
      setTimeout(() => {
        $(this.element.nativeElement).find(".openaccount").click(()=>{
          this.openUrl(this.resource.environment.clientConfig.kouzaOpenURL);
        })
      }, 50);
    }
    else {
      this.cfdProductCode = param.productCode ? param.productCode : param.layout.productCode;
      if(this.cfdProductCode){
        this.requestData();
      }
    }
  }

  /**
	 * OVERRIDE : save layout
	 */
	public getLayoutInfo():values.ILayoutInfo{
		var result = super.getLayoutInfo();

		// set product code.
		result.productCode = this.cfdProductCode;
    //result.productCode = this.cfdProductCode?this.cfdProductCode:this.params.productCode;
    result.option = {productName: this.productName,productCode: this.cfdProductCode};

		return result;
	}

  // title(){
  //   return super.title() + this.productName;
  // }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  public onClickUrl($event, url){
    event.preventDefault();
    this.window.openBrowser(url);
  }

  public requestData(){
    let product = this.business.getProductList();
    let corpInfo = this.business.corporateInfo({ cfdProductCode : this.cfdProductCode });
    this.errShow = false;
    this.errText = '';
    Observable.zip(product, corpInfo).subscribe(val=>{
      this.resProduct = val[0];
      this.resCorpInfo = val[1];
      if(this.resCorpInfo.status == ERROR_CODE.OK) {
        this.createData();
      }
      else if(this.resCorpInfo.status == ERROR_CODE.NG) {
        this.errText="&nbsp;&nbsp;データが取得できませんでした。<br />&nbsp;&nbsp;しばらくしてからもう一度お試しください。<p>&nbsp;&nbsp;[CFDS1601T]";
        this.errShow=true;
      }
    },
    err=>{
      switch(err.status) {
        case ERROR_CODE.NETWORK:
          this.errText="&nbsp;&nbsp;インターネットに接続されていない、<br />&nbsp;&nbsp;または接続先のサーバーに問題が発生して<p>&nbsp;&nbsp;いるため、接続できませんでした。[CFDS1602C]";
          this.errShow=true;
          break;
      }
    }    
  );

  }

  public createData(){
    let product = this.resProduct.result.productList.filter(val=>val.cfdProductCode==this.cfdProductCode)[0];
    let corpInfo = this.resCorpInfo.result;
    let format = '#,###';

    this.categoryName = product.categoryName ? product.categoryName : '-';
    this.productName = product.meigaraSeiKanji;
    this.businessSummary = corpInfo.businessSummary ? corpInfo.businessSummary : '-';
    this.marketCapitalization = (corpInfo.marketCapitalization != null || corpInfo.marketCapitalization != undefined) ? StringUtil.formatNumber(corpInfo.marketCapitalization,'#,###.00') : '-';
    this.salesRevenue = (corpInfo.salesRevenue != null || corpInfo.salesRevenue != undefined) ? StringUtil.formatNumber(corpInfo.salesRevenue,'#,###.00') : '-';
    this.netIncome = (corpInfo.netIncome != null || corpInfo.netIncome != undefined) ? StringUtil.formatNumber(corpInfo.netIncome,'#,###.00') : '-';
    this.enterpriseValue = (corpInfo.enterpriseValue != null || corpInfo.enterpriseValue != undefined) ? StringUtil.formatNumber(corpInfo.enterpriseValue,'#,###.00') : '-';
    this.ebitda = (corpInfo.ebitda != null || corpInfo.ebitda != undefined) ? StringUtil.formatNumber(corpInfo.ebitda,'#,###.00') : '-';
    this.employees = (corpInfo.employees != null || corpInfo.employees != undefined) ? StringUtil.formatNumber(corpInfo.employees,'#,###') : '-';
    this.grossProfitMargin = (corpInfo.grossProfitMargin != null || corpInfo.grossProfitMargin != undefined) ? StringUtil.formatNumber(corpInfo.grossProfitMargin,'#,###.00') + '%' : '-';
    this.per = (corpInfo.per != null || corpInfo.per != undefined) ? StringUtil.formatNumber(corpInfo.per,'#,###.00') : '-';
    this.pbr = (corpInfo.pbr != null || corpInfo.pbr != undefined) ? StringUtil.formatNumber(corpInfo.pbr,'#,###.00') : '-';
    this.roe = (corpInfo.roe != null || corpInfo.roe != undefined) ? StringUtil.formatNumber(corpInfo.roe,'#,###.00') + '%' : '-';
    this.salesRevenuePerShare = (corpInfo.salesRevenuePerShare != null || corpInfo.salesRevenuePerShare != undefined) ? StringUtil.formatNumber(corpInfo.salesRevenuePerShare,'#,###.00') : '-';
    this.netAssetPerShare = (corpInfo.netAssetPerShare != null || corpInfo.netAssetPerShare != undefined) ? StringUtil.formatNumber(corpInfo.netAssetPerShare,'#,###.00') : '-';
    this.dividendPerShare = (corpInfo.dividendPerShare != null || corpInfo.dividendPerShare != undefined ) ? StringUtil.formatNumber(corpInfo.dividendPerShare,'#,###.00') : '-';
    this.earningsPerShare = (corpInfo.earningsPerShare != null || corpInfo.earningsPerShare != undefined)  ? StringUtil.formatNumber(corpInfo.earningsPerShare,'#,###.00') : '-';
    this.estimateSalesRevenue = (corpInfo.estimateSalesRevenue != null || corpInfo.estimateSalesRevenue != undefined) ? StringUtil.formatNumber(corpInfo.estimateSalesRevenue,'#,###.00') : '-';
    this.estimateNetIncome = (corpInfo.estimateNetIncome != null || corpInfo.estimateNetIncome != undefined) ? StringUtil.formatNumber(corpInfo.estimateNetIncome,'#,###.00') : '-';
    this.estimateEps = (corpInfo.estimateEps != null || corpInfo.estimateEps != undefined) ? StringUtil.formatNumber(corpInfo.estimateEps,'#,###.00') : '-';
    this.estimatePer = (corpInfo.estimatePer != null || corpInfo.estimatePer != undefined) ? StringUtil.formatNumber(corpInfo.estimatePer,'#,###.00') : '-';
    this.url = corpInfo.url ? corpInfo.url : '-';
    this.priceCurrency = corpInfo.priceCurrency ? corpInfo.priceCurrency : '-';
    if(!this.updateProductCode){
      this.setTitle( this.title(), this.productName );
    }
    this.updateView();
  }

  private openUrl(url:string){
    const electron = (window as any).electron;
    if(electron){
      const shell = electron.shell;

      shell.openExternal(url);
    }
  }  
}
