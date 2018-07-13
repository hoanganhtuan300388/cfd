/**
 *
 * レート一覧：価格リスト
 *
 */
import { Component, OnInit, ElementRef, Input, ChangeDetectorRef, ViewChild, EventEmitter, Output, ViewChildren, QueryList, HostListener } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import "rxjs/add/observable/zip";
import { MessageBox } from '../../util/utils';
import { ERROR_CODE } from "../../../../common/businessApi";
import { MiniChartComponent } from '../../ctrls/mini-chart/mini-chart.component';
import { ForceReload } from "../../core/notification";
import { BusinessService, PanelViewBase, ComponentViewBase, PanelManageService, ResourceService, CommonConst, Tooltips, IViewState, IViewData, ViewBase, StringUtil } from "../../core/common";
import { IReqAddWatchList, IReqPutWatchList, IResAddWatchList, IResPutWatchList, IReqWatchList, IResWatchList
        , IReqDelWatchList, IResDelWatchList
        , IResconversionRate
        , IReqPriceList, IResPriceList
        , IReqProductDetail, IResProductDetail
        , IReqPositionList, IResPositionList
        , IReqProductList, IResProductList
        , IResClassifiedProducts
      } from "../../values/Values";
import { ContextMenuService, ContextMenuComponent } from 'ngx-contextmenu';
import * as commonApp from '../../../../common/commonApp';

// #2266
import { ILayoutInfo } from '../../values/Values';
import { DeepCopy, keyUpDown } from '../../util/commonUtil';
//

// #2297
import { DialogService } from "ng2-bootstrap-modal";
import { AlertModifyDialogComponent } from '../../component/alert-modify-dialog/alert-modify-dialog.component';
//
// #3374
import { SpeedOrderConfirmComponent } from '../../component/speed-order-confirm/speed-order-confirm.component';

import { AwakeContextMenu } from '../../util/commonUtil'; // #2338

declare var $:any;
declare var _:any;
declare var pq:any;
declare var moment:any;
declare var BigDecimal:any;

// #2461
import { IProductInfo, IResChartTick } from "../../values/Values";
import { CalcPrice, GetDecimalPointValueFromBoUnit } from '../../core/chartCFDInterface';
import { IsArray } from '../../util/commonUtil';

import { Messages, } from '../../../../common/message';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { IConfigDisplaySettings } from "../../core/configinterface";

const TICK_COUNT_LIMIT:number = 10;
const TICK_COLUMN_DATAINDEX:string = 'tick';
function RenderTickChartAt(self:any, $cell:any, tickDatas:any[], rowIndex?:number, firstRender?:boolean) {
  if(!$cell || !tickDatas || !tickDatas.length || tickDatas.length < 1) {
    return;
  }

  try {
    var __jqElem = $cell.find('#eidMiniTickChart');
    var __siteTools = $.__siteTools__;
    if(__jqElem && __siteTools && __siteTools.didDrawMiniLineChartIn) {
      var width  = __jqElem.outerWidth();  // #2838
      var height = __jqElem.outerHeight(); // #2838

      var canvas = __jqElem.get(0);
      if(canvas) {
        // #2838
        var ratio = 1;
        var devicePixelRatio = window.devicePixelRatio || 1;
        ratio = devicePixelRatio;
        canvas.width  = ratio * width;
        canvas.height = ratio * height;
        canvas.style.width  = width + 'px';
        canvas.style.height = height + 'px';

        canvas.width  = ratio * width;
        canvas.height = ratio * height;

        var context = canvas.getContext("2d");

        context.clearRect  (0, 0, canvas.width, canvas.height);
        // [end] #2838

        var pstDp = {
            stEnv : {
                MiniChartConfig : {
                  LineColor: "#00e6e6",
                  BgColor1 : "#0088cc",
                  BgColor2 : "rgba(0, 77, 153, 0.6)",
                }
            },
            datas : [],
            totalSize : TICK_COUNT_LIMIT,
            context : null,
            domElem : null,
            rcDraw  : {
                x : 0,
                y : 0,
                width  : 0,
                height : 0
            },
            margin  : 0,
        };

        let chartTick:any = tickDatas;
        let tickCount:number = tickDatas.length;
        if(tickCount > TICK_COUNT_LIMIT) {
          chartTick = tickDatas.slice(tickCount - TICK_COUNT_LIMIT, tickCount);
        }

        try {
          pstDp.domElem       = canvas;         // #2838
          pstDp.context       = context;        // #2838
          pstDp.rcDraw.width  = width;
          pstDp.rcDraw.height = height;

          pstDp.datas = chartTick;

          __siteTools.didDrawMiniLineChartIn(pstDp);
          __jqElem.off("click").on("click",()=>{
            let rowData = self.grid.pqGrid( "getRowData", {rowIndx: rowIndex} );
            self.openPanel("03030600",rowData,self.contextItemsDefault[3]);
          })
        }
        catch(e) {
          console.error(e);
        }
      }
      else {
        // console.warn("[WARN] There isn't chart canvas at " + rowIndex + ".");
      }
    }
  }
  catch(e) {
    console.error(e);
  }
}
//

//-----------------------------------------------------------------------------
// COMPONENT : PriceListComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'price-list',
  templateUrl: './price-list.component.html',
  styleUrls: ['./price-list.component.scss']
})

/*
_tabType
  0 : ウォッチリスト 1 : 指数・商品 2 : 米国株 3 : 中国株 4 : ETF
*/

/*
_watchType
  0 : panel 1 : list
*/

export class PriceListComponent extends ComponentViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  @Input('tabType') public _tabType: number;
  @Input('initLayoutInfo') public initLayoutInfo: any;
  @Output('emitter') emitter = new EventEmitter<any>();

  @ViewChild('contextMenuComponent') public contextMenuComponent: ContextMenuComponent;
  public contextItems = [];
  public contextItemCorpInfo = { title : '企業情報', scrId: "03030102", enabled:true };
  public contextItemFundInfo = { title : 'ファンド情報', scrId: "03030103", enabled:true };
  public contextItemsDefault = [
    { title : 'スピード注文', scrId: "03020104", enabled:true, useLayout:true },
    { title : '新規注文（売）', scrId: CommonConst.PANEL_ID_NEW_ORDER, enabled:true, buySellType:CommonConst.SELL_TYPE_VAL, autoPrice:true, useLayout:true }, // #2410
    { title : '新規注文（買）', scrId: CommonConst.PANEL_ID_NEW_ORDER, enabled:true, buySellType:CommonConst.BUY_TYPE_VAL , autoPrice:true, useLayout:true }, // #2410
    { title : 'チャート', scrId: "03030600", enabled:true, useLayout:true, option: { initFoot:"0", linked:true } }, // #2266
    { title : 'アラート登録', scrId: "03010500", enabled:true, useAlert:true} // #2297
  ]

  public grid:any;
  public watchList:string[] = []; // watchlist data
  public productList:string[];    // tab product list
  public gridData:any[];
  public pageCodeList:string[];   // page code list

  public resWatch:IResWatchList;
  public resPrice:any;
  public resProduct:IResProductList;
  public resPosition:IResPositionList = null;
  public resProductDetail:IResProductDetail = null;
  public resConvRate:IResconversionRate;
  public resClassifiedProducts:IResClassifiedProducts;

  public subscribeTick:any[]=[];
  private zipSubs   : any = null;
  private priceSubs : any = null;
  private otherSubs : any = null;

  public BTN_WATCHLIST:string = Tooltips.WATCH_BUTTON
  public ADD_WATCHLIST:string = Tooltips.WATCH_ADD
  public DEL_WATCHLIST:string = Tooltips.WATCH_DELETE
  public WATCH_HELP:string = Tooltips.WATCH_HELP;
  public SPEED_ORDER:string = 'スピード注文表示';
  public MSG_WATCH_EMPTY:string = Tooltips.WATCH_HELP;

  public isEmptyWatchList:boolean = false;
  public btnAsk = null;
  public btnBid = null;
  private dragIdx:number;
  // public bidArrow = null;
  // public askArrow = null;
  public arrowAskCls:string[] = [];
  public arrowBidCls:string[] = [];
  public preBid:number[] = [];
  public preAsk:number[] = [];
  public initArrow:number[] = [];

  public seletedIndex:number = null;
  private layoutInfo:any = [];
  private notifySubscribe = [];
  private isErrorPosition: boolean = false;

  private currentPage = 1;
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(public panelMng:PanelManageService
              , public resource:ResourceService
              , public element:ElementRef
              , public business:BusinessService
              , public changeRef:ChangeDetectorRef
              , public contextMenu: ContextMenuService
              , public dialogService: DialogService // #2297
            ) {
    super(panelMng, element, changeRef);
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  ngAfterViewInit() { // #2591
    this.emitLoad(false);

    this.btnAsk = $(this.element.nativeElement).find(".button-order-ask");
    this.btnBid = $(this.element.nativeElement).find(".button-order-bid");
    if (this.initLayoutInfo && this.initLayoutInfo[this._tabType]) {
      this.layoutInfo = this.initLayoutInfo[this._tabType];
    }
    this.initGrid();
    this.notification();
  }

  ngOnDestroy(){
    super.ngOnDestroy();

    this.unsubscribe();

    this.notifySubscribe.forEach(s=>{
      s.unsubscribe();
    })
  }

  /**
   * 画面が最小化から復元された際、呼び出される。
   */
  public onPanelRestored(){
    if(this.grid){
      this.grid.pqGrid('refreshDataAndView');
    }
  }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  public initGrid() {
    let that = this;
    let $grid = $(this.element.nativeElement.querySelector('.pq-grid-area'));

    let tempColModel = [];
    if(this._tabType == 0){
      tempColModel = [
        { dataIndx: 'productName', title: '銘柄名', align: 'left', width:224, tooltip:true, sortable: false, cls:'body-col-first',
          render: function(ui){
            let isWatchList:boolean = ui.rowData.isWatchList;

            let watchBtnCls:string = isWatchList ? 'svg-icons icon-bookmark-on pull-left' : 'svg-icons icon-bookmark-off pull-left';
            let watchBtnTitle:string = isWatchList ? that.DEL_WATCHLIST : that.ADD_WATCHLIST;
            let watchBtn:string = '<a href="#" title="'+watchBtnTitle+'"><i class="'+watchBtnCls+'"></i></a>';

            let linkBtn:string = '<button class="button button-icon-sm pull-right" (click)="onClickSpeedOrder($event)" title="'+that.SPEED_ORDER+'"><i class="svg-icons icon-speedorder"></i></button>';

            let width = ui.column.width - 65;
            let productName = '<span style="width:'+width+'px;text-align: left;" class="label label-bright label-single-row">' + ui.rowData.productName + '</span>';

            return [watchBtn,productName,linkBtn].join('');
          },
          postRender: function(ui){
            var grid = this,
            $cell = grid.getCell(ui);
            $cell.find('.svg-icons').eq(0).unbind('click').bind('click',function($event){
              if (that.resource.confirmHideDeleteWatch == false) {
                MessageBox.question({
                  title:"ウォッチリストから削除",
                  message:"ウォッチリストから削除してよろしいですか？",
                  checkboxLabel:"今後、このメッセージを表示しない"
                },
                (response, checkboxChecked)=>{
                  if(response==1) { //OK
                    that.resource.confirmHideDeleteWatch = checkboxChecked;
                    ui.rowData.isWatchList = false;
                    grid.refreshCell({ rowIndx: ui.rowIndx, dataIndx: ui.dataIndx })
                    that.delWatchList(ui.rowData.cfdProductCode)
                  }
                }
                );
              } else {
                ui.rowData.isWatchList = false;
                grid.refreshCell({ rowIndx: ui.rowIndx, dataIndx: ui.dataIndx })
                that.delWatchList(ui.rowData.cfdProductCode)
              }
            });

            $cell.find('.svg-icons').eq(1).unbind('click').bind('click',function($event){
              that.openPanel('03020104',ui.rowData,that.contextItemsDefault[0]);
            });
          }
        },
        { dataIndx: 'bid', title: 'BID', width:112, dataType:'number', cls: 'body-col-no-padding', sortable: false,
          render:(ui)=>{
            let data:number = ui.cellData;
            let i:number = ui.rowData.cfdProductCode;
            let format = StringUtil.getBoUnitFormat(ui.rowData.boUnit,false);
            let preBid = this.preBid[i] ? this.preBid[i] : undefined;
            let formatVal = Number(StringUtil.formatNumber(data, format));
            let formatVal2 = StringUtil.formatNumber(data, format);
            if(this.initArrow[i] == 1){
              let arrow:string = ui.rowData.bidArrow;
              if(arrow=='up'){
                this.arrowBidCls[i] = 'svg-icons icon-rateup';
              }else if(arrow=='down'){
                this.arrowBidCls[i] = 'svg-icons icon-ratedown';
              }
              this.initArrow[i] = 2;
            }

            let bgColor:string = "";
            if(preBid < formatVal){
              if (this.isPriceFlashingOn()) {
                bgColor = "button-up-blink";
              }
              this.arrowBidCls[i] = 'svg-icons icon-rateup';
            }else if(preBid > formatVal){
              if (this.isPriceFlashingOn()) {
                bgColor = "button-down-blink";
              }
              this.arrowBidCls[i] = 'svg-icons icon-ratedown';
            }
            this.preBid[i] = formatVal;

            let disabled:string = ui.rowData.validFlag == 0 ? ' ask-bid-disabled' : ''

            return {
              text: '<button class="button button-label button-order-bid button-label-order-list '+ bgColor + disabled +'" '+'>'+formatVal2+'</button><i style="margin: -4px 6px;" class="'+this.arrowBidCls[i]+disabled+'"></i>'
            }
          }
        },
        { dataIndx: 'ask', title: 'ASK', width:112, dataType:'number', cls: 'body-col-no-padding', sortable: false,
          render:(ui)=>{
            let data:number = ui.cellData;
            let i:number = ui.rowData.cfdProductCode;
            let format = StringUtil.getBoUnitFormat(ui.rowData.boUnit,false);
            let preAsk = this.preAsk[i] ? this.preAsk[i] : undefined;
            let formatVal = Number(StringUtil.formatNumber(data, format));
            let formatVal2 = StringUtil.formatNumber(data, format);

            if(this.initArrow[i] < 3){
              let arrow:string = ui.rowData.askArrow;
              if(arrow=='up'){
                this.arrowAskCls[i] = 'svg-icons icon-rateup';
              }else if(arrow=='down'){
                this.arrowAskCls[i] = 'svg-icons icon-ratedown';
              }
              this.initArrow[i] = 3;
            }

            let bgColor:string = "";

            if(preAsk < formatVal){
              this.arrowAskCls[i] = 'svg-icons icon-rateup';
              if (this.isPriceFlashingOn()) {
                bgColor = "button-up-blink";
              }
            }else if(preAsk > formatVal){
              this.arrowAskCls[i] = 'svg-icons icon-ratedown';
              if (this.isPriceFlashingOn()) {
                bgColor = "button-down-blink";
              }
            }

            this.preAsk[i] = formatVal;

            let disabled:string = ui.rowData.validFlag == 0 ? ' ask-bid-disabled' : ''

            return {
              text: '<button class="button button-label button-order-ask button-label-order-list '+ bgColor + disabled + '" '+'>'+formatVal2+'</button><i style="margin: -4px 6px;" class="'+this.arrowAskCls[i]+disabled+'"></i>'
            }
          }
        },
        { dataIndx: 'change', title: '前日比<br/>前日比(%)', width:80, sortable:false, cls: 'body-col-num-mid',
          render:(ui)=>{
            // change
            let data:number = ui.rowData.change;
            let cls:string = '';
            let format = StringUtil.getBoUnitFormat(ui.rowData.boUnit,false);
            let formatVal = StringUtil.formatNumber(data, format, true);

            if(data > 0){
              cls = 'text-price-up';
            } else if(data < 0){
              cls = 'text-price-down';
            }

            // changeRate
            let data2:number = ui.rowData.changeRate;
            let cls2:string = '';
            let formatVal2 = StringUtil.formatNumber(data2, '#,###.00', true);

            if(data2 > 0){
              cls2 = 'text-price-up';
            } else if(data2 < 0){
              cls2 = 'text-price-down';
            }

            return '<span class="'+cls+'" >'+formatVal+'</span><br/><span class="'+cls2+'" >'+formatVal2+' %</span>';
          }
        },
        { dataIndx: TICK_COLUMN_DATAINDEX, title:'TICK', align: 'center', sortable:false, width:80,
          // #2461
          render:(ui)=>{
            // LINE CHART CELL
            var htmlText  = '<canvas id="eidMiniTickChart" class="chart-wrapper-area" style="width:100%;height:100%;top:0px;left:0px;"></canvas>';
            return(htmlText);
          },
          postRender:function(ui){
            try {
              var grid = this;
              var $cell = grid.getCell(ui);
              RenderTickChartAt(that, $cell, ui.rowData.chartTick, ui.rowIndx, true); // #2838
            }
            catch(e) {
              console.error(e);
            }
          }
          // [end] #2461
        },
        { dataIndx: 'open', title: '始値<br/>前日終値', width:72, sortable:false, cls: 'body-col-num-mid', align: 'center',
          render:(ui)=>{
            let format = StringUtil.getBoUnitFormat(ui.rowData.boUnit,false);
            let open = StringUtil.formatNumber(ui.rowData.open, format);
            let close = StringUtil.formatNumber(ui.rowData.close, format);
            return open+'<br/>'+close;
          }
        },
        { dataIndx: 'high', title: '高値<br/>安値', width:72, sortable:false, cls: 'body-col-num-mid', align: 'center',
          render:(ui)=>{
            let format = StringUtil.getBoUnitFormat(ui.rowData.boUnit,false);
            let high = StringUtil.formatNumber(ui.rowData.high, format);
            let low = StringUtil.formatNumber(ui.rowData.low, format);
            return high+'<br/>'+low;
          }
        },
        { dataIndx: 'minAmount', title: '最低約定金額<br/>必要証拠金', align: 'center', width:96, sortable:false, cls: 'body-col-num-mid',
          render:(ui)=>{
            let format = '#,###<span class="unit">円</span>';
            let minAmount = StringUtil.formatNumber(ui.rowData.minAmount, format);
            let marginRequired = StringUtil.formatNumber(ui.rowData.marginRequired, format);
            return '<div class="column-span">' + minAmount + '</div>' + '<div class="column-span">' + marginRequired + '</div>';
          }
        },
        { dataIndx: 'volatility', title: 'ボラティリティ', width:80, format:'#,###.00%', cls: 'body-col-num header-col-text-transform-70', sortable: false,
          render:(ui)=>{
            let cellData = ui.cellData;
            let text = cellData ? cellData : '-';
            return { text:text }
          }
        },
        { dataIndx: 'currQtySell', title: '売建<br/>買建', width:72, sortable:false, cls: 'body-col-num-mid',
          render:(ui)=>{
            let format = '#,###';
            let isErrorPosition = ui.rowData.isErrorPosition;
            if(isErrorPosition) {
              return ''+'<br/>'+ '';
            }
            else {
              let currQtySell = StringUtil.formatNumber(ui.rowData.currQtySell, format);
              let currQtyBuy = StringUtil.formatNumber(ui.rowData.currQtyBuy, format);
              return currQtySell+'<br/>'+currQtyBuy;
            }
          }
        },
        { dataIndx: 'profit', title: '損益 ', width:144, cls: 'body-col-num-mid', sortable: false,
          render: function(ui){
            let profit = ui.rowData.profit;
            let format = '#,###';
            let formatVal = StringUtil.formatNumber(profit, format);
            let isErrorPosition = ui.rowData.isErrorPosition;
            if(isErrorPosition) {
              return '<span> </span><span class="unit">円</span>';
            }
            else {
              if(profit < 0) {
                return '<span class="text-price-down">' + formatVal + '</span><span class="unit">円</span>';
              } else if (profit > 0) {
                return '<span class="text-price-up">+' + formatVal + '</span><span class="unit">円</span>';
              } else {
                return '<span>0</span><span class="unit">円</span>';
              }
            }
          }
        }
      ]
    } else {
      tempColModel = [
        { dataIndx: 'productName', title: '銘柄名', align: 'left', width:224, tooltip:true, sortable: false,
          render: function(ui){
            let isWatchList:boolean = ui.rowData.isWatchList;

            let watchBtnCls:string = isWatchList ? 'svg-icons icon-bookmark-on pull-left' : 'svg-icons icon-bookmark-off pull-left';
            let watchBtnTitle:string = isWatchList ? that.DEL_WATCHLIST : that.ADD_WATCHLIST;
            let watchBtn:string = '<a href="#" title="'+watchBtnTitle+'"><i class="'+watchBtnCls+'"></i></a>';

            let linkBtn:string = '<button class="button button-icon-sm pull-right" (click)="onClickSpeedOrder($event)" title="'+that.SPEED_ORDER+'"><i class="svg-icons icon-speedorder"></i></button>';

            let width = ui.column.width - 65;
            let productName = '<span style="width:'+width+'px;text-align: left;" class="label label-bright label-single-row">' + ui.rowData.productName + '</span>';

            return [watchBtn,productName,linkBtn].join('');
          },
          postRender: function(ui){
            var grid = this,
            $cell = grid.getCell(ui);
            $cell.find('.svg-icons').eq(0).unbind('click').bind('click',function($event){
              if($(this).hasClass('icon-bookmark-off')){
                ui.rowData.isWatchList = true;
                grid.refreshCell({ rowIndx: ui.rowIndx, dataIndx: ui.dataIndx })
                that.addWatchList(ui.rowData.cfdProductCode);
              } else {
                if (that.resource.confirmHideDeleteWatch == false) {
                  MessageBox.question({
                    title:"ウォッチリストから削除",
                    message:"ウォッチリストから削除してよろしいですか？",
                    checkboxLabel:"今後、このメッセージを表示しない"
                  },
                  (response, checkboxChecked)=>{
                    if(response==1) { //OK
                      that.resource.confirmHideDeleteWatch = checkboxChecked;
                      ui.rowData.isWatchList = false;
                      grid.refreshCell({ rowIndx: ui.rowIndx, dataIndx: ui.dataIndx })
                      that.delWatchList(ui.rowData.cfdProductCode)
                    }
                  }
                  );
                } else {
                  ui.rowData.isWatchList = false;
                  grid.refreshCell({ rowIndx: ui.rowIndx, dataIndx: ui.dataIndx })
                  that.delWatchList(ui.rowData.cfdProductCode)
                }
              }
            });
            $cell.find('.svg-icons').eq(1).unbind('click').bind('click',function($event){
              that.openPanel('03020104',ui.rowData,that.contextItemsDefault[0]);
            });
          },
          sortType:(rowData1,rowData2,dataIndx)=>{
            let data1 = this.resProduct.result.productList.find(ele=>ele.cfdProductCode==rowData1.cfdProductCode).meigaraSeiKana;
            let data2 = this.resProduct.result.productList.find(ele=>ele.cfdProductCode==rowData2.cfdProductCode).meigaraSeiKana;
            if(data1 > data2) return 1
            if(data1 < data2) return -1
            return 0
          }
        },
        { dataIndx: 'bid', title: 'BID', width:112, dataType:'number', cls: 'body-col-no-padding', sortable: false,
          render:(ui)=>{
            let data:number = ui.cellData;
            let i:number = ui.rowData.cfdProductCode;
            let format = StringUtil.getBoUnitFormat(ui.rowData.boUnit,false);
            let preBid = this.preBid[i] ? this.preBid[i] : undefined;
            let formatVal = Number(StringUtil.formatNumber(data, format));
            let formatVal2 = StringUtil.formatNumber(data, format);

            if(this.initArrow[i] < 2){
              let arrow:string = ui.rowData.bidArrow;
              if(arrow=='up'){
                this.arrowBidCls[i] = 'svg-icons icon-rateup';
              }else if(arrow=='down'){
                this.arrowBidCls[i] = 'svg-icons icon-ratedown';
              }
              this.initArrow[i] = 2;
            }

            let bgColor:string = "";
            if(preBid < formatVal){
              if (this.isPriceFlashingOn()) {
                bgColor = "button-up-blink";
              }
              this.arrowBidCls[i] = 'svg-icons icon-rateup';
            }else if(preBid > formatVal){
              if (this.isPriceFlashingOn()) {
                bgColor = "button-down-blink";
              }
              this.arrowBidCls[i] = 'svg-icons icon-ratedown';
            }
            this.preBid[i] = formatVal;

            let disabled:string = ui.rowData.validFlag == 0 ? ' ask-bid-disabled' : ''

            return {
              text: '<button class="button button-label button-order-bid button-label-order-list '+ bgColor + disabled +'" '+'>'+formatVal2+'</button><i style="margin: -4px 6px;" class="'+this.arrowBidCls[i]+disabled+'"></i>',
            }
          }
        },
        { dataIndx: 'ask', title: 'ASK', width:112, dataType:'number', cls: 'body-col-no-padding', sortable: false,
          render:(ui)=>{
            let data:number = ui.cellData;
            let i:number = ui.rowData.cfdProductCode;
            let format = StringUtil.getBoUnitFormat(ui.rowData.boUnit,false);
            let preAsk = this.preAsk[i] ? this.preAsk[i] : undefined;
            let formatVal = Number(StringUtil.formatNumber(data, format));
            let formatVal2 = StringUtil.formatNumber(data, format);

            if(this.initArrow[i] < 3){
              let arrow:string = ui.rowData.askArrow;
              if(arrow=='up'){
                this.arrowAskCls[i] = 'svg-icons icon-rateup';
              }else if(arrow=='down'){
                this.arrowAskCls[i] = 'svg-icons icon-ratedown';
              }
              this.initArrow[i] = 3;
            }

            let bgColor:string = "";

            if(preAsk < formatVal){
              this.arrowAskCls[i] = 'svg-icons icon-rateup';
              if (this.isPriceFlashingOn()) {
                bgColor = "button-up-blink";
              }
            }else if(preAsk > formatVal){
              this.arrowAskCls[i] = 'svg-icons icon-ratedown';
              if (this.isPriceFlashingOn()) {
                bgColor = "button-down-blink";
              }
            }

            this.preAsk[i] = formatVal;

            let disabled:string = ui.rowData.validFlag == 0 ? ' ask-bid-disabled' : ''

            return {
              text: '<button class="button button-label button-order-ask button-label-order-list '+ bgColor + disabled +'" '+'>'+formatVal2+'</button><i style="margin: -4px 6px;" class="'+this.arrowAskCls[i]+disabled+'"></i>',
            }
          }
        },
        { dataIndx: 'change', title: '前日比<br/>前日比(%)', width:80, sortable:false, cls: 'body-col-num-mid',
          render:(ui)=>{
            // change
            let data:number = ui.rowData.change;
            let cls:string = '';
            let format = StringUtil.getBoUnitFormat(ui.rowData.boUnit,false);
            let formatVal = StringUtil.formatNumber(data, format, true);

            if(data > 0){
              cls = 'text-price-up';
            } else if(data < 0){
              cls = 'text-price-down';
            }

            // changeRate
            let data2:number = ui.rowData.changeRate;
            let cls2:string = '';
            let formatVal2 = StringUtil.formatNumber(data2, '#,###.00', true);

            if(data2 > 0){
              cls2 = 'text-price-up';
            } else if(data2 < 0){
              cls2 = 'text-price-down';
            }

            return '<span class="'+cls+'" >'+formatVal+'</span><br/><span class="'+cls2+'" >'+formatVal2+' %</span>';
          }
        },
        { dataIndx: TICK_COLUMN_DATAINDEX, title:'TICK', align: 'center', sortable: false,
          // #2461
          render:(ui)=>{
            // LINE CHART CELL
            var htmlText  = '<canvas id="eidMiniTickChart" class="chart-wrapper-area" style="width:100%;height:100%;top:0px;left:0px;"></canvas>';
            return(htmlText);
          },
          postRender:function(ui){
            try {
              var grid = this;
              var $cell = grid.getCell(ui);
              RenderTickChartAt(that, $cell, ui.rowData.chartTick, ui.rowIndx, true); // #2838
            }
            catch(e) {
              console.error(e);
            }
          }
          // [end] #2461
        },
        { dataIndx: 'open', title: '始値<br/>前日終値', width:72, sortable:false, cls: 'body-col-num-mid', align: 'center',
          render:(ui)=>{
            let format = StringUtil.getBoUnitFormat(ui.rowData.boUnit,false);
            let open = StringUtil.formatNumber(ui.rowData.open, format);
            let close = StringUtil.formatNumber(ui.rowData.close, format);
            return open+'<br/>'+close;
          }
        },
        { dataIndx: 'high', title: '高値<br/>安値', width:72, sortable:false, cls: 'body-col-num-mid', align: 'center',
          render:(ui)=>{
            let format = StringUtil.getBoUnitFormat(ui.rowData.boUnit,false);
            let high = StringUtil.formatNumber(ui.rowData.high, format);
            let low = StringUtil.formatNumber(ui.rowData.low, format);
            return high+'<br/>'+low;
          }
        },
        { dataIndx: 'minAmount', title: '最低約定金額<br/>必要証拠金', align: 'center', width:96, sortable:false, cls: 'body-col-num-mid',
          render:(ui)=>{
            let format = '#,###円';
            let minAmount = StringUtil.formatNumber(ui.rowData.minAmount, format);
            let marginRequired = StringUtil.formatNumber(ui.rowData.marginRequired, format);
            return '<div class="column-span">' + minAmount + '</div>' + '<div class="column-span">' + marginRequired + '</div>';
          }
        },
        { dataIndx: 'volatility', title: 'ボラティリティ', width:80, format:'#,###.00%', cls: 'body-col-num header-col-text-transform-70', sortable: false,
          render:(ui)=>{
            let cellData = ui.cellData;
            let text = cellData ? cellData : '-';
            return { text:text }
          }        
        },
        { dataIndx: 'interRateBaseDate', title: '金利調整額', width:232, align: 'center', cls: 'header-col-double', sortable: false,
          colModel: [
            { dataIndx: 'interRateSell', title: '売(円)', width:80, cls: 'body-col-num', format:'#,###.00',sortable: false, nodrag:true, nodrop:true,
              render:(ui)=>{
                let cellData = ui.cellData;
                let text = cellData ? cellData : '-';
                return { text:text }
              }
            },
            { dataIndx: 'interRateBuy', title: '買(円)', width:80, cls: 'body-col-num', format:'#,###.00', sortable: false, nodrag:true, nodrop:true,
              render:(ui)=>{
                let cellData = ui.cellData;
                let text = cellData ? cellData : '-';
                return { text:text }
              }
            },
            { dataIndx: 'interRateDays', title: '付与日数', width:72, cls: 'body-col-num', format:'#,###', sortable: false, nodrag:true, nodrop:true,
              render:(ui)=>{
                let cellData = ui.cellData;
                let text = cellData ? cellData : '-';
                return { text:text }
              }
            }
          ]
        },
        { dataIndx: 'accountType', title: '口座区分<br/>通貨', width:110, sortable:false, cls: 'body-col-num-mid',
          render:(ui)=>{
            return ui.rowData.accountType + '<br/>' + ui.rowData.currency;
          }
        },
        { dataIndx: 'tradeUnit', title: '取引単位<br/>レバレッジ', width:72, sortable:false, cls: 'body-col-num-mid header-col-text-transform-70',
          render:(ui)=>{
            let formatUnit = '';
            let formatRatio = '#,###<span class="unit">倍</span>';
            if (ui.rowData.tradeUnit >= 1) {
              formatUnit = '#,###<span class="unit">倍</span>';
            } else {
              formatUnit = '#.0<span class="unit">倍</span>';
            }
            let minAmount = StringUtil.formatNumber(ui.rowData.tradeUnit, formatUnit);
            let marginRequired = StringUtil.formatNumber(ui.rowData.leverageRatio, formatRatio);
            return minAmount+'<br/>'+marginRequired;
          }
        },
        { dataIndx: 'convBid', title: 'コンバージョンレート<br/>更新日時', width:128, sortable:false, cls: 'body-col-num-mid header-col-text-transform-70',
          render:(ui)=>{
            //let resConvRate = this.resConvRate.result.conversionRateList.filter(el => el.currency == ui.rowData.currency)[0];
            let resConvRate = this.resConvRate.result.conversionRateList.find(el => el.currency == ui.rowData.currency);
            let format3 = StringUtil.getFloatingposFormat(Number(resConvRate.floatingpos));
            let convBid = StringUtil.formatNumber(ui.rowData.convBid,format3);
            return convBid +'<br/>'+moment(ui.rowData.convCreateDate,'YYYYMMDDHHmmss').format('YYYY/MM/DD HH:mm');
          }
        },
        { dataIndx: 'eachTradeTimeList', title: '取引時間', width:115, cls: 'body-col-num', sortable: false,
          render:function(ui){
            let eachTradeTimeList:any[] = ui.cellData;

            let result = eachTradeTimeList.map(el=>{
              let start:string = el.eachTradeStartTime;
              let end:string = el.eachTradeEndTime;
              let startDate = "";
              if (Number(start)<=2400) {
                startDate = moment(start,'HHmm').format('HH:mm');
              } else {
                let diff = (Number(start) - 2400).toString();
                if(diff.length < 4) diff = '0' + diff;
                startDate = '<span class="unit">翌</span>' + moment(diff,'HHmm').format('HH:mm');
              }
              let endDate = moment(end,'HHmm').format('HH:mm');
              if(start == '0000' || end =='0000')
                return '取引なし'

              if(2400 - Number(end) < 0){
                let diff = String(Number(end)-2400);
                while(diff.length < 4) diff = '0' + diff; // lpad
                endDate = moment(diff,'HHmm').format('HH:mm');
                return startDate+'<span class="unit">～翌</span>'+endDate;
              } else {
                return startDate+'<span class="unit">～</span>'+endDate;
              }
            });

            return result.join('</br>')
          }
        },
        { dataIndx: 'losscutRange', title: 'ロスカット幅<br/>(約定単位±)', width:104, cls: 'body-col-num header-col-text-transform-70', sortable: false,
          render:function(ui){
            let cellData:number = ui.cellData;
            let currency:string = ui.rowData.currency;
            let format = '#,###.00';
            let formatVal = StringUtil.formatNumber(cellData, format);            
            if(!formatVal) formatVal = '';
            return formatVal+currency;
          }
        },
        { dataIndx: 'losscutAlertRange', title: 'ロスカットアラート幅<br/>(ロスカットレート±)', width:104, cls: 'body-col-num header-col-text-transform-70', sortable: false,
          render:function(ui){
            let cellData:number = ui.cellData;
            let currency:string = ui.rowData.currency;
            let format = '#,###.00';
            let formatVal = StringUtil.formatNumber(cellData, format);
            if(!formatVal) formatVal = '';
            return formatVal+currency;
          }
        }
      ]
      if(this._tabType == 1){ // 指数・商品
        tempColModel.push({ title: '価格調整額', align: "center", width:128, cls: 'header-col-double', colModel: [
          { dataIndx: 'priceAdjustmentDate', title: '発生予定日', cls: 'body-col-num', align: "center",width:96, sortable: false, nodrag:true, nodrop:true,
            render:function(ui){
              if(ui.cellData){
                return moment(ui.cellData,'YYYYMMDD').format('YYYY/MM/DD');
              } else{
                return '-'
              }
            }
          },
          { dataIndx: '03030101', title: '前回', width:32, align: 'center', sortable:false, nodrag:true, nodrop:true,
            render:function(ui){
              return {
                text:'<button class="button button-icon-sm"><i class="svg-icons icon-priceadj"></i></button>',
              }
            }
          },
        ]});
      } else if(this._tabType == 2 || this._tabType == 3){ // 米国株, 中国株
        tempColModel.push({ dataIndx: '03030102', width:80, title: '企業情報', align: 'center', sortable:false,
          render:function(ui){
            return {
              text:'<button class="button button-icon-sm"><i class="svg-icons icon-corporate"></i></button>',
            }
          }
        });
      } else if(this._tabType == 4){ // ETF
        tempColModel.push({ dataIndx: '03030103', width:80, title: 'ファンド<br/>情報', align: 'center', sortable:false,
          render:function(ui){
            return {
              text:'<button class="button button-icon-sm"><i class="svg-icons icon-fund"></i></button>',
            }
          }
        });
      }
    }
    let colModel = [];
    if(this.layoutInfo.length != 0){
      colModel = this.layoutInfo.map(m=>{
        let col = tempColModel.find(f=>f.dataIndx==m.dataIndx);
        (col as any).width = m.width;
        return col;
      });
    } else {
      colModel = tempColModel;
    }
    this.grid = $grid.pqGrid({
        width: 'auto',
        height: this.getGridHeight(),
        columnTemplate: { halign: 'center', align: 'right', dataType: 'string', tooltip:false },
        colModel: colModel,
        dataModel: { data: [], location: 'local' },
        pageModel: { type: 'local', rPP:CommonConst.PAGE_PER_UNIT },
        selectionModel: { type:'row', mode:'single' },
        sortModel: { on:true, cancel:true },
        scrollModel: { lastColumn:"none" },
        postRenderInterval: 200, //#2461
        // postRenderInterval: 0, // #2461:for chart painting
        freezeCols: 1,
        editable: false,
        numberCell: false,
        swipeModel: { on: false },
        showBottom: true,
        showTitle: false,
        showToolbar: false,
        showTop: false,
        stripeRows: false,
        wrap: false,
        hwrap: false,
        // virtualX : true, // #2461
        // virtualY : true, // #2461
        cellKeyDown: ( event, ui ) => {
          keyUpDown(this.grid,event,ui);
        },
        rowSelect:($event, ui)=> {
          if (ui.addList.length > 0) {
            this.seletedIndex = ui.addList[0].rowIndx;
          }
        },
        cellClick:($event, ui) => {
          let cfdProductCode = ui.rowData.cfdProductCode;
          if(ui.dataIndx == 'bid'){
            // #2401
            // 売注文
            let scrId:string = CommonConst.PANEL_ID_NEW_ORDER; // 新規注文
            let item:any = {
              enabled:true,
              buySellType:CommonConst.SELL_TYPE_VAL,
              useLayout:true,
              autoPrice:true
            };
            that.openPanel(CommonConst.PANEL_ID_NEW_ORDER, ui.rowData, item);
            //
          } else if(ui.dataIndx == 'ask'){
            // #2401
            // 買注文
            let scrId:string = CommonConst.PANEL_ID_NEW_ORDER; // 新規注文
            let item:any = {
              enabled:true,
              buySellType:CommonConst.BUY_TYPE_VAL,
              useLayout:true,
              autoPrice:true
            };
            that.openPanel(CommonConst.PANEL_ID_NEW_ORDER, ui.rowData, item);
            //
          } else if(ui.dataIndx == '03030101' || ui.dataIndx == '03030102' || ui.dataIndx == '03030103'){
            let param = {
                productCode:cfdProductCode,
                layout:{
                    external:this.isExternalWindow()
                }
            }
            if(ui.dataIndx == "03030102"){
              ui.item = this.contextItemCorpInfo;
            }else{
              ui.item = this.contextItemFundInfo;
            }
            that.openPanel(ui.dataIndx, ui.rowData,ui.item);
          }
        },
        rowRightClick: ($event:MouseEvent, ui) => {
          let cfdProductCode = ui.rowData.cfdProductCode;
          let category; // 0:指数商品, 1:米国株, 2:中国株, 3:ETF
          for(let i=0; i<this.resClassifiedProducts.result.length; i++){
            let val = this.resClassifiedProducts.result[i];
            if( val.productList.findIndex(f=>cfdProductCode==f.cfdProductCode) > -1 ) {
              category = i
              break;
            }
          }
          this.contextItems = _.clone(this.contextItemsDefault);
          switch(category){
            case 1 :
            case 2 :
              this.contextItems.unshift({divider:true});
              this.contextItems.unshift(this.contextItemCorpInfo);
              break;
            case 3 :
              this.contextItems.unshift({divider:true});
              this.contextItems.unshift(this.contextItemFundInfo);
              break;
          }
          this.showContextMenu($event, ui.rowData)
        },
        refresh:(event:Event,ui) => {
          if (this._tabType == 0) {
            this.makeRowDragable();
          }

          if (this.grid) {
            let spanRow = $(this.element.nativeElement).find(".label.label-single-row");
            let col = this.grid.pqGrid( "getColumn",{ dataIndx: "productName" } );
            if(col.width < 90){
              spanRow.css("display","none");
            }else{
              spanRow.css("display","inline-block");
            }
          }
        },
        columnOrder:(event,ui) => {
          this.saveLayout();
        },
        columnResize:(event,ui) => {
          this.saveLayout();
        }
    });

    this.requestData_01();
  }

  showContextMenu($event, rowData) {
    this.updateView();
    this.contextMenu.show.next({
      contextMenu: this.contextMenuComponent,
      event: $event,
      item: rowData
    });
    $event.preventDefault();
    $event.stopPropagation();

    AwakeContextMenu($event); // #2338
  }

  onClickContextItem(rowData: any, item:any){
    this.openPanel(item.scrId, rowData, item);
  }

  openPanel(scrId:string, rowData?:any, item?:any){
    // #2266
    let self = this;
    try {
      let param:any;

      if(!!item) {
        if(item.useLayout === true) {
          param = {};
          let layout:ILayoutInfo = {} as ILayoutInfo;
          if(!!rowData) {
            layout.productCode = rowData.cfdProductCode;
            if(item.option) {
              layout.option = DeepCopy(item.option);
            }

            if(!layout.option) {
              layout.option = {};
            }

            layout.option.buySellType = item.buySellType ? item.buySellType : rowData.buySellType;
            layout.option.productName = self.resProduct.result.productList.filter(el => el.cfdProductCode == rowData.cfdProductCode)[0].meigaraSeiKanji;
            layout.option.channl = "rate";

            // #2410
            if(item.autoPrice == true) {
              layout.option.price = CommonConst.NEW_ORDER_PRICE_AUTO_UPDATE_PRICE;
            }

            if(item.orderType) {
              layout.option.orderType = item.orderType;
            }

            // 価格は入力値が優先
            if(item.price) {
              layout.option.price = item.price;
            }
            //
          }

          param.layout = layout;
        }
        // #2297
        else if(item.useAlert === true) {
          let dialogService:DialogService = self.dialogService;
          if(dialogService) {
            if(!!rowData) {
              let params:any = {
                key:undefined,
                product:rowData.cfdProductCode,
                basicRate:undefined
              };

              dialogService.addDialog(AlertModifyDialogComponent,{params:params}).subscribe(
                (val) => {
                  if(val) {
                    self.panelMng.fireChannelEvent('alertAddModify', {});
                  }
                });
            }
          }

          return;
        }
        //
        else {
          param = {
            buySellType: null,
            productCode: null,
            productName: null,
            channel: 'rate'
          };

          if(!!rowData) {
            param.buySellType=item && item.buySellType ? item.buySellType : rowData.buySellType;
            param.productCode=rowData.cfdProductCode;
            param.productName=this.resProduct.result.productList.filter(el => el.cfdProductCode == rowData.cfdProductCode)[0].meigaraSeiKanji;
          }
        }
      } else {
        param = {productCode:rowData.cfdProductCode}
      }

      // 外出した画面から呼び出される画面は外だして表示。
      if(param.layout == null){
        param.layout = {};
      }
      param.layout.external = this.isExternalWindow();

      //if(item.scrId){
      this.panelMng.findPanel(scrId).subscribe(pnls=>{
        let find = false;
        let uniqueSave:string;
        if(scrId == '03030101' || scrId == '03030102' || scrId == '03030103') { // 企業情報, ファンド情報だけチェックするように
          pnls.forEach(pnl => {
            if (pnl.param && (pnl.param.productCode == rowData.cfdProductCode || pnl.param.layout.productCode == rowData.cfdProductCode)) {
              find = true;
              uniqueSave = pnl.uniqueId;
            }
          });
        }

        if (find) {
          // #3512 minimizeされていた場合も強制的にフォーカスする
          if (param.layout.external) {
            this.panelMng.panelFocus(uniqueSave, null, true);
          } else {
            const info = this.panelMng.getPanel(uniqueSave);
            this.panelMng.winRestore(info, uniqueSave);
          }

          if(scrId == '03030101'){
            this.panelMng.fireChannelEvent('priceAdjustList', param);
          }else if(scrId == '03030102'){
            this.panelMng.fireChannelEvent('currencyList', param);
          }else{
            this.panelMng.fireChannelEvent('fundPriceList', param);
          }
        } else {
          if(scrId == '03020104') { // スピード注文
            let disposable ;
            if (this.resource.confirmHideSpeedOrderAgreement == false) {
              if(this.resource.environment.demoTrade){
                disposable = this.dialogService.addDialog(SpeedOrderConfirmComponent, { params: param });
              }else{
                disposable = this.dialogService.addDialog(SpeedOrderConfirmComponent, { params: param });
              }
            } else {
              this.panelMng.openPanel( this.panelMng.virtualScreen(), scrId, param);
            }
          }
          else
            this.panelMng.openPanel( this.panelMng.virtualScreen(), scrId, param);
        }
      });
      //}else{

      //}



    }
    catch(e) {
      console.error(e);
    }
  }

  /**
   * 外だしウィンドウなのかチェックする。
   */
  isExternalWindow(){
    var win = window as any;
    var param = win.electron?win.electron.parameter?win.electron.parameter:null:null;

    return param?param.panelId?true:false:false;
  }

  numLength(number){
    if ((number = Math.floor(number)) == 0) {
      return 1;
    }
    return Math.floor(Math.log10(number > 0 ? number : -number)) + 1;
  }

  // 評価損益
  calcProfit(cPrice:number,qPrice:number,askbid:number,cCnt:number,tUnit:number,convbid:number,interBal:number,dividBal:number, boUnit:number):number{
    // value = 売買区分が「売」の場合→-1, 売買区分が「買」の場合→1
    let decPCnt = StringUtil.getDecimalPCnt(Math.min(tUnit, boUnit));
    let result1: number = Number((Number(cPrice)-Number(qPrice)).toFixed(decPCnt));
    result1 = (result1 * Number(askbid) * Number(cCnt) * Number(tUnit) * Math.pow(10, decPCnt)) / Math.pow(10, decPCnt); //（現在値 - 建値） × value × 現在数量 × 取引単位
    let result2:number = parseInt((result1 * Number(convbid)).toString()); // result1 × コンバージョンレート.BID
    let profit:number = Number(result2) + Number(interBal) + Number(dividBal); // result2 + 金利調整額 + 配当金残高(nullの場合は0扱い)
    // let result1:number = Math.floor((Number(cPrice)-Number(qPrice)) * Number(askbid) * Number(cCnt) * Number(tUnit)); //（現在値 - 建値） × value × 現在数量 × 取引単位
    // let result2:number = Math.floor(Number(result1) * Number(convbid)); // result1 × コンバージョンレート.BID
    // let profit:number = Number(result2) + Number(interBal) + Number(dividBal); // result2 + 金利調整額 + 配当金残高(nullの場合は0扱い)
    return profit
  }

  calcGridData(cfdProductCode){
    let resProduct = this.resProduct.result.productList.filter(el => el.cfdProductCode == cfdProductCode)[0];
    let resPrice = this.resPrice.result.priceList.filter(el => el.cfdProductCode == cfdProductCode)[0];
    let resConvRate = this.resConvRate.result.conversionRateList.filter(el => el.currency == resProduct.currency)[0];

    let resPositionList = [];
    if(this.resPosition) {
      resPositionList = this.resPosition.result.positionList.filter(el => el.cfdProductCode == cfdProductCode);
    }

    let resInterestRateBuySell: any;
    let resPriceAdjustment    : any;
    let resProductDetail      : any;
    let resTradeTimeRange     : any;

    if(this.resProductDetail) {
      resInterestRateBuySell = this.resProductDetail.result.interestRateBuySellList.filter(el => el.cfdProductCode == cfdProductCode)[0];
      resPriceAdjustment = this.resProductDetail.result.priceAdjustmentList.filter(el => el.cfdProductCode == cfdProductCode)[0];
      resProductDetail = this.resProductDetail.result.productDetailList.filter(el => el.cfdProductCode == cfdProductCode)[0];
      resTradeTimeRange = this.resProductDetail.result.tradeTimeRangeList.filter(el => el.cfdProductCode == cfdProductCode)[0];
    }

    let isWatchList:boolean = this.watchList.indexOf(cfdProductCode) > -1 ? true : false;
    let productName:string = resProduct.meigaraSeiKanji;
    let bid:number = Number(resPrice.bid);
    let ask:number = Number(resPrice.ask);
    let preBid:number = resPrice.preBid ? Number(resPrice.preBid) : undefined;
    let preAsk:number = resPrice.preAsk ? Number(resPrice.preAsk) : undefined;
    let bidChange:number = preBid ? bid-preBid : Number(resPrice.bidChange);
    let askChange:number = preAsk ? ask-preAsk : Number(resPrice.askChange);
    bidChange = bidChange == 0 ? resPrice.preBidChange : bidChange;
    askChange = askChange == 0 ? resPrice.preAskChange : askChange;
    let arrowBidCls:string[] = [];
    let arrowAskCls:string[] = [];

    if(!this.initArrow[cfdProductCode]){
        arrowBidCls[cfdProductCode] = bidChange > 0 ? 'up' : 'down';
        arrowAskCls[cfdProductCode] = askChange > 0 ? 'up' : 'down';
        this.initArrow[cfdProductCode] = 1;
    }
    else {
      arrowBidCls[cfdProductCode] = this.arrowBidCls[cfdProductCode];
      arrowAskCls[cfdProductCode] = this.arrowAskCls[cfdProductCode];
    }

    if(!this.arrowBidCls[cfdProductCode])
      this.arrowBidCls[cfdProductCode] = arrowBidCls[cfdProductCode];
    if(!this.arrowAskCls[cfdProductCode])
      this.arrowAskCls[cfdProductCode] = arrowAskCls[cfdProductCode];      

    let validFlag:string = resPrice.validFlag;
    let sp:number = ask - bid;
    let boUnit:number = resProduct.boUnit;
    let change:number = Number(resPrice.change);
    let changeBig = new BigDecimal(change.toString());
    let bidBig = new BigDecimal(bid.toString());
    let changeRateBig = changeBig.divide(bidBig.subtract(changeBig), 4, BigDecimal.ROUND_DOWN).multiply(new BigDecimal("100"));
    changeRateBig.setScale(2, BigDecimal.ROUND_DOWN);
    let changeRate: number = Number(changeRateBig.toString());
    let open:number = Number(resPrice.open);
    let low:number = Number(resPrice.low);
    let high:number = Number(resPrice.high);
    let close:number = bid - change;
    let currQtyBuy:number = 0;
    let currQtySell:number = 0;
    resPositionList.map((el) => {
      if(el.buySellType == '1') currQtySell += el.currentQuantity;
      else if(el.buySellType == '2') currQtyBuy += el.currentQuantity;
    });
    let volatility:number = resProduct.volatility; // ボラティリティ
    let interRateBaseDate:string = resInterestRateBuySell ? resInterestRateBuySell.businessDate : undefined; // 基準日付 - title
    let interRateSell:number = resInterestRateBuySell ? resInterestRateBuySell.sellInterestAjustValueYen : undefined; // 金利調整額（売）
    let interRateBuy:number = resInterestRateBuySell ? resInterestRateBuySell.buyInterestAjustValueYen : undefined;// 金利調整額（買）
    let interRateDays:number = resInterestRateBuySell ? resInterestRateBuySell.grantDays : undefined; // 金利調整額（付与日数）
    let accountType:string = resProduct.accountType; // 口座区分
    let currency:string = resProduct.currency; // 通貨
    let convFloatPos:string = resConvRate.floatingpos; // 有効小数桁数
    let convCreateDate:string = resConvRate.createDatetime; // 更新日時
    let eachTradeTimeList:any[] = resProduct.eachTradeTimeList; // 取引時間
    let losscutRange:number = resProductDetail?resProductDetail.losscutRange : undefined; // ロスカット幅
    let losscutAlertRange:number = resProductDetail?resProductDetail.losscutAlertRange : undefined; // ﾛｽｶｯﾄｱﾗｰﾄ幅
    let priceAdjustmentDate:string = resPriceAdjustment ? resPriceAdjustment.priceAdjustmentDate : undefined; // 価格調整額（予定日）
    let tradeUnit:number = resProduct.tradeUnit; // 取引単位
    let leverageRatio:number = resProduct.leverageRatio; // レバレッジ
    let convBid:number = Number(resConvRate.bid);
    let tCnt = new BigDecimal('1'); // 建玉数量
    let tradeUnitBig = new BigDecimal(tradeUnit.toString());
    let convBidBig = new BigDecimal(convBid.toString());
    bidBig = new BigDecimal(bid.toString());
    let minAmountBig = bidBig.multiply(tCnt).multiply(tradeUnitBig).multiply(convBidBig);
    minAmountBig = minAmountBig.setScale(0, BigDecimal.ROUND_DOWN);
    let minAmount:number = Number(minAmountBig.toString()); // 最低約定金額
    let leverageRatioBig = new BigDecimal(leverageRatio.toString());
    let askBig = new BigDecimal(ask.toString());
    let pCnt = StringUtil.getDecimalPCnt(boUnit);
    let priceBig = bidBig.add(askBig).divide(new BigDecimal("2"), pCnt + 1, BigDecimal.ROUND_DOWN);
    let marginRequiredBig = priceBig.multiply(tCnt).multiply(tradeUnitBig).multiply(convBidBig).divide(leverageRatioBig, 0, BigDecimal.ROUND_DOWN);
    let marginRequired:number = Number(marginRequiredBig.toString()); // 必要証拠金

    let totProfit:number = 0;

    for (let position of resPositionList) {
      let buySellType:string = position.buySellType;
      let interestRateBalance:number = position.interestRateBalance;
      let currPrice:number = position.buySellType == '1' ? ask : bid;
      let quotPrice:number = position.quotationPrice;
      let currQuantity:number = position.currentQuantity;
      let dividenedBalance:number = position.dividenedBalance;
      let askbidType:number = position.buySellType=='1' ? -1 : 1;
      totProfit += this.calcProfit(currPrice, quotPrice, askbidType, currQuantity, tradeUnit, convBid, interestRateBalance, dividenedBalance, boUnit);
    }

    return {
      cfdProductCode : cfdProductCode,
      productName : productName,
      bid : bid,
      ask : ask,
      preBid : preBid,
      preAsk : preAsk,
      bidArrow : arrowBidCls[cfdProductCode],
      askArrow : arrowAskCls[cfdProductCode],
      sp : sp,
      change : change,
      changeRate : changeRate,
      open : open,
      high : high,
      low : low,
      boUnit : boUnit,
      validFlag : validFlag,
      close : close,
      currQtyBuy : currQtyBuy,
      currQtySell : currQtySell,
      convBid : convBid,
      tradeUnit : tradeUnit,
      leverageRatio : leverageRatio,
      profit : totProfit,
      minAmount : minAmount,
      marginRequired : marginRequired,
      volatility : volatility,
      interRateBaseDate : interRateBaseDate,
      interRateSell : interRateSell,
      interRateBuy : interRateBuy,
      interRateDays : interRateDays,
      accountType : accountType,
      currency : currency,
      convFloatPos : convFloatPos,
      convCreateDate : convCreateDate,
      eachTradeTimeList : eachTradeTimeList,
      losscutRange : losscutRange,
      losscutAlertRange : losscutAlertRange,
      priceAdjustmentDate : priceAdjustmentDate,
      isWatchList : isWatchList,
      isErrorPosition: this.isErrorPosition,

      chartTick : resPrice.chartTick, // #2461
    }
  }

  makeGridData(){
    this.gridData = [];
    for(var i=0;i<this.productList.length;i++){
      let cfdProductCode = this.productList[i];
      this.gridData.push(this.calcGridData(cfdProductCode));
    }
  }

  bindGridData(){
    this.grid.pqGrid( "option", "colModel" ).forEach(val=>{
      if(val.dataIndx == 'interRateBaseDate' && this.resProductDetail && this.resProductDetail.result.interestRateBuySellList.length != 0 ) {
        let businessData = this.resProductDetail.result.interestRateBuySellList[0].businessDate;
        if(businessData) {
          if(this._tabType == 1)
            val.title = '金利調整額 ('+moment(businessData,'YYYYMMDD').format('YYYY/MM/DD') + '予定)'
          else
            val.title = '金利調整額 ('+moment(businessData,'YYYYMMDD').format('YYYY/MM/DD') + '実施)'
        } else {
          val.title = '金利調整額 (-)'
        }
      }
    });

    if(this.gridData.length == 0){
      this.grid.pqGrid( "option", "strNoRows", this.MSG_WATCH_EMPTY);
    } else {
      this.grid.pqGrid( "option", "strNoRows", "");
    }

    this.grid.pqGrid( "option", "dataModel.data", this.gridData );
    this.grid.pqGrid( "refreshDataAndView" );
    this.grid.pqGrid( "loadComplete" );
  }

  requestData(){    // not used
    this.isErrorPosition = false;
    let watchList = this.business.getWatchList();
    let product = this.business.getProductList();
    let positionList = this.business.getPositionList({listdataGetType:'ALL', pageCnt:200});
    let conversionRate = this.business.getConversionRate();
    let classifiedProducts = this.business.getClassifiedProducts();

    Observable.zip(watchList, classifiedProducts, product, positionList, conversionRate).subscribe(
      val => {
        this.resWatch = val[0];
        this.resClassifiedProducts = val[1];
        this.resProduct = val[2];
        this.resPosition = val[3];
        this.resConvRate = val[4];
        switch(this.resWatch.status){
          case ERROR_CODE.NG:
          MessageBox.info({title:'ウォッチリスト取得エラー', message:(Messages.ERR_0006 + '[CFDS2101T]')});
          this.emitLoad(true);
          return;
        }

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

        switch(this.resConvRate.status){
          case ERROR_CODE.NG:
            MessageBox.info({title:'コンバージョンレート取得エラー', message:(Messages.ERR_0001 + '[CFDS0401T]')});
            this.business.logout();
            return;
        }
        this.requestPriceData();
      },
      err => {
        this.emitLoad(true);
      }
    )
  }

  requestPriceData(){ // not used
    this.gridData = [];

    if(this._tabType == 0){
      this.watchList = this.resWatch.result.watchList;
      this.productList = this.resWatch.result.watchList;
    } else {
      // this.resClassifiedProducts.result[ # ].productList; -> 0:指数商品, 1:米国株, 2:中国株, 3:ETF
      let list = this.resClassifiedProducts.result[Number(this._tabType)-1].productList.sort((obj1, obj2) => {
        return parseInt(obj1.displayOrder) - parseInt(obj2.displayOrder);
      });
      this.watchList = this.resWatch.result.watchList;
      this.productList = list.map(el=>el.cfdProductCode);
    }

    if(this.productList.length !=0){
      let input = { productCodes: this.productList }
      let price = this.business.getPriceList(input);
      let productDetail = this.business.getProductDetail(input);

      Observable.zip(price, productDetail).subscribe(
        val => {
          // for(let result of val){
          //   if(result.status != ERROR_CODE.OK){
          //     MessageBox.error({ message:result.message });
          //     this.emitLoad(true);
          //     return;
          //   }
          // }

          // console.log(this.panelMng.getCurPanels(),this._tabType);

          this.resPrice = val[0];
          this.resProductDetail = val[1];

          if(this.resProductDetail.status == ERROR_CODE.WARN) { // NG or WARN
            MessageBox.info({title:'銘柄詳細取得エラー', message:Messages.ERR_0006});
            this.emitLoad(true);
            return;
          }
          else if(this.resProductDetail.status == ERROR_CODE.NG) {
            MessageBox.info({title:'銘柄詳細取得エラー', message:(Messages.ERR_0006 + '[CFDS1401T]')});
            this.emitLoad(true);
            return;
          }

          this.makeGridData();
          this.bindGridData();
          this.emitPage();
          this.emitLoad(true);
          this.requestRealData();

          this.requestChartTickData(); // #2461
        },
        err => {
          switch(err.status){
            case ERROR_CODE.NETWORK:
            // 再接続失敗処理
            MessageBox.info({title:'銘柄詳細取得エラー', message:(Messages.ERR_0002 + '[CFDS1402C]')});
            break;
            case ERROR_CODE.HTTP:
            // http status error 処理
            break;
          }
        }
      );
    } else {
      this.bindGridData();
      this.emitPage();
      this.emitLoad(true);
    }
  }

  // #2461
  requestChartTickData = () => {
    let self = this;
    for(let ii = 0; ii < self.pageCodeList.length; ii++){
      try {
        let cfdProductCode:string = self.pageCodeList[ii];
        let ohlcInputParam:any = {
          cfdProductCode: cfdProductCode,
          count:10
        };
        let tick = self.business.chartTick(ohlcInputParam).subscribe(
          (val) => {
            self.resPrice.result.priceList.forEach((resPrice) => {
              if(resPrice.cfdProductCode == cfdProductCode) {
                let productInfo:IProductInfo = self.business.symbols.getSymbolInfo(cfdProductCode);
                let pointValue:number = GetDecimalPointValueFromBoUnit(productInfo.boUnit);
                let stPrices = [];

                let rawDataLen:number = val.length;
                let rawData:any[] = val;
                if(rawDataLen > TICK_COUNT_LIMIT) {
                  rawData = val.slice(rawDataLen - TICK_COUNT_LIMIT, rawDataLen);
                }

                for(var jj = 0; jj < rawData.length; jj++) {
                  let tickData:IResChartTick = val[jj];
                  let tickPrice:number = CalcPrice(tickData.tickPrice, pointValue);
                  let stPrice = {
                    close : tickPrice
                  };
                  stPrices.push(stPrice);
                }

                resPrice.chartTick = stPrices;

                self.updateRowDataAt(TICK_COLUMN_DATAINDEX, cfdProductCode, stPrices);

                return;
              }
            });
        })
      }
      catch(e) {
        console.error(e);
      }
    }
  }

  updateRowDataAt = (dataIndex:string, cfdProductCode:string, stPrices?:any[]) => {
    try{
      let gridData = this.grid.pqGrid('option','dataModel.data');
      for(var ii=gridData.length;ii--;){
        let row = gridData[ii];
        if(cfdProductCode == row.cfdProductCode){
          row = $.extend(row,this.calcGridData(cfdProductCode));
          //
          let $cell = this.grid.pqGrid( "getCell", { rowIndx:row.pq_ri, dataIndx:dataIndex } );

          RenderTickChartAt(this, $cell, row.chartTick, ii);

          break;
        }
      }
    } catch (err){
      console.log(err);
    }
  }
  // [end] #2461

  requestRealData(){
    if(this.subscribeTick.length) {
      this.unsubscribe();
    }
    // console.log(this.pageCodeList);
    for(let i=0; i<this.pageCodeList.length; i++){
      let tick = this.business.symbols.tick(this.pageCodeList[i]).subscribe(val=>{
        this.resPrice.result.priceList.forEach((resPrice) => {
          if(resPrice.cfdProductCode == val.cfdProductCode){
            resPrice.preBid = resPrice.bid;
            resPrice.preAsk = resPrice.ask;
            resPrice.preBidChange = resPrice.bidChange;
            resPrice.preAskChange = resPrice.askChange;
            resPrice.bidChange = Number(val.bid) - resPrice.preBid;
            resPrice.askChange = Number(val.ask) - resPrice.preAsk;

            // #2461
            if(resPrice.chartTick) {
              let cfdProductCode:string = resPrice.cfdProductCode;
              let tickCount:number = resPrice.chartTick.length;
              if(tickCount !== undefined && tickCount != null) {
                let productInfo:IProductInfo = this.business.symbols.getSymbolInfo(cfdProductCode);
                let pointValue:number = GetDecimalPointValueFromBoUnit(productInfo.boUnit);
                let tickPrice:number = CalcPrice(val.bid, pointValue);
                let bAdd:boolean = false;
                if(tickCount > 0) {
                  let lastData:any = resPrice.chartTick[tickCount - 1];

                  if(lastData.close != tickPrice) {
                    bAdd = true;
                  }
                }
                else {
                  bAdd = true;
                }

                if(bAdd) {
                  let stPrice = {
                    close : tickPrice
                  };

                  resPrice.chartTick.push(stPrice);

                  tickCount = resPrice.chartTick.length;
                  if(tickCount > TICK_COUNT_LIMIT) {
                    resPrice.chartTick = resPrice.chartTick.slice(tickCount - TICK_COUNT_LIMIT, tickCount);
                  }

                  this.updateRowDataAt(TICK_COLUMN_DATAINDEX, cfdProductCode);
                }
              }
            }
            // [end] #2461

            resPrice = $.extend(resPrice, val);
          }
        });
        this.updateRowData(val.cfdProductCode);
      })

      this.subscribeTick.push( tick );
    }
    // console.log("subscribe -> " + this.subscribeTick.length);
  }

  updateRowData(cfdProductCode){
    try{
      let gridData = this.grid.pqGrid('option','dataModel.data');
      for(var i=gridData.length;i--;){
        let row = gridData[i];
        if(cfdProductCode == row.cfdProductCode){
          row = $.extend(row,this.calcGridData(cfdProductCode));
          //this.grid.pqGrid( "refreshRow", { rowIndx:row.pq_ri } );
          this.grid.pqGrid( "refreshCell", { rowIndx:row.pq_ri, dataIndx:'bid', skip:true } );
          this.grid.pqGrid( "refreshCell", { rowIndx:row.pq_ri, dataIndx:'ask', skip:true } );
          this.grid.pqGrid( "refreshCell", { rowIndx:row.pq_ri, dataIndx:'high', skip:true } );
          this.grid.pqGrid( "refreshCell", { rowIndx:row.pq_ri, dataIndx:'profit', skip:true } );
          this.grid.pqGrid( "refreshCell", { rowIndx:row.pq_ri, dataIndx:'change', skip:true } );
          this.grid.pqGrid( "refreshCell", { rowIndx:row.pq_ri, dataIndx:'minAmount', skip:true } );

          this.grid.pqGrid( "refreshCell", { rowIndx:row.pq_ri, dataIndx:'convBid', skip: true } ); // #3296
          break;
        }
      }
    } catch (err){
      console.log(err);
    }
  }

  delWatchList(cfdProductCode:string){
    let input = { cfdProductCode: cfdProductCode }
    this.business.delWatchList(input).subscribe(
      val=>{
        switch(val.status){
          case ERROR_CODE.OK:
          this.unsubscribe();
          this.resWatch = val;
          // this.requestPriceData();
          this.requestData_02(this.currentPage);
          break;
          case ERROR_CODE.WARN:
          MessageBox.info({title:'ウォッチリスト削除エラー', message:'不正な操作です。'},
          ()=>{
            this.unsubscribe();
            // this.requestData();
            this.requestData_01();
          });
          break;
          case ERROR_CODE.NG:
          MessageBox.info({title:'ウォッチリスト削除エラー', message:'ウォッチリストから削除できませんでした。[CFDS2301T]'},
          ()=>{
            this.unsubscribe();
            // this.requestData();
            this.requestData_01();
          });
          break;
        }
      },
      err=>{
        switch(err.status){
          case ERROR_CODE.NETWORK:
          case ERROR_CODE.HTTP:
          MessageBox.info({title:'ウォッチリスト削除エラー', message:'インターネットに接続されていない、または接続先のサーバーに問題が発生しているため、接続できませんでした。[CFDS2302C]'},
          ()=>{
            this.unsubscribe();
            // this.requestData();
            this.requestData_01();
          });
          break;
        }
      }
    );
  }

  addWatchList(cfdProductCode:string){
    let input = { cfdProductCode: cfdProductCode }
    this.business.addWatchList(input).subscribe(
      val=>{
        switch(val.status){
          case ERROR_CODE.OK:
          this.unsubscribe();
          this.resWatch = val;
          // this.requestPriceData();
          // console.log("addWatchList " + this.currentPage);
          this.requestData_02(this.currentPage);
          break;
          case ERROR_CODE.WARN:
          MessageBox.info({title:'ウォッチリスト追加エラー',message:'不正な操作です。'},
          ()=>{
            this.unsubscribe();
            // this.requestData();
            this.requestData_01();
          });
          break;
          case ERROR_CODE.NG:
          MessageBox.info({title:'ウォッチリスト追加エラー', message:'ウォッチリストに追加できませんでした。[CFDS2201T]'},
          ()=>{
            this.unsubscribe();
            // this.requestData();
            this.requestData_01();
          });
          break;
        }
      },
      err=>{
        switch(err.status){
          case ERROR_CODE.NETWORK:
          case ERROR_CODE.HTTP:
          MessageBox.info({title:'ウォッチリスト追加エラー', message:'インターネットに接続されていない、または接続先のサーバーに問題が発生しているため、接続できませんでした。[CFDS2202C]'},
          ()=>{
            this.unsubscribe();
            // this.requestData();
            this.requestData_01();
          });
          break;
        }
      }
    );
  }

  unsubscribe(){
    if(this.zipSubs)
      this.zipSubs.unsubscribe();
    if(this.priceSubs)
      this.priceSubs.unsubscribe();
    if(this.otherSubs)
      this.otherSubs.unsubscribe();

    this.subscribeTick.forEach(ob => ob.unsubscribe());
    this.subscribeTick = [];
  }

  setPage(currpage:number){
    this.grid.pqGrid('option','pageModel.curPage',currpage);
    this.grid.pqGrid('refreshView');
    this.grid.pqGrid('scrollRow', { rowIndxPage: 0 });
    this.seletedIndex = null;
    this.currentPage = currpage;
    this.getPageCodes(currpage);
    this.requestData_03();
    // this.requestData_02(currpage);
  }

  emitPage(){
    let totalPage:number = 1;
    let currentPage:number = 1;
    // console.log("emitPage" + '->' + this.currentPage);
    if (this.productList.length) {
      totalPage = this.grid.pqGrid('option','pageModel.totalPages');
      currentPage = this.grid.pqGrid('option','pageModel.curPage');
      totalPage = totalPage==0 ? 1 : totalPage;      
    }
    this.currentPage = currentPage;

    this.emitter.emit({
      type:'page',
      pageInfo:{
        currentPage: currentPage,
        totalPage: totalPage
      }
    });

  }

  emitLoad(loaded:boolean){
    this.emitter.emit({
      type:'loading',
      loaded:loaded
    });
  }

  resize(params) {
    this.grid.pqGrid('option','height',this.getGridHeight())
    this.grid.pqGrid('refreshDataAndView');
    this.grid.pqGrid( "loadComplete" );
  }

  getGridHeight(){
    return $(this.element.nativeElement).parents('.panel').outerHeight() - $(this.element.nativeElement).parents('.panel').find('.nav').outerHeight() - 2;
  }

  notification(){
    // event
    this.notifySubscribe.push( this.business.notifyer.event().subscribe(val => {
      switch (val[1].eventType) {
        case commonApp.NoticeType.SPEED_EXECUTION:
        case commonApp.NoticeType.EXECUTION:
          // ポジション情報更新
          this.updatePosition();
        break;
      }
    }));

    // conversionRate
    this.notifySubscribe.push( this.business.notifyer.conversionRate().subscribe(val=>{
      if(val && val.conversionRateList && this.resConvRate && this.resConvRate.result.conversionRateList){
        val.conversionRateList.forEach(item=>{
          let rate = this.resConvRate.result.conversionRateList.find(el => el.currency == item.currency);
          // copy data
          Object.keys(rate).forEach(key=>{
            rate[key] = item[key];
          })
        });

        this.makeGridData();
        this.bindGridData();
        this.updateView();
      }
    }));

    // forceReload
    this.notifySubscribe.push( this.business.notifyer.forceReload().subscribe(val=>{
      if(val == ForceReload.EOD || val == ForceReload.price){
        this.unsubscribe();
        // this.requestPriceData();
        this.requestData_02(this.currentPage);
      }
    }));

    // eodの場合再照会
    this.notifySubscribe.push( this.business.notifyer.EOD().subscribe(val=>{
      // console.log("EOD 再照会");
      this.unsubscribe();
      // this.requestData();
      this.requestData_01();
    }));
  }

  private makeRowDragable(){
    if (this.grid) {
      let rows = this.grid.pqGrid( "pageData" );
      rows.forEach(row => {
        let rowIndx = this.grid.pqGrid( "getRowIndx", { rowData : row } );
        let $tr = this.grid.pqGrid( "getRow", {rowIndx: rowIndx.rowIndx} );
        $tr.attr('draggable', 'true');
      });
    }
  }

  @HostListener('dragstart', ['$event'])
  ondragstart(e:any){
    // 行をdargをスタートする時のrowIndexを取得する。
    this.dragIdx = Number($(e.target).attr('pq-row-indx'));
    e.stopPropagation();
  }

  ondrop(e:any){
    if (this.dragIdx != null && !isNaN(this.dragIdx)) {
      let rowIdx:number = null;
      if ($(e.mouseEvent.target).is("td")) {
        rowIdx = Number($(e.mouseEvent.target).parent().attr('pq-row-indx'));
      } else if ($(e.mouseEvent.target).is("span")) {
        rowIdx = Number($(e.mouseEvent.target).parent().parent().attr('pq-row-indx'));
      }
      if (!isNaN(rowIdx) && rowIdx != this.dragIdx && rowIdx != null) {
        let rowData = this.grid.pqGrid( "getRowData", {rowIndxPage: this.dragIdx} );
        this.grid.pqGrid( "deleteRow", { rowIndxPage: this.dragIdx } );
        this.grid.pqGrid( "addRow",{ newRow: rowData, rowIndxPage: rowIdx });
        this.resWatch.result.watchList.length = 0;
        let rows = this.grid.pqGrid( "option" , "dataModel.data" );
        rows.forEach(row => {
          this.resWatch.result.watchList.push(row.cfdProductCode);
        });
        this.putWatchList();
      }
      e.mouseEvent.preventDefault();
      e.mouseEvent.stopPropagation();
    }
  }

  @HostListener('dragend', ['$event'])
  ondragend(e:any){
    this.dragIdx = null;
  }

  private putWatchList(){
    let input = { productCodes: this.resWatch.result.watchList }
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

  private updatePosition() {
    let input = {listdataGetType:'ALL', pageCnt:200};
    this.business.getPositionList(input).subscribe(val=>{
      if(val.status =="0"){
        this.resPosition = val;
        this.makeGridData();
        this.bindGridData();
        this.updateView();
      }
    });
  }

  private saveLayout() {
    let colOption = [];
    for(let col of this.grid.pqGrid('option','colModel')){
        colOption.push({
            dataIndx : col.dataIndx,
            width : col.width
        });
    }
    this.emitter.emit({type:'layout',layout:colOption});
  }

  private isPriceFlashingOn():boolean {
    let configDisplay: IConfigDisplaySettings = this.resource.config_display();
    return configDisplay.priceFlashing == 'on';
  }

  private requestData_01(){   // 共通
    this.isErrorPosition = false;
    let watchList = this.business.getWatchList();
    let product = this.business.getProductList();
    let conversionRate = this.business.getConversionRate();
    let classifiedProducts = this.business.getClassifiedProducts();

    this.zipSubs = Observable.zip(watchList, classifiedProducts, product, conversionRate).subscribe(
      val => {
        this.resWatch = val[0];
        this.resClassifiedProducts = val[1];
        this.resProduct = val[2];
        this.resConvRate = val[3];
        switch(this.resWatch.status){
          case ERROR_CODE.NG:
          MessageBox.info({title:'ウォッチリスト取得エラー', message:(Messages.ERR_0006 + '[CFDS2101T]')});
          this.emitLoad(true);
          return;
        }

        switch(this.resConvRate.status){
          case ERROR_CODE.NG:
            MessageBox.info({title:'コンバージョンレート取得エラー', message:(Messages.ERR_0001 + '[CFDS0401T]')});
            this.business.logout();
            return;
        }
        // console.log("requestData_01 " + this.currentPage);
        this.requestData_02(this.currentPage);
      },
      err => {
        this.emitLoad(true);
      }
    )
  }

  private requestData_02(page: number) {
    this.gridData = [];
    if(this._tabType == 0){
      this.watchList = this.resWatch.result.watchList;
      this.productList = this.resWatch.result.watchList;
    } else {
      // this.resClassifiedProducts.result[ # ].productList; -> 0:指数商品, 1:米国株, 2:中国株, 3:ETF
      let list = this.resClassifiedProducts.result[Number(this._tabType)-1].productList.sort((obj1, obj2) => {
        return parseInt(obj1.displayOrder) - parseInt(obj2.displayOrder);
      });
      this.watchList = this.resWatch.result.watchList;
      this.productList = list.map(el=>el.cfdProductCode);
    }

    this.getPageCodes(page);

    if(this.productList.length !=0){
      let input = { productCodes: this.productList }
      this.priceSubs = this.business.getPriceList(input).subscribe(
        val => {
          this.resPrice = val;
          if(this.resPrice.status == ERROR_CODE.OK) { 
            this.requestData_03();
          }

          this.makeGridData();
          this.bindGridData();
          this.emitPage();
          this.emitLoad(true);
          // 削除予定
          //////////////////////////////////////////////////////////////////
          // this.requestRealData();
          // this.requestChartTickData(); // #2461
          //////////////////////////////////////////////////////////////////
        },
        err => {
          switch(err.status){
            case ERROR_CODE.NETWORK:
            // 再接続失敗処理
            MessageBox.info({title:'銘柄詳細取得エラー', message:(Messages.ERR_0002 + '[CFDS1402C]')});
            break;
            case ERROR_CODE.HTTP:
            // http status error 処理
            break;
          }
        }        
      );
    } else {
      this.bindGridData();
      this.emitPage();
      this.emitLoad(true);
    } 
  }

  private requestData_03() {
    let input = { productCodes: this.pageCodeList }
    let positionList = this.business.getPositionList({listdataGetType:'ALL', pageCnt:200});
    let productDetail = this.business.getProductDetail(input);

    if(this.pageCodeList.length == 0) {
      this.unsubscribe();
      return;
    }
   
    this.otherSubs = Observable.zip(positionList, productDetail).subscribe(
      val => {
        if(!this.checkProductDetail(this.pageCodeList, val[1].result.productDetailList)) {
          return;
        }

        this.resPosition = val[0];
        this.resProductDetail = val[1];

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

        if(this.resProductDetail.status == ERROR_CODE.WARN) { // NG or WARN
          MessageBox.info({title:'銘柄詳細取得エラー', message:Messages.ERR_0006});
          // this.emitLoad(true);
          return;
        }
        else if(this.resProductDetail.status == ERROR_CODE.NG) {
          MessageBox.info({title:'銘柄詳細取得エラー', message:(Messages.ERR_0006 + '[CFDS1401T]')});
          // this.emitLoad(true);
          return;
        }

        this.makeGridData();
        this.bindGridData();
        this.updateView();
        // this.emitPage();
        // this.emitLoad(true);
        this.requestRealData();
        this.requestChartTickData(); // #2461
      },
      err => {
        switch(err.status){
          case ERROR_CODE.NETWORK:
          // 再接続失敗処理
          MessageBox.info({title:'銘柄詳細取得エラー', message:(Messages.ERR_0002 + '[CFDS1402C]')});
          break;
          case ERROR_CODE.HTTP:
          // http status error 処理
          break;
        }
      }
    );    
  }

  private getPageCodes(page: number) {
    // console.log(page);
    let startIdx = CommonConst.PAGE_PER_UNIT * (page - 1);
    this.pageCodeList = [];

    for(let ii = 0; ii < CommonConst.PAGE_PER_UNIT; ii++) {
      if(!this.productList[startIdx + ii]) {
        break;
      }
      this.pageCodeList.push(this.productList[startIdx + ii]);
    }

    if(this.pageCodeList.length == 0) {
      if(this.currentPage == 1) {
      }
      else {
        --this.currentPage;
        startIdx = CommonConst.PAGE_PER_UNIT * (this.currentPage - 1);
        for(let ii = 0; ii < CommonConst.PAGE_PER_UNIT; ii++) {
          if(!this.productList[startIdx + ii]) {
            break;
          }
          this.pageCodeList.push(this.productList[startIdx + ii]);        
        }
      }
    }
    // console.log(this.pageCodeList);
  }

  private checkProductDetail(pageList: any, dataList:any) : boolean {
    if(pageList.length != dataList.length) {
      // console.log("*********************Invalid data**************");
      // console.log(pageList);
      // console.log(dataList);
      return false;
    }

    for(let ii = 0; ii < pageList.length; ii++) {
      if(pageList[ii] != dataList[ii].cfdProductCode) {
        // console.log("*********************Invalid data**************");
        // console.log(pageList);
        // console.log(dataList);
        return false;
      }
    }
    return true;
  }


}
