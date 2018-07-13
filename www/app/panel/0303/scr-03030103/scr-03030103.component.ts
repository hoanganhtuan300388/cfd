/**
 *
 * ファンド情報
 *
 */
import { Component, ElementRef, ChangeDetectorRef, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import "rxjs/add/observable/zip";
import { PanelManageService, BusinessService, WindowService, ResourceService, PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips, StringUtil } from '../../../core/common';
import { IResFundInfo, IResProductList } from "../../../values/Values";
import { ERROR_CODE } from "../../../../../common/businessApi";
import { Messages, } from '../../../../../common/message';
import * as values from "../../../values/values";

declare var pq:any;
declare var moment:any;
const electron = (window as any).electron;
//-----------------------------------------------------------------------------
// COMPONENT : Scr03030103Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03030103',
  templateUrl: './scr-03030103.component.html',
  styleUrls: ['./scr-03030103.component.scss']
})

export class Scr03030103Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  public cfdProductCode:string;
  public productName:string;
  //public categoryName:string;
  public classificationName:string;
  public fundSummary:string;;
  public etfName:string;;
  public tickerCode:string;;
  public exchange:string;;
  public fundManagersBenchmarkName:string;;
  public latestNav:string;;
  public latestNavDate:string;;
  public latestNavCurrency:string;;
  public totalNetAsset:string;;
  public totalNetAssetDate:string;;
  public totalNetAssetCurrency:string;;
  public assetClass:string;;
  public geographicFocus:string;;
  public launchDate:string;;
  public domicile:string;;
  public percentageGrowthPerMonth:string;;
  public percentageGrowthPer3Months:string;;
  public percentageGrowthPer6Months:string;;
  public percentageGrowthPer9Months:string;;
  public percentageGrowthPerYear:string;;
  public percentageGrowthPer2Years:string;;
  public percentageGrowthPer3Years:string;;
  public percentageGrowthPer5Years:string;;
  public percentageGrowthYtd:string;;
  public percentageGrowthLtd:string;;
  public topHoldingBoList:any[];
  public url:string;;

  public resFundInfo:IResFundInfo;
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
    super( '03030103', screenMng, element, changeRef);
    this.subscrip = screenMng.onChannelEvent().subscribe(val=>{
        if(val.channel == 'fundPriceList') {
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
      this.errText="&nbsp;&nbsp;デモ口座ではファンド情報をご覧いただけません。<br /><br />&nbsp;&nbsp;口座開設いただくと、ファンド情報がご利用いた<p>&nbsp;&nbsp;だけます。<br />&nbsp;&nbsp;<a class='openaccount text-link-underline' href='#'>口座開設をご希望の方は、こちらよりお申し込み<p>&nbsp;&nbsp;ください。</a>";
      this.errShow=true;
      // this.setTitle( this.title(), param.productName );
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
    let fundInfo = this.business.fundInfo({ cfdProductCode : this.cfdProductCode });

    Observable.zip(product, fundInfo).subscribe(val=>{
      this.resProduct = val[0];
      this.resFundInfo = val[1];
      // this.createData();
      if(this.resFundInfo.status == ERROR_CODE.OK) {
        this.createData();
      }
      else if(this.resFundInfo.status == ERROR_CODE.NG) {
        this.errText="&nbsp;&nbsp;データが取得できませんでした。<br />&nbsp;&nbsp;しばらくしてからもう一度お試しください。<p>&nbsp;&nbsp;[CFDS1701T]";
        this.errShow=true;
      }
    },
    err=>{
      switch(err.status) {
        case ERROR_CODE.NETWORK:
          this.errText="&nbsp;&nbsp;インターネットに接続されていない、<br />&nbsp;&nbsp;または接続先のサーバーに問題が発生して<p>&nbsp;&nbsp;いるため、接続できませんでした。[CFDS1702C]";
          this.errShow=true;
          break;
      }
    }    
  );
  }

  public createData(){
    let product = this.resProduct.result.productList.filter(val=>val.cfdProductCode==this.cfdProductCode)[0];
    let fundInfo:any = this.resFundInfo.result;
    let format = '#,###';

    //this.categoryName = product.categoryName ? product.categoryName : '-';
    this.classificationName = product.classificationName ? product.classificationName : '-';

    this.productName = product.meigaraSeiKanji;
    this.fundSummary = fundInfo.fundSummary ? fundInfo.fundSummary : '';
    this.etfName = fundInfo.etfName ? fundInfo.etfName : '-';
    this.tickerCode = fundInfo.tickerCode ? fundInfo.tickerCode : '-';
    this.exchange = fundInfo.exchange ? fundInfo.exchange : '-';
    this.fundManagersBenchmarkName = fundInfo.fundManagersBenchmarkName ? fundInfo.fundManagersBenchmarkName : '-';
    this.latestNav = (fundInfo.latestNav != null || fundInfo.latestNav != undefined) ? StringUtil.formatNumber(fundInfo.latestNav,'#,###.00') : '-';
    this.latestNavDate = fundInfo.latestNavDate ? moment(fundInfo.latestNavDate,'YYYYMMDD').format('YYYY/MM/DD') : '-';
    this.latestNavCurrency = fundInfo.latestNavCurrency ? fundInfo.latestNavCurrency : '';
    this.totalNetAsset = (fundInfo.totalNetAsset != null || fundInfo.totalNetAsset != undefined) ? StringUtil.formatNumber(fundInfo.totalNetAsset,'#,###.00') : '-';
    this.totalNetAssetDate = fundInfo.totalNetAssetDate ? moment(fundInfo.totalNetAssetDate,'YYYYMMDD').format('YYYY/MM/DD') : '-';
    this.totalNetAssetCurrency = fundInfo.totalNetAssetCurrency ? fundInfo.totalNetAssetCurrency : '';
    this.assetClass = fundInfo.assetClass ? fundInfo.assetClass : '-';
    this.geographicFocus = fundInfo.geographicFocus ? fundInfo.geographicFocus : '-';
    this.launchDate = fundInfo.launchDate ? moment(fundInfo.launchDate,'YYYYMMDD').format('YYYY/MM/DD') : '-';
    this.domicile = fundInfo.domicile ? fundInfo.domicile : '-';
    this.percentageGrowthPerMonth = (fundInfo.percentageGrowthPerMonth != null || fundInfo.percentageGrowthPerMonth != undefined) ? StringUtil.formatNumber(fundInfo.percentageGrowthPerMonth, '#,###.00%') : '-';
    this.percentageGrowthPer3Months = (fundInfo.percentageGrowthPer3Months != null || fundInfo.percentageGrowthPer3Months != undefined) ? StringUtil.formatNumber(fundInfo.percentageGrowthPer3Months, '#,###.00%') : '-';
    this.percentageGrowthPer6Months = (fundInfo.percentageGrowthPer6Months != null || fundInfo.percentageGrowthPer6Months != undefined) ? StringUtil.formatNumber(fundInfo.percentageGrowthPer6Months, '#,###.00%') : '-';
    this.percentageGrowthPer9Months = (fundInfo.percentageGrowthPer9Months != null || fundInfo.percentageGrowthPer9Months != undefined) ? StringUtil.formatNumber(fundInfo.percentageGrowthPer9Months, '#,###.00%') : '-';
    this.percentageGrowthPerYear = (fundInfo.percentageGrowthPerYear != null || fundInfo.percentageGrowthPerYear != undefined )? StringUtil.formatNumber(fundInfo.percentageGrowthPerYear, '#,###.00%') : '-';
    this.percentageGrowthPer2Years = (fundInfo.percentageGrowthPer2Years != null || fundInfo.percentageGrowthPer2Years != undefined) ? StringUtil.formatNumber(fundInfo.percentageGrowthPer2Years, '#,###.00%') : '-';
    this.percentageGrowthPer3Years = (fundInfo.percentageGrowthPer3Years != null || fundInfo.percentageGrowthPer3Years != undefined) ? StringUtil.formatNumber(fundInfo.percentageGrowthPer3Years, '#,###.00%') : '-';
    this.percentageGrowthPer5Years = (fundInfo.percentageGrowthPer5Years != null || fundInfo.percentageGrowthPer5Years != undefined) ? StringUtil.formatNumber(fundInfo.percentageGrowthPer5Years, '#,###.00%') : '-';
    this.percentageGrowthYtd = (fundInfo.percentageGrowthYtd != null || fundInfo.percentageGrowthYtd != undefined) ? StringUtil.formatNumber(fundInfo.percentageGrowthYtd, '#,###.00%') : '-';
    this.percentageGrowthLtd = (fundInfo.percentageGrowthLtd != null || fundInfo.percentageGrowthLtd != undefined) ? StringUtil.formatNumber(fundInfo.percentageGrowthLtd, '#,###.00%') : '-';
    this.url = fundInfo.url ? fundInfo.url : '';

    if(fundInfo.topHoldingBoList.length != 0){
      let loop = fundInfo.topHoldingBoList.length;
      if(5 <= loop)
        loop = 5;
      for(var i=0; i<loop; i++)
        fundInfo.topHoldingBoList[i].ratio = (fundInfo.topHoldingBoList[i].ratio != null || fundInfo.topHoldingBoList[i].ratio != undefined)  ? StringUtil.formatNumber(fundInfo.topHoldingBoList[i].ratio, '#,###.00%') : '-';
    }
    this.topHoldingBoList = fundInfo.topHoldingBoList;

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
