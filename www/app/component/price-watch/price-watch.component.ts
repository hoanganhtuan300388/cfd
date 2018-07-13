/**
 * 
 * レート一覧：WatchList
 * 
 */
import { Component, Input, OnInit, ElementRef, ChangeDetectorRef, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { MessageBox } from '../../util/utils';
import { Observable } from 'rxjs/Observable';
import "rxjs/add/observable/zip";

import { ERROR_CODE } from "../../../../common/businessApi";
import { ForceReload } from "../../core/notification";
import { BusinessService, PanelViewBase, ComponentViewBase, PanelManageService, ResourceService, CommonConst, Tooltips, IViewState, IViewData, ViewBase, StringUtil } from "../../core/common";
import { IReqAddWatchList, IReqPutWatchList, IResAddWatchList, IResPutWatchList
        , IReqWatchList, IResWatchList
        , IReqDelWatchList, IResDelWatchList 
        , IResconversionRate, IConversionRate
        , IReqPriceList, IResPriceList, IResPrice
        , IReqProductDetail, IResProductDetail, IProductInfo
        , IReqPositionList, IResPositionList, IResPositionInfo
        , IReqProductList, IResProductList
        , IResClassifiedProducts
       } from "../../values/Values";
import { Messages, } from '../../../../common/message';
import { Scr03030100Component } from "../../panel/0303/scr-03030100/scr-03030100.component";
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { PriceWatchUnitComponent } from "../price-watch-unit/price-watch-unit.component";

declare var $:any;
declare var moment:any;

//-----------------------------------------------------------------------------
// COMPONENT : PriceWatchComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'price-watch',
  templateUrl: './price-watch.component.html',
  styleUrls: ['./price-watch.component.scss']
})
export class PriceWatchComponent extends ComponentViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  @Output('emitter') emitter = new EventEmitter<any>();

  //---------------------------------------------------------------------------
  // watchUnit
  // --------------------------------------------------------------------------  
  @ViewChildren('watchUnit') watchUnits:QueryList<PriceWatchUnitComponent>;  

  public productData:any;

  public watchList:any[] = [];
  public productList:string[];
  private notifySubscribe = [];

  public resWatch:IResWatchList;
  public resPrice:IResPriceList;
  public resProduct:IResProductList;
  public resPosition:IResPositionList;
  public resProductDetail:IResProductDetail;
  public resConvRate:IResconversionRate;
  public resClassifiedProduct:IResClassifiedProducts;

  public MSG_WATCH_EMPTY:string = Tooltips.WATCH_HELP;
  public isEmptyWatchList:boolean = false;
  public MSG_WATCH_ERROR:string = '';
  public isErrorWatchList:boolean = false;
  public isErrorPosition:boolean = false;


  private currentPage = 1;
  private pageSize = CommonConst.PAGE_PER_UNIT;
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(public panelMng:PanelManageService,
              public resource:ResourceService,
              public element:ElementRef,
              public business:BusinessService,
              public changeRef:ChangeDetectorRef) {
    super(panelMng, element, changeRef);
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  ngAfterViewInit() { // #2591
    this.emitLoad(false);
    this.requestData();
    this.notification();
  }

  ngOnDestroy(){
    super.ngOnDestroy();

    this.notifySubscribe.forEach(s=>{
      s.unsubscribe();
    })
  }  

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  public onDropSuccess($event){
    this.putWatchList();
  }

  public onChangeWatchList(cfdProductCode){
    this.delWatchList(cfdProductCode);
  }

  public hiddenPanel(){
    // align panel last row
    let panelWidth = $(this.element.nativeElement).parents('.panel').width();
    if(panelWidth && (panelWidth-4)/236 > this.watchList.length){
      return true;
    } else {
      return false;
    }
  }

  public createWatchList(productCodes){
    let watchList = [];

    for(var i=0; i<productCodes.length; i++){
      let cfdProductCode = productCodes[i];
      let price = this.resPrice.result.priceList.find(val=>val.cfdProductCode == cfdProductCode);
      let product = this.resProduct.result.productList.find(val=>val.cfdProductCode == cfdProductCode);
      let detail = null;  // this.resProductDetail.result.productDetailList.find(val=>val.cfdProductCode == cfdProductCode);
      let conversion = this.resConvRate.result.conversionRateList.find(val=>val.currency == product.currency);
      // let positionList = this.resPosition.result.positionList.filter(val=>val.cfdProductCode == cfdProductCode);

      let category; // 0:指数商品, 1:米国株, 2:中国株, 3:ETF
      let categoryLabel;
      for(let i=0; i<this.resClassifiedProduct.result.length; i++){
        let val = this.resClassifiedProduct.result[i];
        if( val.productList.findIndex(f=>cfdProductCode==f.cfdProductCode) > -1 ) {
          category = i
          categoryLabel = val.categoryLabel
          break;
        }
      }

      let watchData = {
        cfdProductCode : cfdProductCode,
        price : price,
        product : product,
        detail : detail,
        conversion : conversion,
        positionList : null,
        category : category,
        categoryLabel : categoryLabel,
        isErrorPosition: this.isErrorPosition
      }

      watchList.push(watchData);
    }

    this.watchList = watchList;
  }

  public requestData(){
    this.isErrorWatchList = false;
    this.isErrorPosition = false;
    let watchList = this.business.getWatchList();
    let product = this.business.getProductList();
    // let positionList = this.business.getPositionList({listdataGetType:'ALL', pageCnt:200});
    let conversionRate = this.business.getConversionRate();
    let classifiedProducts = this.business.getClassifiedProducts();

    // Observable.zip(watchList, product, positionList, conversionRate, classifiedProducts).subscribe(
      Observable.zip(watchList, product, conversionRate, classifiedProducts).subscribe(      
      val => {
        this.resWatch = val[0];
        this.resProduct = val[1];
        // this.resPosition = val[2];
        this.resConvRate = val[2];
        this.resClassifiedProduct = val[3];

        switch(this.resWatch.status){
          case ERROR_CODE.NG:
          this.MSG_WATCH_ERROR = Messages.ERR_0006 + '[CFDS2101T]';
          this.isErrorWatchList = true;
          this.updateView();
          return;
        }

        switch(this.resConvRate.status){
          case ERROR_CODE.NG:
            MessageBox.info({title:'コンバージョンレート取得エラー', message:(Messages.ERR_0001 + '[CFDS0401T]')});
            this.business.logout();
            return;
        }
          
        this.requestPriceData();
      },
      err => {
        switch(err[0].status) {
          case ERROR_CODE.NETWORK:
          case ERROR_CODE.HTTP:
            this.MSG_WATCH_ERROR = 'インターネットに接続されていない、または接続先のサーバーに問題が発生しているため、接続できませんでした。[CFDS2102C]';
            this.isErrorWatchList = true;
            this.updateView();
            return;
        }
        
        switch(err[2].status) {
          case ERROR_CODE.NETWORK:
          case ERROR_CODE.HTTP:
            MessageBox.info({title:'コンバージョンレート取得エラー', message:'インターネットに接続されていない、または接続先のサーバーに問題が発生しているため、接続できませんでした。[CFDS0402C]'});
            return;
        }
      }
    )
  }

  public requestPriceData() {
    let productCodes = this.getProductCodePage();

    if(productCodes.length == 0) {
      this.createWatchList(productCodes);
      this.emitPage();
      this.emitLoad(true);
      this.updateView();
      return;
    }

    let input = { productCodes: productCodes }
    let price = this.business.getPriceList(input);
    // let productDetail = this.business.getProductDetail(input);

    // Observable.zip(price).subscribe(
    this.business.getPriceList(input).subscribe(
    val => {
      this.resPrice = val;
      // this.resProductDetail = val[1];

      switch(this.resPrice.status){
        case ERROR_CODE.WARN:
        case ERROR_CODE.NG:
      }

        this.createWatchList(productCodes);
        this.emitPage();
        this.emitLoad(true);
        this.updateView();
      }
    );
  }

  public getProductCodePage(){
    let watchList = this.resWatch.result.watchList;
    
    let watchLength = watchList.length;
    let pSize = this.pageSize;
    let p = Math.ceil(watchLength/pSize);
    if(this.currentPage > p && p){
      this.currentPage--;
    }
    let cPage = this.currentPage;

    if(watchLength == 0){
      this.isEmptyWatchList = true;
//      this.emitLoad(true);
      return [];
    } else {
      this.isEmptyWatchList = false;
    }

    let productCodes = [];
    let start = cPage==1 ? 0 : (cPage-1)*pSize;
    let end = start+pSize > watchLength ? watchLength : start+pSize;
    for(let i=start; i<end; i++){
      productCodes.push(watchList[i])
    }

    return productCodes;
  }

  public putWatchList(){
    let productCodes = this.watchList.map(val=>val.cfdProductCode);
    let totalLst = this.resWatch.result.watchList;

    let idx = (this.currentPage - 1) * this.pageSize;
    for(let ii = 0; ii < productCodes.length; ii++) {
      totalLst[idx + ii] = productCodes[ii];
    }
    let input = { productCodes: totalLst }
    this.business.putWatchList(input).subscribe(
      val=>{
        switch(val.status){
          case ERROR_CODE.OK:
          case ERROR_CODE.WARN:
          break;
          case ERROR_CODE.NG:
          MessageBox.info({title:'ウォッチリスト更新エラー', message:'ウォッチリストが更新できませんでした。[CFDS2401T]'});
          break;
        }
      },
      err=>{
        switch(err.status){
          case ERROR_CODE.NETWORK:
          case ERROR_CODE.HTTP:
          MessageBox.info({title:'ウォッチリスト更新エラー', message:'インターネットに接続されていない、または接続先のサーバーに問題が発生しているため、接続できませんでした。[CFDS2402C]'});
          break;
        }
      }
    )
  }

  public delWatchList(cfdProductCode:string){
    let input = { cfdProductCode: cfdProductCode }
    this.business.delWatchList(input).subscribe(
      val=>{
        switch(val.status){
          case ERROR_CODE.OK:
          this.resWatch = val;
          this.requestPriceData();
          break;
          case ERROR_CODE.WARN:
          MessageBox.info({title:'ウォッチリスト削除エラー', message:'不正な操作です。'});
          break;
          case ERROR_CODE.NG:
          MessageBox.info({title:'ウォッチリスト削除エラー', message:'ウォッチリストから削除できませんでした。[CFDS2301T]'});
          break;
        }
      },
      err=>{
        switch(err.status){
          case ERROR_CODE.NETWORK:
          case ERROR_CODE.HTTP:
          MessageBox.info({title:'ウォッチリスト削除エラー', message:'インターネットに接続されていない、または接続先のサーバーに問題が発生しているため、接続できませんでした。[CFDS2302C]'});
          break;
        }
      }
    );
  }
  
  public addWatchList(cfdProductCode:string){
    let input = { cfdProductCode: cfdProductCode }
    this.business.addWatchList(input).subscribe(
      val=>{
        switch(val.status){
          case ERROR_CODE.OK:
          this.resWatch = val;
          this.requestPriceData();
          break;
          case ERROR_CODE.WARN:
          MessageBox.info({title:'ウォッチリスト追加エラー', message:'不正な操作です。'},()=>{this.requestData();});
          break;
          case ERROR_CODE.NG:
          MessageBox.info({title:'ウォッチリスト追加エラー', message:'ウォッチリストに追加できませんでした。[CFDS2201T]'},()=>{this.requestData();});
          break;
        }
      },
      err=>{
        switch(err.status){
          case ERROR_CODE.NETWORK:
          case ERROR_CODE.HTTP:
          MessageBox.info({title:'ウォッチリスト追加エラー', message:'インターネットに接続されていない、または接続先のサーバーに問題が発生しているため、接続できませんでした。[CFDS2202C]'},()=>{this.requestData();});
          break;
        }
      }
    );
  }

  public setPage(currpage:number){
    this.currentPage = currpage;
    this.watchList = []; 
    this.emitLoad(false);
    this.requestPriceData();
  }

  public emitPage(){
    let watchList = this.resWatch.result.watchList;

    this.emitter.emit({
      type:'page',
      pageInfo:{
        currentPage: this.currentPage,
        totalPage: Math.ceil(watchList.length / this.pageSize)
      }
    });
  }

  public emitLoad(loaded:boolean){
    this.emitter.emit({
      type:'loading',
      loaded:loaded
    });
    if(loaded)
      this.getPositionCodePage();
  }

  public resize(params){
    $(this.element.nativeElement).find(".pn_st").attr('draggable', 'false');
    $(this.element.nativeElement).find(".pn_st .item").attr('draggable', 'false');
  }

  public resized(params){
    $(this.element.nativeElement).find(".pn_st").attr('draggable', 'true');
    $(this.element.nativeElement).find(".pn_st .item").attr('draggable', 'true');
  }

  public notification(){
    // forceReload
    this.notifySubscribe.push( this.business.notifyer.forceReload().subscribe(val=>{
      if(val == ForceReload.EOD || val == ForceReload.price){
        this.requestPriceData();
      }
    }));

    // eodの場合再照会
    this.notifySubscribe.push( this.business.notifyer.EOD().subscribe(val=>{
      // console.log("EOD 再照会");
      this.requestData();
    }));
  }

  private getPositionCodePage(){
    this.business.getPositionList({listdataGetType:'ALL', pageCnt:200}).subscribe(
      val => {
        this.resPosition = val;

        switch(this.resPosition.status){
          case ERROR_CODE.WARN:
            MessageBox.info({title:'建玉一覧取得エラー', message:Messages.ERR_0001});
            this.isErrorPosition = true;
            break;
          case ERROR_CODE.NG:
            MessageBox.info({title:'建玉一覧取得エラー', message:(Messages.ERR_0001 + '[CFDS0801T]')});
            this.isErrorPosition = true;
            break;
        }
        this.updatePositionInfos();
      },
      err => {
        switch(err.status) {
          case ERROR_CODE.NETWORK:
          case ERROR_CODE.HTTP:
            MessageBox.info({title:'建玉一覧取得エラー', message:'インターネットに接続されていない、または接続先のサーバーに問題が発生しているため、接続できませんでした。[CFDS0801T]'});
            return;
        }
      }
    );
  }

  private updatePositionInfos() {
    let productCodes = this.getProductCodePage();
    if(!productCodes.length) return;
    if(this.resPosition.result.positionList) {
      for(var ii=0; ii<productCodes.length; ii++){
        let positionList = this.resPosition.result.positionList.filter(val=>val.cfdProductCode == productCodes[ii]);
        if(positionList.length) {
          let watchData = this.watchList.find(val=>val.cfdProductCode == productCodes[ii]);
          watchData.positionList = positionList;
          // let watchData = this.watchList.filter(val=>val.cfdProductCode == productCodes[ii])[0];
          // let watchUnit = this.watchUnits.filter(unit=>unit.watchData.cfdProductCode == productCodes[ii])[0];
          // watchUnit.makeData();
        }
      }
    }
    this.watchUnits.forEach(element => {
      element.requestStep2();
    });
  }
}
