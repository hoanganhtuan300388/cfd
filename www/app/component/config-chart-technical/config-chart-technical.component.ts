/**
 *
 * 設定：チャート指標
 *
 */
import { Component, OnInit, ElementRef, ChangeDetectorRef, Input } from '@angular/core';
import { PanelViewBase, ComponentViewBase,
         PanelManageService, ResourceService,
         CommonConst, Tooltips,
         IViewState, IViewData, ViewBase } from "../../core/common";

import { IConfigChartTechnical } from '../../core/configinterface';
import * as BusinessConst from '../../const/businessConst';

import { IDropdownItem } from "../../ctrls/dropdown/dropdown.component";

import * as ChartCFDConst from '../../const/chartCFDConst';
import { IIndicaterInfo, ConvertToIndicatorInfo, ConvertToIConfigChartTechnical, GetIndicatorInfoFromConfigByCode } from '../../core/chartCFDInterface';
import { DeepCopy, DetectChange } from '../../util/commonUtil';

declare var $:any;

//-----------------------------------------------------------------------------
// COMPONENT : ConfigChartTechnicalComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'config-chart-technical',
  templateUrl: './config-chart-technical.component.html',
  styleUrls: ['./config-chart-technical.component.scss']
})
export class ConfigChartTechnicalComponent extends ComponentViewBase implements OnInit {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  @Input("config") config:IConfigChartTechnical;

  // #1594
  public indicatorInfos:any = {
    /* トレンド系情報 */
    trends: [
      {code:ChartCFDConst.INDICATOR_CODES.SMA_TRIPLE, display:"単純移動平均線", show:false, attention:false},
      {code:ChartCFDConst.INDICATOR_CODES.EMA_TRIPLE, display:"指数平滑移動平均線", show:false, attention:false},
      {code:ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE, display:"ボリンジャーバンド", show:false, attention:false},
      {code:ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE_SUPER, display:"スーパーボリンジャー", show:false, attention:false},
      {code:ChartCFDConst.INDICATOR_CODES.SPANMODEL, display:"スパンモデル", show:false, attention:false},
      {code:ChartCFDConst.INDICATOR_CODES.ICHIMOKU_CFD, display:"一目均衡表", show:false, attention:false},
      {code:ChartCFDConst.INDICATOR_CODES.HEIKINASHI, display:"平均足", show:false, attention:true},
    ],
    /* オシレーター系情報 */
    oscillators: [
      {code:ChartCFDConst.INDICATOR_CODES.MACD, display:"MACD", show:false, attention:true},
      {code:ChartCFDConst.INDICATOR_CODES.STOCHASTIC_CFD, display:"ストキャスティクス", show:false, attention:true},
      {code:ChartCFDConst.INDICATOR_CODES.RSI_TRIPLE, display:"RSI", show:false, attention:true},
      {code:ChartCFDConst.INDICATOR_CODES.RCI, display:"RCI", show:false, attention:true},
    ]
  };

  // #2726
  private techListInSubchart:string[] = [
    ChartCFDConst.INDICATOR_CODES.HEIKINASHI,
    ChartCFDConst.INDICATOR_CODES.MACD,
    ChartCFDConst.INDICATOR_CODES.STOCHASTIC_CFD,
    ChartCFDConst.INDICATOR_CODES.RSI_TRIPLE,
    ChartCFDConst.INDICATOR_CODES.RCI,
  ];
  //

  public techTab:string = ChartCFDConst.INDICATOR_CODES.SMA_TRIPLE;

  public isPageDisabled :boolean = false;

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(public panelMng:PanelManageService,
              public resource:ResourceService,
              public element: ElementRef,
              public changeRef:ChangeDetectorRef) {
    super(panelMng, element, changeRef);

    let self = this;

  }

  ngOnInit() {
    super.ngOnInit();

    let self = this;

    self.didInitConfig();

    console.log(this.config);
  }

  ngAfterViewInit() {
		setTimeout(()=>{
				// bootstrap material init.
				if( $ && $.material ){
					$.material.init();
				}
    },1);

    // #2179
    let self = this;
    setTimeout(function() {
      $(self.element.nativeElement).find(".qty-input").bind('mousewheel DOMMouseScroll', e => {
        e.preventDefault();
      });

      // 初期表示時、先頭のタブを選択状態にする
      let $activeLabel = $(self.element.nativeElement).find('.technical-list .checkbox:first-child label');
      if ($activeLabel.length > 0) {
        $($activeLabel[0]).addClass('active');
      }
    }, 100);
    //
	}

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------

  public didUpdateConfig(config:any) {
    let self = this;

    if(config) {
      self.config = DeepCopy(config);
    }

    self.didUpdateIndicatorInfos();

    DetectChange(self.changeRef);
  }

  private didInitConfig() {
    let self = this;

    // #2473
    if(!self.config) {
      self.config = DeepCopy(self.resource.config.setting.chartTech);
    }

    self.didUpdateIndicatorInfos();
  }

  private didUpdateIndicatorSelected(indicatorCode:string, useOnOff?:boolean) {
    let self = this;

    self.techTab = indicatorCode;
    // let span = $('.techTab').find('span');
    // $(span).removeClass('active');
    // $(span[self.techTab]).addClass('active');

    if(useOnOff !== true) {
      return;
    }

    if(indicatorCode == ChartCFDConst.INDICATOR_CODES.SMA_TRIPLE) {
      self.config.display.ma = !self.config.display.ma;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.EMA_TRIPLE) {
      self.config.display.ema = !self.config.display.ema;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE) {
      self.config.display.bollinger = !self.config.display.bollinger;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE_SUPER) {
      self.config.display.superBollinger = !self.config.display.superBollinger;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.SPANMODEL) {
      self.config.display.span = !self.config.display.span;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.ICHIMOKU_CFD) {
      self.config.display.ichimoku = !self.config.display.ichimoku;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.HEIKINASHI) {
      self.config.display.average = !self.config.display.average;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.MACD) {
      self.config.display.macd = !self.config.display.macd;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.STOCHASTIC_CFD) {
      self.config.display.stochastic = !self.config.display.stochastic;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.RSI_TRIPLE) {
      self.config.display.rsi = !self.config.display.rsi;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.RCI) {
      self.config.display.rci = !self.config.display.rci;
    }
  }

  /**
   *
   * @param event
   */
  public onSelectIndicator(indicatorCode:string){
    let self = this;

    self.didUpdateIndicatorSelected(indicatorCode);

    DetectChange(self.changeRef);
  }

  /**
   * disabledの場合activeクラスが削除されてしまうため、タブクリック時にactiveクラスを設定し直す
   * @param event
   */
  public onClickSelectTab(event){
    let $checkLabel = $(this.element.nativeElement).find('.technical-list .checkbox label.active');
    if ($checkLabel && $checkLabel.length > 0) {
      $checkLabel.removeClass('active');
    }
    let _e = event;
    setTimeout(()=>{
      // labelにactiveをつける
      if ($(_e.target).hasClass('check')) {
        $(_e.target).parent().parent().addClass('active');
      } else if ($(_e.target).hasClass('checkbox-material') || ($(_e.target).attr('type')=='checkbox')) {
        $(_e.target).parent().addClass('active');
      } else {
        $(_e.target).addClass('active');
      }
      if ($ && $.material) {
        $.material.init();
      }
    }, 10);
  }

  /**
   * DLG画面を閉じる。
   */
  public confirm(event, status: string) {

		if(status === 'OK') {

		}
		else if(status === 'APPLY') {

    }
    else{

    }
  }

  public didGetConfig() {
    return(DeepCopy(this.config));
  }

  // #1952
  private didUpdateAvailableUse() {
    let self = this;
    let nCount:number = 0;
    nCount = self.indicatorInfos.trends.length;
    for(var ii = 0; ii < nCount; ii++) {
      let item:any = self.indicatorInfos.trends[ii];
      item.indicator = GetIndicatorInfoFromConfigByCode(self.config, item.code);
      item.__disabled__ = self.isAvailableTechnical(item.code);
    }

    nCount = self.indicatorInfos.oscillators.length;
    for(var ii = 0; ii < nCount; ii++) {
      let item:any = self.indicatorInfos.oscillators[ii];
      item.indicator = GetIndicatorInfoFromConfigByCode(self.config, item.code);
      item.__disabled__ = self.isAvailableTechnical(item.code);
    }
  }
  //

  private didUpdateIndicatorInfos() {
    let self = this;
    let nCount:number = 0;
    nCount = self.indicatorInfos.trends.length;
    for(var ii = 0; ii < nCount; ii++) {
      let item:any = self.indicatorInfos.trends[ii];
      item.indicator = GetIndicatorInfoFromConfigByCode(self.config, item.code);
      item.show = item.indicator.show;
    }

    nCount = self.indicatorInfos.oscillators.length;
    for(var ii = 0; ii < nCount; ii++) {
      let item:any = self.indicatorInfos.oscillators[ii];
      item.indicator = GetIndicatorInfoFromConfigByCode(self.config, item.code);
      item.show = item.indicator.show;
    }

    // #1952
    self.didUpdateAvailableUse();
  }

  public didGetIndicatorInfos() {
    let self = this;
    self.didUpdateIndicatorInfos();

    return(DeepCopy(self.indicatorInfos));
  }

  //---------------------------------------------------------------------------
  // event handler
  //---------------------------------------------------------------------------
  public scrollToChange(event){
    console.log(event);
  }

  protected didGetValueFromEvent(event:any) : string {
    return($(event.currentTarget).val().toString());
  }

  public enterToChangeParam(indicatorCode:string, paramNo:number, event:any){
    if(event.keyCode == 13){
      this.onChangedParamInput(indicatorCode, paramNo, event);
    }
  }

  protected updateParamValueToElement(indicatorCode:string, paramNo:number, newValue:string) {
    let self = this;
    try {
      let domElemId:string = "#eidIndi_" + indicatorCode + "_" + paramNo;
      let jqElem$ = $(domElemId);
      if(jqElem$) {
        jqElem$.val(newValue);
      }
    }
    catch(e) {
      console.error(e);
    }
  }

  public setParamValueInRange = (indicatorCode:string, paramNo:number, newValue:string) => {
    let self = this;
    if(indicatorCode == ChartCFDConst.INDICATOR_CODES.SMA_TRIPLE) {
      if(paramNo == 0) {
        self.config.parameters.ma1 = '' + Math.min(200, Math.max(1, parseInt(newValue)));
      }
      else if(paramNo == 1) {
        self.config.parameters.ma2 = '' + Math.min(200, Math.max(1, parseInt(newValue)));
      }
      else {
        self.config.parameters.ma3 = '' + Math.min(200, Math.max(1, parseInt(newValue)));
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.EMA_TRIPLE) {
      if(paramNo == 0) {
        self.config.parameters.ema1 = '' + Math.min(200, Math.max(1, parseInt(newValue)));
      }
      else if(paramNo == 1) {
        self.config.parameters.ema2 = '' + Math.min(200, Math.max(1, parseInt(newValue)));
      }
      else {
        self.config.parameters.ema3 = '' + Math.min(200, Math.max(1, parseInt(newValue)));
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE) {
      if(paramNo == 0) {
        self.config.parameters.bollingerMA = '' + Math.min(188, Math.max(1, parseInt(newValue)));
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE_SUPER) {
      if(paramNo == 0) {
        self.config.parameters.superBollingerMA = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
      else if(paramNo == 1) {
        self.config.parameters.superBollingerLag = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
      else if(paramNo == 2) {
        self.config.parameters.superBollinger1 = '' + Math.min(5, Math.max(1, parseInt(newValue)));
      }
      else if(paramNo == 3) {
        self.config.parameters.superBollinger2 = '' + Math.min(5, Math.max(1, parseInt(newValue)));
      }
      else {
        self.config.parameters.superBollinger3 = '' + Math.min(5, Math.max(1, parseInt(newValue)));
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.SPANMODEL) {
      if(paramNo == 0) {
        self.config.parameters.spanPrecede1 = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
      else if(paramNo == 1) {
        self.config.parameters.spanPrecede2 = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
      else {
        self.config.parameters.spanLater1 = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.ICHIMOKU_CFD) {
      if(paramNo == 0) {
        self.config.parameters.ichimokuTransit = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
      else if(paramNo == 1) {
        self.config.parameters.ichimokuBase = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
      else if(paramNo == 2) {
        self.config.parameters.ichimokuPrecede1 = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
      else if(paramNo == 3) {
        self.config.parameters.ichimokuPrecede2 = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
      else {
        self.config.parameters.ichimokuLater1 = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.HEIKINASHI) {
       self.config.parameters.average = '' + Math.min(255, Math.max(1, parseInt(newValue)));
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.MACD) {
      if(paramNo == 0) {
        self.config.parameters.macdShort = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
      else if(paramNo == 1) {
        self.config.parameters.macdLong = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
      else {
        self.config.parameters.macdSignal = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.STOCHASTIC_CFD) {
      if(paramNo == 0) {
        self.config.parameters.perK = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
      else if(paramNo == 1) {
        self.config.parameters.perD = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
      else {
        self.config.parameters.slowPerD = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.RSI_TRIPLE) { // #2475
      if(paramNo == 0) {
        self.config.parameters.cutlerRSIShort = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
      else if(paramNo == 1) {
        self.config.parameters.cutlerRSIMiddle = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
      else {
        self.config.parameters.cutlerRSILong = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.RCI) {
      if(paramNo == 0) {
        self.config.parameters.rciShort = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
      else if(paramNo == 1) {
        self.config.parameters.rciMiddle = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
      else {
        self.config.parameters.rciLong = '' + Math.min(255, Math.max(1, parseInt(newValue)));
      }
    }
  }

  public getParamValue(indicatorCode:string, paramNo:number) : string {
    let self = this;
    let paramValue:string;
    if(indicatorCode == ChartCFDConst.INDICATOR_CODES.SMA_TRIPLE) {
      if(paramNo == 0) {
        paramValue = self.config.parameters.ma1;
      }
      else if(paramNo == 1) {
        paramValue = self.config.parameters.ma2;
      }
      else {
        paramValue = self.config.parameters.ma3;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.EMA_TRIPLE) {
      if(paramNo == 0) {
        paramValue = self.config.parameters.ema1;
      }
      else if(paramNo == 1) {
        paramValue = self.config.parameters.ema2;
      }
      else {
        paramValue = self.config.parameters.ema3;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE) {
      if(paramNo == 0) {
        paramValue = self.config.parameters.bollingerMA;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE_SUPER) {
      if(paramNo == 0) {
        paramValue = self.config.parameters.superBollingerMA;
      }
      else if(paramNo == 1) {
        paramValue = self.config.parameters.superBollingerLag;
      }
      else if(paramNo == 2) {
        paramValue = self.config.parameters.superBollinger1;
      }
      else if(paramNo == 3) {
        paramValue = self.config.parameters.superBollinger2;
      }
      else {
        paramValue = self.config.parameters.superBollinger3;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.SPANMODEL) {
      if(paramNo == 0) {
        paramValue = self.config.parameters.spanPrecede1;
      }
      else if(paramNo == 1) {
        paramValue = self.config.parameters.spanPrecede2;
      }
      else {
        paramValue = self.config.parameters.spanLater1;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.ICHIMOKU_CFD) {
      if(paramNo == 0) {
        paramValue = self.config.parameters.ichimokuTransit;
      }
      else if(paramNo == 1) {
        paramValue = self.config.parameters.ichimokuBase;
      }
      else if(paramNo == 2) {
        paramValue = self.config.parameters.ichimokuPrecede1;
      }
      else if(paramNo == 3) {
        paramValue = self.config.parameters.ichimokuPrecede2;
      }
      else {
        paramValue = self.config.parameters.ichimokuLater1;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.HEIKINASHI) {
        paramValue = self.config.parameters.average;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.MACD) {
      if(paramNo == 0) {
        paramValue = self.config.parameters.macdShort;
      }
      else if(paramNo == 1) {
        paramValue = self.config.parameters.macdLong;
      }
      else {
        paramValue = self.config.parameters.macdSignal;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.STOCHASTIC_CFD) {
      if(paramNo == 0) {
        paramValue = self.config.parameters.perK;
      }
      else if(paramNo == 1) {
        paramValue = self.config.parameters.perD;
      }
      else {
        paramValue = self.config.parameters.slowPerD;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.RSI_TRIPLE) { // #2475
      if(paramNo == 0) {
        paramValue = self.config.parameters.cutlerRSIShort;
      }
      else if(paramNo == 1) {
        paramValue = self.config.parameters.cutlerRSIMiddle;
      }
      else {
        paramValue = self.config.parameters.cutlerRSILong;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.RCI) {
      if(paramNo == 0) {
        paramValue = self.config.parameters.rciShort;
      }
      else if(paramNo == 1) {
        paramValue = self.config.parameters.rciMiddle;
      }
      else {
        paramValue = self.config.parameters.rciLong;
      }
    }

    return(paramValue);
  }

  public onScrollToChange(indicatorCode:string, paramNo:number, event:any) {
    let self = this;
    let value:number = parseInt(self.didGetValueFromEvent(event));

    DetectChange(self.changeRef);
  }

  public onChangedParamInput(indicatorCode:string, paramNo:number, event:any) {
    let self = this;
    let newValue:string = self.didGetValueFromEvent(event);

    // #2475
    if($.isNumeric(newValue) != true) {
      newValue = self.getDefaultParamValue(indicatorCode, paramNo);
    }
    //

    self.setParamValueInRange(indicatorCode, paramNo, newValue);
    let paramValue:string = self.getParamValue(indicatorCode, paramNo);
    self.updateParamValueToElement(indicatorCode, paramNo, paramValue);
    DetectChange(self.changeRef);
  }

  protected didUpdateParamChange = (indicatorCode:string, paramNo:number, delta:number) => {
    console.log("onClickParameterChange");
    let self = this;
    let preValue:number = parseInt(self.getParamValue(indicatorCode, paramNo));
    let newValue:number = (preValue + delta);

    self.setParamValueInRange(indicatorCode, paramNo, newValue + '');
    let paramValue:string = self.getParamValue(indicatorCode, paramNo);
    self.updateParamValueToElement(indicatorCode, paramNo, paramValue);
    DetectChange(self.changeRef);
  }

  public onLongPressParameterChange = (indicatorCode:string, paramNo:number, isPlus:boolean) => {
    let self = this;
    let delta:number = isPlus == true ? 1 : -1;
    self.didUpdateParamChange(indicatorCode, paramNo, delta);
  }

  public onClickParameterChange = (indicatorCode:string, paramNo:number, isMinus:boolean) => {
    console.log("onClickParameterChange");
    let self = this;
    let delta:number = isMinus == true ? -1 : 1;
    self.didUpdateParamChange(indicatorCode, paramNo, delta);
  }

  public onClickPlotOnOff(indicatorCode:string, paramNo:number) {
    let self = this;
    if(indicatorCode == ChartCFDConst.INDICATOR_CODES.SMA_TRIPLE) {
      if(paramNo == 0) {
        self.config.parameters.ma1_disable = !self.config.parameters.ma1_disable;
      }
      else if(paramNo == 1) {
        self.config.parameters.ma2_disable = !self.config.parameters.ma2_disable; // #3078
      }
      else {
        self.config.parameters.ma3_disable = !self.config.parameters.ma3_disable;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.EMA_TRIPLE) {
      if(paramNo == 0) {
        self.config.parameters.ema1_disable = !self.config.parameters.ema1_disable;
      }
      else if(paramNo == 1) {
        self.config.parameters.ema2_disable = !self.config.parameters.ema2_disable; // 
      }
      else {
        self.config.parameters.ema3_disable = !self.config.parameters.ema3_disable; // 
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE) {
      if(paramNo == 0) {
        self.config.parameters.bollingerMA_disable = !self.config.parameters.bollingerMA_disable;
      }
      else if(paramNo == 1) {
        self.config.parameters.bollinger1_disable = !self.config.parameters.bollinger1_disable;
      }
      else if(paramNo == 2) {
        self.config.parameters.bollinger2_disable = !self.config.parameters.bollinger2_disable;
      }
      else {
        self.config.parameters.bollinger3_disable = !self.config.parameters.bollinger3_disable;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE_SUPER) {
      if(paramNo == 0) {
        self.config.parameters.superBollingerMA_disable = !self.config.parameters.superBollingerMA_disable;
      }
      else if(paramNo == 1) {
        self.config.parameters.superBollingerLag_disable = !self.config.parameters.superBollingerLag_disable;
      }
      else if(paramNo == 2) {
        self.config.parameters.superBollinger1_disable = !self.config.parameters.superBollinger1_disable;
      }
      else if(paramNo == 3) {
        self.config.parameters.superBollinger2_disable = !self.config.parameters.superBollinger2_disable;
      }
      else {
        self.config.parameters.superBollinger3_disable = !self.config.parameters.superBollinger3_disable;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.SPANMODEL) {
      if(paramNo == 0) {
        self.config.parameters.spanPrecede1_disable = !self.config.parameters.spanPrecede1_disable;
      }
      else if(paramNo == 1) {
        self.config.parameters.spanPrecede2_disable = !self.config.parameters.spanPrecede2_disable;
      }
      else {
        self.config.parameters.spanLater1_disable = !self.config.parameters.spanLater1_disable;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.ICHIMOKU_CFD) {
      if(paramNo == 0) {
        self.config.parameters.ichimokuTransit_disable = !self.config.parameters.ichimokuTransit_disable;
      }
      else if(paramNo == 1) {
        self.config.parameters.ichimokuBase_disable = !self.config.parameters.ichimokuBase_disable;
      }
      else if(paramNo == 2) {
        self.config.parameters.ichimokuPrecede1_disable = !self.config.parameters.ichimokuPrecede1_disable;
      }
      else if(paramNo == 3) {
        self.config.parameters.ichimokuPrecede2_disable = !self.config.parameters.ichimokuPrecede2_disable;
      }
      else {
        self.config.parameters.ichimokuLater1_disable = !self.config.parameters.ichimokuLater1_disable;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.HEIKINASHI) {
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.MACD) {
      if(paramNo == 0) {
        self.config.parameters.macdShort_disable = !self.config.parameters.macdShort_disable;
      }
      else {
        self.config.parameters.macdSignal_disable = !self.config.parameters.macdSignal_disable;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.STOCHASTIC_CFD) {
      if(paramNo == 0) {
        self.config.parameters.perK_disable = !self.config.parameters.perK_disable;
      }
      else if(paramNo == 1) {
        self.config.parameters.perD_disable = !self.config.parameters.perD_disable;
      }
      else {
        self.config.parameters.slowPerD_disable = !self.config.parameters.slowPerD_disable;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.RSI_TRIPLE) { // #2475
      if(paramNo == 0) {
        self.config.parameters.cutlerRSIShort_disable = !self.config.parameters.cutlerRSIShort_disable;
      }
      else if(paramNo == 1) {
        self.config.parameters.cutlerRSIMiddle_disable = !self.config.parameters.cutlerRSIMiddle_disable;
      }
      else {
        self.config.parameters.cutlerRSILong_disable = !self.config.parameters.cutlerRSILong_disable;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.RCI) {
    }
  }

  public onClickRollback(indicatorCode:string) {
    let self = this;
    // #2473, #2537
    let configForInitial:IConfigChartTechnical = this.resource.defaultChartTechnicalSetting();
    if(indicatorCode == ChartCFDConst.INDICATOR_CODES.SMA_TRIPLE) {
      self.config.parameters.ma1						            = configForInitial.parameters.ma1;
      self.config.parameters.ma1_disable                = configForInitial.parameters.ma1_disable;
      self.config.parameters.ma2                        = configForInitial.parameters.ma2;
      self.config.parameters.ma2_disable                = configForInitial.parameters.ma2_disable;
      self.config.parameters.ma3                        = configForInitial.parameters.ma3;
      self.config.parameters.ma3_disable                = configForInitial.parameters.ma3_disable;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.EMA_TRIPLE) {
      self.config.parameters.ema1                        = configForInitial.parameters.ema1;
      self.config.parameters.ema1_disable                = configForInitial.parameters.ema1_disable;
      self.config.parameters.ema2                        = configForInitial.parameters.ema2;
      self.config.parameters.ema2_disable                = configForInitial.parameters.ema2_disable;
      self.config.parameters.ema3                        = configForInitial.parameters.ema3;
      self.config.parameters.ema3_disable                = configForInitial.parameters.ema3_disable;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE) {
      self.config.parameters.bollingerMA                 = configForInitial.parameters.bollingerMA;
      self.config.parameters.bollingerMA_disable         = configForInitial.parameters.bollingerMA_disable;
      self.config.parameters.bollinger1                  = configForInitial.parameters.bollinger1;
      self.config.parameters.bollinger1_disable          = configForInitial.parameters.bollinger1_disable;
      self.config.parameters.bollinger2                  = configForInitial.parameters.bollinger2;
      self.config.parameters.bollinger2_disable          = configForInitial.parameters.bollinger2_disable;
      self.config.parameters.bollinger3                  = configForInitial.parameters.bollinger3;
      self.config.parameters.bollinger3_disable          = configForInitial.parameters.bollinger3_disable;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE_SUPER) {
      self.config.parameters.superBollingerMA            = configForInitial.parameters.superBollingerMA;
      self.config.parameters.superBollingerMA_disable    = configForInitial.parameters.superBollingerMA_disable;
      self.config.parameters.superBollingerLag           = configForInitial.parameters.superBollingerLag;
      self.config.parameters.superBollingerLag_disable   = configForInitial.parameters.superBollingerLag_disable;
      self.config.parameters.superBollinger1             = configForInitial.parameters.superBollinger1;
      self.config.parameters.superBollinger1_disable     = configForInitial.parameters.superBollinger1_disable;
      self.config.parameters.superBollinger2             = configForInitial.parameters.superBollinger2;
      self.config.parameters.superBollinger2_disable     = configForInitial.parameters.superBollinger2_disable;
      self.config.parameters.superBollinger3             = configForInitial.parameters.superBollinger3;
      self.config.parameters.superBollinger3_disable     = configForInitial.parameters.superBollinger3_disable;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.SPANMODEL) {
      self.config.parameters.spanPrecede1                = configForInitial.parameters.spanPrecede1;
      self.config.parameters.spanPrecede1_disable        = configForInitial.parameters.spanPrecede1_disable;
      self.config.parameters.spanPrecede2                = configForInitial.parameters.spanPrecede2;
      self.config.parameters.spanPrecede2_disable        = configForInitial.parameters.spanPrecede2_disable;
      self.config.parameters.spanLater1                  = configForInitial.parameters.spanLater1;
      self.config.parameters.spanLater1_disable          = configForInitial.parameters.spanLater1_disable;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.ICHIMOKU_CFD) {
      self.config.parameters.ichimokuTransit             = configForInitial.parameters.ichimokuTransit;
      self.config.parameters.ichimokuTransit_disable     = configForInitial.parameters.ichimokuTransit_disable;
      self.config.parameters.ichimokuBase                = configForInitial.parameters.ichimokuBase;
      self.config.parameters.ichimokuBase_disable        = configForInitial.parameters.ichimokuBase_disable;
      self.config.parameters.ichimokuPrecede1            = configForInitial.parameters.ichimokuPrecede1;
      self.config.parameters.ichimokuPrecede1_disable    = configForInitial.parameters.ichimokuPrecede1_disable;
      self.config.parameters.ichimokuPrecede2            = configForInitial.parameters.ichimokuPrecede2;
      self.config.parameters.ichimokuPrecede2_disable    = configForInitial.parameters.ichimokuPrecede2_disable;
      self.config.parameters.ichimokuLater1              = configForInitial.parameters.ichimokuLater1;
      self.config.parameters.ichimokuLater1_disable      = configForInitial.parameters.ichimokuLater1_disable;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.HEIKINASHI) {
      self.config.parameters.average                     = configForInitial.parameters.average;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.MACD) {
      self.config.parameters.macdShort                   = configForInitial.parameters.macdShort;
      self.config.parameters.macdShort_disable           = configForInitial.parameters.macdShort_disable;
      self.config.parameters.macdLong                    = configForInitial.parameters.macdLong;
      self.config.parameters.macdSignal                  = configForInitial.parameters.macdSignal;
      self.config.parameters.macdSignal_disable          = configForInitial.parameters.macdSignal_disable;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.STOCHASTIC_CFD) {
      self.config.parameters.perK                        = configForInitial.parameters.perK;
      self.config.parameters.perK_disable                = configForInitial.parameters.perK_disable;
      self.config.parameters.perD                        = configForInitial.parameters.perD;
      self.config.parameters.perD_disable                = configForInitial.parameters.perD_disable;
      self.config.parameters.slowPerD                    = configForInitial.parameters.slowPerD;
      self.config.parameters.slowPerD_disable            = configForInitial.parameters.slowPerD_disable;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.RSI_TRIPLE) { // #2475
      self.config.parameters.cutlerRSIShort              = configForInitial.parameters.cutlerRSIShort;
      self.config.parameters.cutlerRSIShort_disable      = configForInitial.parameters.cutlerRSIShort_disable;
      self.config.parameters.cutlerRSIMiddle             = configForInitial.parameters.cutlerRSIMiddle;
      self.config.parameters.cutlerRSIMiddle_disable     = configForInitial.parameters.cutlerRSIMiddle_disable;
      self.config.parameters.cutlerRSILong               = configForInitial.parameters.cutlerRSILong;
      self.config.parameters.cutlerRSILong_disable       = configForInitial.parameters.cutlerRSILong_disable;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.RCI) {
      self.config.parameters.rciShort                    = configForInitial.parameters.rciShort;
      self.config.parameters.rciMiddle                   = configForInitial.parameters.rciMiddle;
      self.config.parameters.rciLong                     = configForInitial.parameters.rciLong;
    }
    //
  }

  public onClickIndicatorShowOnOff(indicatorCode:string) {
    let self = this;
    self.didUpdateIndicatorSelected(indicatorCode, true);

    self.didUpdateIndicatorInfos(); // #1978

    // setTimeout(()=>{
		// 	if( $ && $.material ){
		// 		$.material.init();
		// 	}
    // },1);
  }

  // #1978
  public isAvailableTechnical(code:string) {
    let self = this;
    // #2726
    if(self.techListInSubchart.indexOf(code) < 0) {
      return(false);
    }
    //

    let showList = [];
    let nCount:number = 0;
    nCount = self.indicatorInfos.trends.length;
    for(var ii = 0; ii < nCount; ii++) {
      let item:any = self.indicatorInfos.trends[ii];
      if(self.techListInSubchart.indexOf(item.code) >= 0 && item.show === true) { // #2726
        showList.push(item.code);
      }
    }

    nCount = self.indicatorInfos.oscillators.length;
    for(var ii = 0; ii < nCount; ii++) {
      let item:any = self.indicatorInfos.oscillators[ii];
      item.indicator = GetIndicatorInfoFromConfigByCode(self.config, item.code);
      if(self.techListInSubchart.indexOf(item.code) >= 0 && item.show === true) { // #2726
        showList.push(item.code);
      }
    }

    if(showList.length > 2) {
      if(showList.indexOf(code) < 0) {
        return(true);
      }
    }

    return(false);
  }
  //

  // #2475
  public onKeyParamInput(indicatorCode:string, paramNo:number, event:any) {
    let self = this;

    if(!event) {
      return;
    }

    if(event.keyCode == '13') {
      event.preventDefault();

      self.onChangedParamInput(indicatorCode, paramNo, event);
      return;
    }
    else if(event.keyCode == '38') {
      event.preventDefault();

      self.onChangedParamInput(indicatorCode, paramNo, event);

      self.onClickParameterChange(indicatorCode, paramNo, false); // #3078
      return;
    }
    else if(event.keyCode == '40') {
      event.preventDefault();

      self.onChangedParamInput(indicatorCode, paramNo, event);

      self.onClickParameterChange(indicatorCode, paramNo, true); // #3078
      return;
    }
  }

  public getDefaultParamValue(indicatorCode:string, paramNo:number) : string {
    let self = this;
    let paramValue:string;
    let configForInitial:IConfigChartTechnical = DeepCopy(self.resource.config.setting.chartTech);
    if(indicatorCode == ChartCFDConst.INDICATOR_CODES.SMA_TRIPLE) {
      if(paramNo == 0) {
        paramValue = configForInitial.parameters.ma1;
      }
      else if(paramNo == 1) {
        paramValue = configForInitial.parameters.ma2;
      }
      else {
        paramValue = configForInitial.parameters.ma3;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.EMA_TRIPLE) {
      if(paramNo == 0) {
        paramValue = configForInitial.parameters.ema1;
      }
      else if(paramNo == 1) {
        paramValue = configForInitial.parameters.ema2;
      }
      else {
        paramValue = configForInitial.parameters.ema3;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE) {
      if(paramNo == 0) {
        paramValue = configForInitial.parameters.bollingerMA;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.BOLLINGER_BANDS_TRIPLE_SUPER) {
      if(paramNo == 0) {
        paramValue = configForInitial.parameters.superBollingerMA;
      }
      else if(paramNo == 1) {
        paramValue = configForInitial.parameters.superBollingerLag;
      }
      else if(paramNo == 2) {
        paramValue = configForInitial.parameters.superBollinger1;
      }
      else if(paramNo == 3) {
        paramValue = configForInitial.parameters.superBollinger2;
      }
      else {
        paramValue = configForInitial.parameters.superBollinger3;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.SPANMODEL) {
      if(paramNo == 0) {
        paramValue = configForInitial.parameters.spanPrecede1;
      }
      else if(paramNo == 1) {
        paramValue = configForInitial.parameters.spanPrecede2;
      }
      else {
        paramValue = configForInitial.parameters.spanLater1;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.ICHIMOKU_CFD) {
      if(paramNo == 0) {
        paramValue = configForInitial.parameters.ichimokuTransit;
      }
      else if(paramNo == 1) {
        paramValue = configForInitial.parameters.ichimokuBase;
      }
      else if(paramNo == 2) {
        paramValue = configForInitial.parameters.ichimokuPrecede1;
      }
      else if(paramNo == 3) {
        paramValue = configForInitial.parameters.ichimokuPrecede2;
      }
      else {
        paramValue = configForInitial.parameters.ichimokuLater1;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.HEIKINASHI) {
        paramValue = configForInitial.parameters.average;
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.MACD) {
      if(paramNo == 0) {
        paramValue = configForInitial.parameters.macdShort;
      }
      else if(paramNo == 1) {
        paramValue = configForInitial.parameters.macdLong;
      }
      else {
        paramValue = configForInitial.parameters.macdSignal;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.STOCHASTIC_CFD) {
      if(paramNo == 0) {
        paramValue = configForInitial.parameters.perK;
      }
      else if(paramNo == 1) {
        paramValue = configForInitial.parameters.perD;
      }
      else {
        paramValue = configForInitial.parameters.slowPerD;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.RSI_TRIPLE) { // #2475
      if(paramNo == 0) {
        paramValue = configForInitial.parameters.cutlerRSIShort;
      }
      else if(paramNo == 1) {
        paramValue = configForInitial.parameters.cutlerRSIMiddle;
      }
      else {
        paramValue = configForInitial.parameters.cutlerRSILong;
      }
    }
    else if(indicatorCode == ChartCFDConst.INDICATOR_CODES.RCI) {
      if(paramNo == 0) {
        paramValue = configForInitial.parameters.rciShort;
      }
      else if(paramNo == 1) {
        paramValue = configForInitial.parameters.rciMiddle;
      }
      else {
        paramValue = configForInitial.parameters.rciLong;
      }
    }

    return(paramValue);
  }
  //
}
