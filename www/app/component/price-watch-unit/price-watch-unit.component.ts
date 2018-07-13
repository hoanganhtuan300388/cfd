/**
 *
 * レート一覧：WatchList詳細
 *
 */
import { Component, OnInit, ElementRef, ChangeDetectorRef, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { BusinessService, PanelViewBase, ComponentViewBase, PanelManageService, ResourceService, CommonConst, Tooltips, IViewState, IViewData, ViewBase, StringUtil, CommonUtil } from "../../core/common";
import { MessageBox } from '../../util/utils';
import { MiniChartComponent } from '../../ctrls/mini-chart/mini-chart.component';
import { ContextMenuService, ContextMenuComponent } from 'ngx-contextmenu';

// #2265
import { ILayoutInfo } from '../../values/Values';
import { DeepCopy } from '../../util/commonUtil';
//

// #2297
import { DialogService } from "ng2-bootstrap-modal";
import { AlertModifyDialogComponent } from '../../component/alert-modify-dialog/alert-modify-dialog.component';
//

import { AwakeContextMenu } from '../../util/commonUtil'; // #2338

// #2458
import { IIndicaterInfo, ConvertToIndicatorInfo, ConvertToIConfigChartTechnical, ChartCFDRequestInfo } from '../../core/chartCFDInterface';
import { ChartCfdMiniComponent } from '../../component/chart-cfd-mini/chart-cfd-mini.component';
import { Deferred } from "../../util/deferred";
import { ChartRequestInfo, ChartRequestData, ChartSymbolInfo } from '../../core/chartTypeInterface';
import * as ChartConst from '../../const/chartConst';
import * as ChartCFDConst from '../../const/chartCFDConst';
import { DetectChange } from '../../util/commonUtil';
import * as commonApp from '../../../../common/commonApp';
import { IConfigDisplaySettings } from "../../core/configinterface";
// #3374
import { SpeedOrderConfirmComponent } from '../../component/speed-order-confirm/speed-order-confirm.component';

export const DEFAULT_TIME_TYPE:string = ChartConst.TIME_TYPE_MINUTE;
export const DEFAULT_TIME_INTERVAL:string = '5';
//

declare var pq:any;
declare var _:any;
declare var BigDecimal:any;

//-----------------------------------------------------------------------------
// COMPONENT : PriceWatchUnitComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'price-watch-unit',
  templateUrl: './price-watch-unit.component.html',
  styleUrls: ['./price-watch-unit.component.scss']
})
export class PriceWatchUnitComponent extends ComponentViewBase{
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  @ViewChild('chart1') public chart1:MiniChartComponent;
  
  @ViewChild('miniChart') public miniChart:ChartCfdMiniComponent;
  @ViewChild('contextMenuComponent') public contextMenuComponent: ContextMenuComponent;
  public contextItems = [];
  public contextItemCorpInfo = { title : '企業情報', scrId: "03030102", enabled:true };
  public contextItemFundInfo = { title : 'ファンド情報', scrId: "03030103", enabled:true };
  public contextItemsDefault = [
    { title : 'スピード注文', scrId: "03020104", enabled:true, useLayout:true },
    { title : '新規注文（売）', scrId: CommonConst.PANEL_ID_NEW_ORDER, enabled:true, buySellType:CommonConst.SELL_TYPE_VAL, autoPrice:true, useLayout:true }, // #2410
    { title : '新規注文（買）', scrId: CommonConst.PANEL_ID_NEW_ORDER, enabled:true, buySellType:CommonConst.BUY_TYPE_VAL , autoPrice:true, useLayout:true }, // #2410
    { title : 'チャート', scrId: "03030600", enabled:true, useLayout:true, option: { initFoot:"2", linked:true } }, // #2265
    { title : 'アラート登録', scrId: "03010500", enabled:true, useAlert:true} // #2297
  ]

  @Input('watchData')     public watchData;
  @Output() watchEmitter = new EventEmitter<any>();

  public productName:string;
  public validFlag:string;
  public bid:string;
  public preBid:string;
  public bidArrow:string;
  public sp:string;
  public ask:string;
  public preAsk:string;
  public askArrow:string;
  public change:string;
  public changeRate:string;
  public open:string;
  public high:string;
  public low:string;
  public close:string;
  public currQtySell:string;
  public currQtyBuy:string;
  public profit:string = '0';

  public subscribeTick:any;

  public isWatchOn:boolean = true;

  public DEL_WATCHLIST:string = Tooltips.WATCH_DELETE;
  public ADD_WATCHLIST:string = Tooltips.WATCH_ADD;
  public TITLE_WATCH:string = this.DEL_WATCHLIST;
  public SPEED_ORDER:string = 'スピード注文表示';
  public btnAsk = null;
  public btnBid = null;

  private positionNotifySubscribe:any;
  private conversionRateNotifySubscribe:any;
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(public panelMng:PanelManageService,
              public resource:ResourceService,
              public element:ElementRef,
              public business:BusinessService,
              public changeRef:ChangeDetectorRef,
              public contextMenu:ContextMenuService,
              public dialogService:DialogService      // #2297
            ) {
    super(panelMng, element, changeRef);
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  ngAfterViewInit() { // #2591
    this.btnAsk = $(this.element.nativeElement).find(".button-order-ask");
    this.btnBid = $(this.element.nativeElement).find(".button-order-bid");
    this.makeData();
    // this.loadChart();
    this.updateView();

    // this.subscribePrice();

    // let self = this;
    // self.didProcForAfterViewInit();

    // this.positionNotifySubscribe = this.business.notifyer.event().subscribe(val => {
    //   // console.log(val);
    //   switch (val[1].eventType) {
    //     case commonApp.NoticeType.SPEED_EXECUTION:
    //     case commonApp.NoticeType.EXECUTION:
    //       // ポジション情報更新
    //       if(this.watchData.cfdProductCode == val[1].cfdProductCode)
    //         this.updatePosition();
    //     break;
    //   }
    // });

    // // conversionRate
    // this.conversionRateNotifySubscribe = this.business.notifyer.conversionRate().subscribe(val=>{
    //   if(val && val.conversionRateList ){
    //     // console.log(val);
    //     // console.log(this.watchData);
    //     for(let ii = 0; ii < val.conversionRateList.length; ii++) {
    //       if(val.conversionRateList[ii].currency == this.watchData.conversion.currency) {
    //         this.watchData.conversion.bid = val.conversionRateList[ii].bid
    //         this.watchData.conversion.floatingpos = val.conversionRateList[ii].floatingpos;
    //         break;
    //       }
    //     }
    //     // console.log(this.watchData);
    //     this.makeData();
    //     this.updateView();
    //   }
    // });
  }

  ngOnDestroy(){
    super.ngOnDestroy();
    if(this.positionNotifySubscribe)
      this.positionNotifySubscribe.unsubscribe();
    if(this.conversionRateNotifySubscribe)
      this.conversionRateNotifySubscribe.unsubscribe();
    this.unsubscribePrice();
  }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  public showContextMenu($event:MouseEvent, watchData){
    // 0:指数商品, 1:米国株, 2:中国株, 3:ETF
    this.contextItems = _.clone(this.contextItemsDefault);
    switch(watchData.category){
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
    this.updateView();
    this.contextMenu.show.next({
      contextMenu: this.contextMenuComponent,
      event: $event,
      item: watchData
    });
    $event.preventDefault();
    $event.stopPropagation();

    AwakeContextMenu($event, this.element.nativeElement); // #2338
  }

  onClickContextItem(ev_item: any, item:any){
    this.openPanel( item.scrId, item );
  }

  openPanel(scrId:string, item?:any){
    // #2265
    let self = this;
    try {
      let param:any;

      if(!!item) {
        if(item.useLayout === true) {
          param = {};
          let layout:ILayoutInfo = {} as ILayoutInfo;
          layout.productCode = self.watchData.cfdProductCode;
          if(item.option) {
            layout.option = DeepCopy(item.option);
          }

          if(!layout.option) {
            layout.option = {};
          }

          layout.option.buySellType = item.buySellType;
          layout.option.productName = self.watchData.product.meigaraSeiKanji,
          layout.option.channel = "rate";

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

          param.layout = layout;
        }
        // #2297
        else if(item.useAlert === true) {
          let dialogService:DialogService = self.dialogService;
          if(dialogService) {
            if(!!self.watchData) {
              let params:any = {
                key:undefined,
                product:self.watchData.cfdProductCode,
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
            buySellType: item ? item.buySellType : null,
            productCode: this.watchData.cfdProductCode,
            productName: this.watchData.product.meigaraSeiKanji,
            channel: 'rate'
          };
        }
      }
  
      // 外出した画面から呼び出される画面は外だして表示。
      if(param.layout == null){
        param.layout = {};
      }
      param.layout.external = this.isExternalWindow(); 
      

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
      else if(scrId == '03030102' || scrId == '03030103') {  // 企業情報, ファンド情報は既にオープンしているかを確認
        this.panelMng.findPanel(scrId).subscribe(pnls=>{
          let find = false;
          let uniqueSave:string;
          pnls.forEach(pnl => {
            if (pnl.param && (pnl.param.productCode == this.watchData.cfdProductCode || pnl.param.layout.productCode == this.watchData.cfdProductCode)) {
              find = true;
              uniqueSave = pnl.uniqueId;
            }
          });
          if (find) {
            // #3512 minimizeされていた場合も強制的にフォーカスする
            if (param.layout.external) {
              this.panelMng.panelFocus(uniqueSave, null, true);
            } else {
              const info = this.panelMng.getPanel(uniqueSave);
              this.panelMng.winRestore(info, uniqueSave);
            }
  
            if(scrId == '03030102'){
              this.panelMng.fireChannelEvent('currencyList', param);
            }else{
              this.panelMng.fireChannelEvent('fundPriceList', param);
            }
          } 
          else {
            this.panelMng.openPanel( this.panelMng.virtualScreen(), scrId, param);
          }
        });
      }
      else {
        this.panelMng.openPanel( this.panelMng.virtualScreen(), scrId, param);
      }
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

  onClickChart($event) {
    // #2265
    let self = this;
    try {
      let layout:ILayoutInfo = {} as ILayoutInfo;
      layout.productCode = self.watchData.cfdProductCode;
      layout.external = this.isExternalWindow();
      layout.option = {
        initFoot:"2",
        linked:true,
        channel:'rate'
      };
      let params:any = {
        layout : layout
      };

      this.panelMng.openPanel( this.panelMng.virtualScreen(), '03030600', params);
    }
    catch(e) {
      console.error(e);
    }
  }

  onClickWatchBtn($event){
    let cfdProductCode = this.watchData.cfdProductCode;
    let $elm = $($event.target);

    if(!this.isWatchOn) return;

    if (this.resource.confirmHideDeleteWatch == false) {
      MessageBox.question({
        title:"ウォッチリストから削除",
        message:"ウォッチリストから削除してよろしいですか？",
        checkboxLabel:"今後、このメッセージを表示しない"
      },
      (response, checkboxChecked)=>{
        if(response==1) { //OK
          this.resource.confirmHideDeleteWatch = checkboxChecked;
          this.isWatchOn = false;
          this.TITLE_WATCH = this.ADD_WATCHLIST;
          this.delWatchList(cfdProductCode);
          this.updateView();
        }
      }
      );
    } else {
      this.isWatchOn = false;
      this.TITLE_WATCH = this.ADD_WATCHLIST;
      this.delWatchList(cfdProductCode);
      this.updateView();
    }
  }

  onClickSpeedOrder($event){
    this.openPanel('03020104',this.contextItemsDefault[0]);
  }

  // #2410
  onClickAskBtn($event){
    // 買注文（指値、価格）
    let self = this;
    let scrId:string = CommonConst.PANEL_ID_NEW_ORDER; // 新規注文
    let item:any = {
      enabled:true,
      buySellType:CommonConst.BUY_TYPE_VAL,
      useLayout:true,
      autoPrice:true,
    };
    self.openPanel(scrId, item);
  }

  onClickBidBtn($event){
    // 売注文（指値、価格）
    let self = this;
    let scrId:string = CommonConst.PANEL_ID_NEW_ORDER; // 新規注文
    let item:any = {
      enabled:true,
      buySellType:CommonConst.SELL_TYPE_VAL,
      useLayout:true,
      autoPrice:true,
    };
    self.openPanel(scrId, item);
  }

  unsubscribePrice(){
    if(this.subscribeTick != null){
      this.subscribeTick.unsubscribe();
      this.subscribeTick = null;
    }
  }

  subscribePrice(){
    let cfdProductCode = this.watchData.cfdProductCode;
    this.subscribeTick = this.business.symbols.tick(cfdProductCode).subscribe(val =>{
      if(this.watchData.price){
        this.watchData.price.preBid = this.watchData.price.bid;
        this.watchData.price.preAsk = this.watchData.price.ask;
        this.watchData.price.preBidChange = this.watchData.price.bidChange;
        this.watchData.price.preAskChange = this.watchData.price.askChange;
        this.watchData.price.bidChange = Number(val.bid) - this.watchData.price.preBid;
        this.watchData.price.askChange = Number(val.ask) - this.watchData.price.preAsk;
      }

      this.watchData.price = $.extend(this.watchData.price, val);

      if(val.validFlag != '0'){
        if(this.chart1) {
          this.chart1.AddData('bid', val.createDatetime, val.bid );
        }
      }

      this.makeData();
      this.updateView();
    })
  }

  public makeData(){
    let productCode = this.watchData.cfdProductCode;
    let cfdProductCode = this.watchData.cfdProductCode;
    let price = this.watchData.price;
    let product = this.watchData.product;
    let detail = this.watchData.detail;
    let conversion = this.watchData.conversion;
    let positionList = this.watchData.positionList;

    // product INFO
    let productName:string = product.meigaraSeiKanji;
    let boUnit:number = product.boUnit;
    let tradeUnit:number = product.tradeUnit; // 取引単位
    let leverageRatio:number = product.leverageRatio; // レバレッジ
    let boFormatComma = StringUtil.getBoUnitFormat(boUnit,true);
    let boFormat = StringUtil.getBoUnitFormat(boUnit,false);
    this.productName = productName;
    
    // require price data
    if(price) {
      let bid:number = Number(price.bid);
      let ask:number = Number(price.ask);
      let sp:number = ask - bid;
      let validFlag:string = price.validFlag;

      let preBid:number = price.preBid ? Number(price.preBid) : undefined;
      let preAsk:number = price.preAsk ? Number(price.preAsk) : undefined;
      let bidChange:number = preBid ? bid-preBid : Number(price.bidChange);
      let askChange:number = preAsk ? ask-preAsk : Number(price.askChange);
      bidChange = bidChange == 0 ? price.preBidChange : bidChange;
      askChange = askChange == 0 ? price.preAskChange : askChange;
      let bidArrow:string = this.bidArrow;
      let askArrow:string = this.askArrow;
      if(bidArrow == undefined) {
        if(price.bidChange == '-1'){
          bidArrow = 'down';
        }else if(price.bidChange == '1'){
          bidArrow = 'up';
        }        
      }
      if(askArrow == undefined) {
        if(price.askChange == '-1'){
          askArrow = 'down';
        }else if(price.askChange == '1'){
          askArrow = 'up';
        }
      }
      let change:number = Number(price.change);
      let changeBig = new BigDecimal(change.toString());
      let bidBig = new BigDecimal(bid.toString());
      let changeRateBig = changeBig.divide(bidBig.subtract(changeBig), 4, BigDecimal.ROUND_DOWN).multiply(new BigDecimal("100"));
      changeRateBig.setScale(2, BigDecimal.ROUND_DOWN);
      let changeRate:number = Number(changeRateBig.toString());
      let open:number = Number(price.open);
      let low:number = Number(price.low);
      let high:number = Number(price.high);
      let close:number = bid - change;

       // require position data
      let currQtyBuy:number = 0;
      let currQtySell:number = 0;
      let totProfit:number = 0;

      let configDisplay: IConfigDisplaySettings = this.resource.config_display();
      if(preAsk < ask){
        this.btnAsk.removeClass("button-up-blink");
        this.btnAsk.removeClass("button-down-blink");
        askArrow = 'up';
        if (this.isPriceFlashingOn(configDisplay)) {
          setTimeout(() => {
            this.btnAsk.addClass("button-up-blink");
          }, 0);
        }
      }else if(preAsk > ask){
        this.btnAsk.removeClass("button-up-blink");
        this.btnAsk.removeClass("button-down-blink");
        askArrow = 'down';
        if (this.isPriceFlashingOn(configDisplay)) {
          setTimeout(() => {
            this.btnAsk.addClass("button-down-blink");
          }, 0);
        }
      }

      if(preBid < bid){
        this.btnBid.removeClass("button-up-blink");
        this.btnBid.removeClass("button-down-blink");
        bidArrow = 'up';
        if (this.isPriceFlashingOn(configDisplay)) {
          setTimeout(() => {
            this.btnBid.addClass("button-up-blink");
          }, 0);
        }
      }else if(preBid > bid){
        bidArrow = 'down';
        this.btnBid.removeClass("button-up-blink");
        this.btnBid.removeClass("button-down-blink");
        if (this.isPriceFlashingOn(configDisplay)) {
          setTimeout(() => {
            this.btnBid.addClass("button-down-blink");
          }, 0);
        }
      }

      if(positionList){
        positionList.map((el) => {
          if(el.buySellType == '1') currQtySell += el.currentQuantity;
          else if(el.buySellType == '2') currQtyBuy += el.currentQuantity;
        });

        let convBid;
        let floatingpos;
        if (product.currency == 'JPY') {
          convBid = 1;
          floatingpos = 0;
        } else {
          convBid = Number(conversion.bid);
          floatingpos = Number(conversion.floatingpos);
        }

        for (let position of positionList) {
          let buySellType:string = position.buySellType;
          let interestRateBalance:number = position.interestRateBalance;
          let currPrice:number = position.buySellType == '1' ? ask : bid;
          let quotPrice:number = position.quotationPrice;
          let currQuantity:number = position.currentQuantity;
          let dividenedBalance:number = position.dividenedBalance;
          let askbidType:number = position.buySellType=='1' ? -1 : 1;
          totProfit += CommonUtil.calcProfit(currPrice, quotPrice, askbidType, currQuantity, tradeUnit, convBid, interestRateBalance, dividenedBalance, floatingpos);      
        }
      }

      this.validFlag = validFlag;
      this.bid = StringUtil.formatNumber(bid, boFormat);
      this.bidArrow = bidArrow;
      this.sp = StringUtil.formatNumber(sp, boFormat);
      this.ask = StringUtil.formatNumber(ask, boFormat);
      this.askArrow = askArrow;
      this.change = StringUtil.formatNumber(change, boFormat, true);
      this.changeRate = StringUtil.formatNumber(changeRate,'#.00', true);
      this.open = StringUtil.formatNumber(open, boFormat);
      this.high = StringUtil.formatNumber(high, boFormat);
      this.low = StringUtil.formatNumber(low, boFormat);
      this.close = StringUtil.formatNumber(close, boFormat);
      this.currQtySell = StringUtil.formatNumber(currQtySell, '#,###');
      this.currQtyBuy = StringUtil.formatNumber(currQtyBuy, '#,###');
      this.profit = StringUtil.formatNumber(totProfit, '#,###', true);
      if(this.watchData.isErrorPosition) {
        this.currQtySell = '';
        this.currQtyBuy = '';
        this.profit = '';
      }
    }
  }

  public loadChart(){
    if(this.chart1) {
      this.chart1.clear();
      this.chart1.setMaxCount(10);

      let cfdProductCode = this.watchData.cfdProductCode;
      this.business.ohlc({ohlcTypeCode:3, cfdProductCode:cfdProductCode, count:10}).subscribe(
        val => {
          if(val && Array.isArray(val)){
            val.forEach(el=>{
              this.chart1.AddData('bid', el.datetime, el.close );
            })
            this.chart1.run();
          }
        }
      )
    }
  }

  public delWatchList(cfdProductCode){
    this.watchEmitter.emit(cfdProductCode);
  }

  public getNumberColor(formatNumber:string){
    if(!formatNumber) return '';
    if(formatNumber.indexOf('-') > -1){
      return 'label label-num-lg text-price-down';
    } else if(formatNumber.indexOf('+') > -1){
      return 'label label-num-lg text-price-up';
    } else {
      return 'label label-num-lg label-bright ';
    }
  }

  // #2458
  private didProcForAfterViewInit = () => {
    let self = this;

    if(!self.miniChart) {
      return;
    }

    // request sample
    let def: Deferred<any> = new Deferred<any>();
    let subscription = def.asObservable().subscribe(
      val => {
        try {
          if(val) {
            // console.log();
          }
        }
        catch(e) {
          console.error(e);
        }
        finally {
        }
      }
    );

    let requestIndex:number = 0;
    let chartRef:ChartCfdMiniComponent = self.miniChart;
    let requestData:ChartRequestData = {} as ChartRequestData;
    requestData.symbolCode   = self.watchData.cfdProductCode;; // 日本225
    requestData.dataCount    = "11"; // #3051
    requestData.timeType     = DEFAULT_TIME_TYPE;
    requestData.timeInterval = DEFAULT_TIME_INTERVAL;
    

    self.didRequestDataForMiniChartAt(chartRef, requestIndex, requestData, def);
  }

  /**
   * チャートのデータリクエスト情報が変更された時に呼ばれるメソッド
   * @param  {ChartRequestData} requestData
   * @return {[type]}
   */
  private didRequestDataForMiniChartAt(chartRef:ChartCfdMiniComponent, index:number, requestData:ChartRequestData, notifier?:Deferred<any>, chartType?:string, useOption?:any, seriesInfo?:string) {
    let self = this;

    // 現在選択されているチャートを対象にする。
    let xRcc = chartRef;
    if(!xRcc || !xRcc.didRequestChartDataFromSettingCFD) {
      return;
    }

    let def: Deferred<any> = new Deferred<any>();
    
    let subscription = def.asObservable().subscribe(
      val => {
            // 受信したリクエスト情報はここでアップデートされる。
        try {
          if (val && val.componentIndex !== undefined && val.componentIndex != null) {
            // 銘柄情報が取得できた場合は、チャート初期化成功として非活性の設定を解除する
            if (val.symbolCode && val.symbolCode.length > 0) {
              // this.isSettingDisabled = false;
            }

            if(notifier) {
              notifier.next({componentIndex:val.componentIndex});
            }
          }
        }
        catch (e) {
          console.error(e);
        }
      }
    );

    xRcc.didRequestChartDataFromSettingCFD(index, requestData, def, chartType, useOption, seriesInfo);
  }
  
  protected didSetDefaultChartRequestInfo(chartRequestInfo:ChartCFDRequestInfo) {
		if(chartRequestInfo) {
      chartRequestInfo.timeType			    = DEFAULT_TIME_TYPE;
      chartRequestInfo.timeInterval	    = DEFAULT_TIME_INTERVAL;
      chartRequestInfo.useOrderLine	    = false;
      chartRequestInfo.usePositLine	    = false;
      chartRequestInfo.useAlertLine	    = false;
      chartRequestInfo.useExecutionLine	= false;
		}
	}

  protected didCallDetectChange() {
    let self = this;
    DetectChange(self.changeRef);
  }

  private updatePosition() {
    let input = {cfdProductCode: this.watchData.cfdProductCode};

    this.business.getProductPositionList(input).subscribe(val=>{
      if(val && val.result) {
        this.watchData.positionList = val.result.positionList;
        this.makeData();
      }
      this.updateView();
    });
  }

  private isPriceFlashingOn(configDisplay:IConfigDisplaySettings):boolean {
    return configDisplay.priceFlashing == 'on';
  }

  public requestStep2() {
    this.loadChart();
    this.subscribePrice();

    let self = this;
    self.didProcForAfterViewInit();

    this.positionNotifySubscribe = this.business.notifyer.event().subscribe(val => {
      // console.log(val);
      switch (val[1].eventType) {
        case commonApp.NoticeType.SPEED_EXECUTION:
        case commonApp.NoticeType.EXECUTION:
          // ポジション情報更新
          if(this.watchData.cfdProductCode == val[1].cfdProductCode)
            this.updatePosition();
        break;
      }
    });

    // conversionRate
    this.conversionRateNotifySubscribe = this.business.notifyer.conversionRate().subscribe(val=>{
      if(val && val.conversionRateList ){
        // console.log(val);
        // console.log(this.watchData);
        for(let ii = 0; ii < val.conversionRateList.length; ii++) {
          if(val.conversionRateList[ii].currency == this.watchData.conversion.currency) {
            this.watchData.conversion.bid = val.conversionRateList[ii].bid
            this.watchData.conversion.floatingpos = val.conversionRateList[ii].floatingpos;
            break;
          }
        }
        // console.log(this.watchData);
        this.makeData();
        this.updateView();
      }
    });

    this.makeData();
    this.updateView();
  }

}
