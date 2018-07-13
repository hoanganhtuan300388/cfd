/**
 *
 * 価格調整額
 *
 */
import { Component, ElementRef, ChangeDetectorRef, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import "rxjs/add/observable/zip";
import { PanelManageService, BusinessService, PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips, StringUtil } from '../../../core/common';
import { IResProductDetail, IResProductList } from "../../../values/Values";
import * as values from "../../../values/values";
import { ERROR_CODE } from "../../../../../common/businessApi";
import { Messages, GetWarningMessage} from '../../../../../common/message';
import { MessageBox } from '../../../util/utils';

declare var pq:any;
declare var moment:any;
//-----------------------------------------------------------------------------
// COMPONENT : Scr03030101Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03030101',
  templateUrl: './scr-03030101.component.html',
  styleUrls: ['./scr-03030101.component.scss']
})
export class Scr03030101Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  public cfdProductCode:string = '';
  public productName:string = '';
  public priceAdjustmentDate:string = '-';
  public sellPriceAdjustValue:string = '-';
  public buyPriceAdjustValue:string = '-';
  public nearbyMid:string = '-';
  public forwardMid:string = '-';
  public conversionRate:string = '-';

  public resProduct:IResProductList;
  public resProductDetail:IResProductDetail;
  private subscrip:any;
  private updateProductCode;
  private notifySubscribe = [];

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public business: BusinessService,
               public element:  ElementRef,
               public changeRef:ChangeDetectorRef) {
    super( '03030101', screenMng, element, changeRef);
    this.subscrip = screenMng.onChannelEvent().subscribe(val=>{
        if(val.channel == 'priceAdjustList') {
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
    this.notifySubscribe.forEach(s=>{
      s.unsubscribe();
    })
  }

  initLayout(param:any){
    super.initLayout(param);
    this.cfdProductCode = param.productCode ? param.productCode : param.layout.productCode;
    if(this.cfdProductCode){
      this.requestData();
    }

    this.notification();
  }

  /**
	 * OVERRIDE : save layout
	 */
	public getLayoutInfo():values.ILayoutInfo{
		var result = super.getLayoutInfo();

		// set product code.
		result.productCode = this.cfdProductCode;

		return result;
	}

  // title(){
  //   return super.title() + this.productName;
  // }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  public requestData(){
    let input = { productCodes : this.cfdProductCode }
    let product = this.business.getProductList();
    let productDetail = this.business.getProductDetail(input)

    Observable.zip(product, productDetail).subscribe(val=>{
      this.resProduct = val[0];
      this.resProductDetail = val[1];
      if(this.resProductDetail.status == ERROR_CODE.WARN) { // NG or WARN
        MessageBox.info({title:'銘柄詳細取得エラー', message:Messages.ERR_0001});
        return;            
      }
      else if(this.resProductDetail.status == ERROR_CODE.NG) {
        MessageBox.info({title:'銘柄詳細取得エラー', message:(Messages.ERR_0001 + '[CFDS1401T]')});
        return;
      }      
        this.createData();
    },
    err=>{
      switch(err.status) {
        case ERROR_CODE.NETWORK:
          MessageBox.info({title:'銘柄詳細取得エラー', message:(Messages.ERR_0002 + '[CFDS1402C]')});
          break;
      }
    }    
    );
  }

  public createData(){
    let product = this.resProduct.result.productList.filter(val=>val.cfdProductCode==this.cfdProductCode)[0];
    let adjustment = this.resProductDetail.result.priceAdjustmentList.filter(val=>val.cfdProductCode==this.cfdProductCode);

    let boUnit = product.boUnit;

    //let data:any = adjustment.length <= 1 ? adjustment[0] : adjustment[1];
    let data:any = adjustment[1];
    if(adjustment.length == 0) data = {};

    let format = '#,###';
    let format2 = StringUtil.getBoUnitFormat(boUnit)
    let format3 = StringUtil.getFloatingposFormat(Number(data.floatingpos));

    this.productName = product.meigaraSeiKanji;
    //this.priceAdjustmentDate = data.priceAdjustmentDate ? moment(data.priceAdjustmentDate,'YYYYMMDD').format('YYYY/MM/DD') : '-';
    // this.buyPriceAdjustValue = data.buyPriceAdjustValue ? StringUtil.formatNumber(data.buyPriceAdjustValue, format, true) : '-';
    // this.nearbyMid = data.nearbyMid ? StringUtil.formatNumber(data.nearbyMid,format2) : '-';
    // this.forwardMid = data.forwardMid ? StringUtil.formatNumber(data.forwardMid,format2) : '-';
    // this.conversionRate = data.conversionRate ? StringUtil.formatNumber(data.conversionRate,format3) : '-';
    if( data.priceAdjustmentDate == undefined ){
      this.priceAdjustmentDate = '-';
    }else{
      this.priceAdjustmentDate = data.priceAdjustmentDate = moment(data.priceAdjustmentDate,'YYYYMMDD').format('YYYY/MM/DD');
    }
    if( data.sellPriceAdjustValue == undefined ){
      this.sellPriceAdjustValue = '-';
    }else{
      this.sellPriceAdjustValue = data.sellPriceAdjustValue = StringUtil.formatNumber(data.sellPriceAdjustValue, format, true);
    }
    if( data.buyPriceAdjustValue == undefined ){
      this.buyPriceAdjustValue = '-';
    }else{
      this.buyPriceAdjustValue = data.buyPriceAdjustValue = StringUtil.formatNumber(data.buyPriceAdjustValue, format, true);
    }
    if( data.nearbyMid == undefined ){
      this.nearbyMid = '-';
    }else{
      this.nearbyMid = data.nearbyMid = StringUtil.formatNumber(data.nearbyMid,format2);
    }
    if( data.forwardMid == undefined ){
      this.forwardMid = '-';
    }else{
      this.forwardMid = data.forwardMid = StringUtil.formatNumber(data.forwardMid,format2);
    }
    if( data.conversionRate == undefined ){
      this.conversionRate = '-';
    }else{
      this.conversionRate = data.conversionRate = StringUtil.formatNumber(data.conversionRate,format3);
    }
    this.setTitle( '価格調整額', this.productName );
    $(this.element.nativeElement).trigger("click");

    this.updateView();
  }

  public notification(){
    // eodの場合再照会
    this.notifySubscribe.push( this.business.notifyer.EOD().subscribe(val=>{
      // console.log("EOD 再照会");
      this.requestData();
    }));
  }
}
