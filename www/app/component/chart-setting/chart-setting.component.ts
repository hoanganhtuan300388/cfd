import { Component, OnInit, Input, ElementRef, Output, ViewChild, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { PanelManageService, ComponentViewBase, CommonEnum, IViewData, Tooltips } from '../../core/common';

import { SymbolCfdComponent } from '../../ctrls/symbol-cfd/symbol-cfd.component';

import { ChartRequestData, ChartRequestInfo } from '../../core/chartTypeInterface';

import { ViewBase } from "../../core/viewBase"
import * as values from "../../values/values"

import * as BusinessConst from '../../const/businessConst';
import * as ChartConst from '../../const/chartConst';
import { GetTimeTypeList } from '../../core/chartCFDInterface';
import {LocalStorage} from '../../util/utils';

// #959
// 初期値設定
import { ResourceService } from '../../service/resource.service';
//import { IConfigChartSeries, IConfigChart, IConfigChartBasic } from '../../core/configinterface';
//

import { DetectChange } from '../../util/commonUtil'; // #2330

import { ChartCFDRequestInfo } from '../../core/chartCFDInterface';

const CHART_TYPE_DEFAULT:string = 'Candle';
export const CHART_TYPE_LIST = [
	{ value:"Candle",         text:"ローソク",      icon:"chart_type", isTechnicalDisabled:false},
	{ value:"Line",           text:"ライン",        icon:"chart_type", isTechnicalDisabled:false},
];



export function IsTechnicalDisabledChartType(chartType:string) : boolean {
	let nCount:number = CHART_TYPE_LIST.length;
	for(var ii = 0; ii < nCount; ii++) {
		let xChartType:any = CHART_TYPE_LIST[ii];
		if(xChartType) {
			return(xChartType.isTechnicalDisabled);
		}
	}

	return(true);
}
declare var $:any;

@Component({
  selector: 'chart-setting',
  templateUrl: './chart-setting.component.html',
  styleUrls: ['./chart-setting.component.scss']
})

export class ChartSettingComponent extends ComponentViewBase implements OnInit {
	// 銘柄コントロール
  @ViewChild('SymbolCfd') symbolCfdCtrl: SymbolCfdComponent;

  /* テクニカル選択の表示・非表示を切り替えるイベント */
  @Output() showTechnical = new EventEmitter();
  /* チャート種別変更イベント */
  @Output() changeChartType = new EventEmitter<string>();
  /* チャート情報変更要求イベント */
  @Output() changeRequestData = new EventEmitter<ChartRequestData>();
  /* 情報パネルの表示・非表示を切り替えるイベント */
  @Output() showInfoPanel = new EventEmitter<boolean>();
	/* トレンドライン追加 */
  @Output() trendLineCode = new EventEmitter<string>();
  /* クロスライン表示ON/OFF */
	@Output() changeCrosslineShow = new EventEmitter<boolean>();
  /* オーダーライン変更イベント */
  @Output() changeUseOrderLine = new EventEmitter<boolean>();
  /* 建玉ライン変更イベント */
  @Output() changeUsePositionLine = new EventEmitter<boolean>();
  /* 約定履歴ライン変更イベント */
  @Output() changeUseExecutionLine = new EventEmitter<boolean>();
  /* アラートライン変更イベント */
  @Output() changeUseAlertLine = new EventEmitter<boolean>();

  /* 銘柄検索を覗く全てのボタンの有効/無効 */
  @Input() isSettingDisabled:boolean = false;
  /* テクニカル設定表示/非表示の状態 */
  @Input() isTechnicalVisible:boolean = false;
  /* テクニカル設定表示/非表示の設定 */
  @Input() isTechnicalDisabled:boolean = false;
  /* 情報パネル表示/非表示の状態 */
  @Input() isInfoPanelVisible:boolean = false;
  /* 編集パネル表示/非表示の設定 */
  @Input() isEditPanelVisible:boolean = false;
  /* 設定の右側のメニューを表示するか */
  @Input() isRightMenuVisible:boolean = true;

  @Input('ownerId') ownerId: string; // #2925

  // #1567
  // チャートタイプ選択活性化フラグ
  // ティックの場合、ローソクにして非活性化する。
  @Input() isChartTypeDisable:boolean = false;

  /* ------ テンプレートから使用される ------ */
  public symbolCode:string = BusinessConst.DefaultProductCode;

  public timeList = GetTimeTypeList();
  public timeTypeInterval = "1";
  public timeType = "1";
  public timeInterval = "1";

  public isBtnHeightLow:boolean = false;

  public isTechnicalActionDisabled:boolean = false; // #1952

	// #1131
  public chartTypeList = CHART_TYPE_LIST;

    // fixed by choi sunwoo at 2017.06.09
    // Chart -> Candle
  public chartType = "Candle";
  /* オーダーライン  */
  public useOrderLine = false;
  /* 建玉ライン  */
  public usePositLine = false;
  /* 約定履歴ライン  */
  public useExecuLine = false;
  /* アラートライン  */
  public useAlertLine = false;

  /* オーダーライン  */
  public crosslineShow:boolean = true;

  /* 選択中のトレンドラインボタン */
  public selectedTrendLine = '';

  /* ------ 本クラス内で使用される ------ */
  private marketCode:string = ""

	//
	private symbolName:string = "";

  //
  // added by choi sunwoo at 2017.06.12 for #848
  //
  private requestData:ChartRequestData;

  // subscribed list
	private notifySubscribe = [];

  // tooltip
  public TOOLTIP_NEWORDER: string = "";
  public TOOLTIP_SAVE: string = "";
  public TOOLTIP_TECNICAL: string = "";
  public TOOLTIP_TYPE: string = "";
  public TOOLTIP_ZOOMIN: string = "";
  public TOOLTIP_ZOOMOUT: string = "";
  public TOOLTIP_SHOKI_POSITION: string = "";
  public TOOLTIP_ORDER_LINE: string = "";
  public TOOLTIP_POSITION_LINE: string = "";
  public TOOLTIP_OBJECT_SELECT: string = "";
  public TOOLTIP_SHOW_CROSSLINE: string = "";
  public TOOLTIP_POINTER: string = "";
  public TOOLTIP_LINE: string = "";
  public TOOLTIP_CHANNEL_LINE: string = "";
  public TOOLTIP_HORIZON: string = "";
  public TOOLTIP_VERTICAL: string = "";
  public TOOLTIP_CROSS: string = "";
  public TOOLTIP_SQUARE: string = "";
  public TOOLTIP_TRIANGLE: string = "";
  public TOOLTIP_ANGLE: string = "";
  public TOOLTIP_FIBON_ARC: string = "";
  public TOOLTIP_FIBON_RETRACE: string = "";
  public TOOLTIP_FIBON_TIMEZONE: string = "";
  public TOOLTIP_FIBON_FAN: string = "";
  public TOOLTIP_GANFAN_UP: string = "";
  public TOOLTIP_GANFAN_DOWN: string = "";
  public TOOLTIP_TEXT: string = "";
  public TOOLTIP_DELETE: string = "";
  public TOOLTIP_DELETE_ALL: string = "";
  public TOOLTIP_HOKA_TEKIYOU: string = "";
  public TOOLTIP_OBJECT_COLOR: string = "";
  public TOOLTIP_WiNDOW_VIEW: string = "";

  constructor( public element: ElementRef,
               public panelMng: PanelManageService,
							 private resource: ResourceService,
               public changeRef: ChangeDetectorRef) {
    super(panelMng, element, changeRef);

		this.TOOLTIP_NEWORDER = "";//Tooltips.TOOLTIP_NEWORDER;
    this.TOOLTIP_SAVE = Tooltips.CHART_SAVE;
    this.TOOLTIP_TECNICAL = Tooltips.CHART_TECNICAL;
    this.TOOLTIP_TYPE = Tooltips.CHART_TYPE;
    this.TOOLTIP_ZOOMIN = Tooltips.CHART_ZOOMIN;
    this.TOOLTIP_ZOOMOUT = Tooltips.CHART_ZOOMOUT;
    this.TOOLTIP_SHOKI_POSITION = Tooltips.CHART_SHOKI_POSITION;
    this.TOOLTIP_ORDER_LINE = Tooltips.CHART_ORDER_LINE;
    this.TOOLTIP_POSITION_LINE = Tooltips.CHART_POSITION_LINE;
    this.TOOLTIP_OBJECT_SELECT = Tooltips.CHART_OBJECT_SELECT;
    this.TOOLTIP_SHOW_CROSSLINE = Tooltips.CHART_SHOW_CROSSLINE;
    this.TOOLTIP_LINE = Tooltips.CHART_LINE;
    this.TOOLTIP_CHANNEL_LINE = Tooltips.CHART_CHANNEL_LINE;
    this.TOOLTIP_HORIZON = Tooltips.CHART_HORIZON;
    this.TOOLTIP_VERTICAL = Tooltips.CHART_VERTICAL;
    this.TOOLTIP_CROSS = Tooltips.CHART_CROSS;
    this.TOOLTIP_SQUARE = Tooltips.CHART_SQUARE;
    this.TOOLTIP_TRIANGLE = Tooltips.CHART_TRIANGLE;
    this.TOOLTIP_ANGLE = Tooltips.CHART_ANGLE;
    this.TOOLTIP_FIBON_ARC = Tooltips.CHART_FIBON_ARC;
    this.TOOLTIP_FIBON_RETRACE = Tooltips.CHART_FIBON_RETRACE;
    this.TOOLTIP_FIBON_TIMEZONE = Tooltips.CHART_FIBON_TIMEZONE;
    this.TOOLTIP_FIBON_FAN = Tooltips.CHART_FIBON_FAN;
    this.TOOLTIP_GANFAN_UP = Tooltips.CHART_GANFAN_UP;
    this.TOOLTIP_GANFAN_DOWN = Tooltips.CHART_GANFAN_DOWN;
    this.TOOLTIP_TEXT = Tooltips.CHART_TEXT;
    this.TOOLTIP_DELETE = Tooltips.CHART_DELETE;
    this.TOOLTIP_DELETE_ALL = Tooltips.CHART_DELETE_ALL;
    this.TOOLTIP_HOKA_TEKIYOU = Tooltips.CHART_HOKA_TEKIYOU;
    this.TOOLTIP_OBJECT_COLOR = Tooltips.CHART_OBJECT_COLOR;
    this.TOOLTIP_WiNDOW_VIEW = Tooltips.CHART_WiNDOW_VIEW;

  }

  ngOnInit() {
    super.ngOnInit();

		this.didSetInitialValue();

    this.didUpdateRequestData(true);

    // #2566
    this.selectedTrendLine = 'TL0001';
    this.onTrendLineIconClicked('TL0001');
    
    // #2732, #2925
    this.notifySubscribe.push(
      this.panelMng.onChannelEvent().subscribe(
        (val) => {
          console.debug("[#2925] onChannelEvent => " + JSON.stringify(val));

          if (val.channel == ChartConst.CHANNEL_EVENT_OPEN_TECHNICAL_VIEW) {
            this.isTechnicalActionDisabled = true;

            // #3440
            this.panelMng.setChartTechSettingStatus(true);
            //
          }
          else if (val.channel == ChartConst.CHANNEL_EVENT_ON_OPEN_TECHNICAL) {
            if (!val.arg || !val.arg.ownerId) {
              this.isTechnicalActionDisabled = false;
            }
            else if (val.arg.ownerId != this.ownerId) {
              this.isTechnicalActionDisabled = false;
            }

            // #3440
            this.panelMng.setChartTechSettingStatus(false);
            //
          }
          else if (val.channel == ChartConst.CHANNEL_EVENT_ON_CLOSE_TECHNICAL) {
            this.isTechnicalActionDisabled = false;
          }

          this.updateView();
          // if (val.channel == ChartConst.CHANNEL_EVENT_ON_CLOSE_TECHNICAL) { // #2994
          //   this.isTechnicalActionDisabled = false;
          // } else if (val.channel == ChartConst.CHANNEL_EVENT_ON_OPEN_TECHNICAL) { // #2994
          //   this.isTechnicalActionDisabled = true;
          // }
          // this.updateView();
        }));
    // [end] #2732, #2925
  }

  ngOnDestroy(){
    super.ngOnDestroy();
		this.notifySubscribe.forEach(s=>{
      s.unsubscribe();
    })
  }

	ngAfterViewInit() {
		setTimeout(()=>{
      if ($ && $.material) {
        $.material.init();
      }
    }, 10);

    // #3306 force stop scroll
    let $cont = $(this.element.nativeElement).find('.col-content-dark');
    $cont.on("scroll", ()=>{
      $cont.scrollTop(0);
    });    
	}

	/**
	 * get symbol control
	 * @return {[type]}
	 */
	private didGetSymbolControl() {
		let self = this;
		return(self.symbolCfdCtrl);
	}

	private didSetInitialValue() {
		let self = this;

		try {
			// let chartConfig:any = self.resource.didGetCurrentConfigAtTarget("chart") as any;
			self.timeInterval = "1";
			self.timeType = "1";//chartConfig.basicInfo.tbChartType;
			self.timeTypeInterval = self.timeType + "_" + self.timeInterval;

			// データが設定されていない場合は、初期状態にする
	    self.requestData = {} as ChartRequestData;
	    self.symbolCode = '';
	    self.marketCode = '';
			self.symbolName = '';
	    self.chartType  = CHART_TYPE_DEFAULT;
	    self.useOrderLine = false;
      self.usePositLine = false;
      self.useExecuLine = false;
      self.useAlertLine = false;
      // #2994, #3440
      if (self.panelMng.getChartTechSettingStatus() == true) {
        self.isTechnicalActionDisabled = true;
      }
      else {
        self.isTechnicalActionDisabled = false;
      }
      // [end] #2994, #3440
			/*
	    self.timeType = "0";
	    self.timeInterval = "1";
	    self.timeTypeInterval = "0_1";
			*/
		}
		catch(e) {
			console.log(e);
		}
  }

  private didChangeStateOfTheChartTypeAsTimeType() {
    let self = this;

    let chartType:string = self.chartType;
    if(self.timeType === ChartConst.TIME_TYPE_TICK) {
      self.isChartTypeDisable = true;
      self.isTechnicalDisabled = false; // #2271, #3519
      //self.chartType = CHART_TYPE_DEFAULT; // #2286
    }
    else {
      self.isChartTypeDisable = false;
      self.isTechnicalDisabled = false; // #2271
    }

    if(chartType != self.chartType) {
      return(true);
    }

    return(false);
  }

  /* ------ テンプレートから呼び出し ------ */

  /*
   * 銘柄コード変更イベントハンドラ
   */
  public onChangedSymbolCode(event: any) {
		let self = this;
    let symbolCtrl:any = self.didGetSymbolControl();

    console.log(symbolCtrl);
		/*
		if(event.data) {
			if(symbolCtrl) {
				symbolCtrl.onChangeViewData(event.data, this, false);
			}
		}
		else*/ {
			self.symbolCode = symbolCtrl.cfdSymbolCode;
      self.symbolName = symbolCtrl.cfdSymbolName;
      self.marketCode = "3";

			try {
				if(symbolCtrl) {
					symbolCtrl.updateSymbol(self.symbolCode, self.symbolName, false);
				}
			}
			catch(e) {
				console.error(e);
			}

			self.didUpdateRequestData(false, true);
		}
  }

  /*
   * 分足種別選択項目変更イベントハンドラ
   */
  public onTimeTypeChanged(event: any) {
    let self = this;
    self.timeTypeInterval = event.selected;

    // 分足の場合は、timeTypeIntervalを0にし、timeIntervalをセットする
    var timeTypeInterval = self.timeTypeInterval;
    self.timeType     = timeTypeInterval.substring(0, 1);
    self.timeInterval = timeTypeInterval.substring(2, timeTypeInterval.length);

    // #1567
    if(self.didChangeStateOfTheChartTypeAsTimeType()) {
      this.changeChartType.emit(this.chartType);
    }
    //

    this.didUpdateRequestData(false);
  }


  /*
   * テクニカルボタン クリックイベントハンドラ
   */
  public onTechnicalBtnClicked() {
    let self = this;
    self.isTechnicalActionDisabled = true;
    this.panelMng.fireChannelEvent(ChartConst.CHANNEL_EVENT_OPEN_TECHNICAL_VIEW, {ownerId:self.ownerId}); // #2732, #2994, #2925
    this.panelMng.setChartTechSettingStatus(true); // #3440
    this.showTechnical.emit();
  }

  /*
   * 情報アイコン クリックイベントハンドラ
   */
  public onInfoBtnClicked() {
    this.showInfoPanel.emit();
  }

  /*
   * チャートタイプ選択項目変更イベントハンドラ
   */
  public onChartTypeChanged(event:any) {
    this.chartType = event.selected;
    this.changeChartType.emit(this.chartType);
  }

  /*
   * トレンドラインアイコン　クリックイベントハンドラ
   */
  public onCrosslineIconClicked() {
    this.crosslineShow = !this.crosslineShow;
		this.changeCrosslineShow.emit(this.crosslineShow);
  }

  /*
   * トレンドラインアイコン　クリックイベントハンドラ
   */
  public onTrendLineIconClicked(trendLineCode:string, trendLineCodeToReset?:string) {
    this.trendLineCode.emit(trendLineCode);

    // #2300
    if(trendLineCodeToReset) {
      // #2566
      this.selectedTrendLine = trendLineCodeToReset;
      this.onTrendLineIconClicked(trendLineCodeToReset);
      //

      DetectChange(this.changeRef);
    }
    //
  }

  /*
   * オーダーラインボタン クリックイベントハンドラ
   */
  public onChartOrderLineBtnClicked() {
    this.useOrderLine = !this.useOrderLine;
    this.changeUseOrderLine.emit(this.useOrderLine);
  }

  /*
   * 建玉ラインボタン クリックイベントハンドラ
   */
  public onChartPositionLineBtnClicked() {
    this.usePositLine = !this.usePositLine;
    this.changeUsePositionLine.emit(this.usePositLine);
  }

  /*
   * 約定履歴ラインボタン クリックイベントハンドラ
   */
  public onChartExecutionLineBtnClicked() {
    this.useExecuLine = !this.useExecuLine;
    this.changeUseExecutionLine.emit(this.useExecuLine);
  }

  /*
   * アラートラインボタン クリックイベントハンドラ
   */
  public onChartAlertLineBtnClicked() {
    this.useAlertLine = !this.useAlertLine;
    this.changeUseAlertLine.emit(this.useAlertLine);
  }

  //
  //
  //
  /**
   * view dataの変更イベントを受信
   */
  public onChangeViewData( data:IViewData, sender:ViewBase, byChild:boolean ){
		let self = this;

    // update market list
    if( data.flag & CommonEnum.ViewDataFlag.SYMBOL ){
      if( data['symbol'] != undefined && self.symbolCode != data['symbol'] ){
        self.marketCode = data['market'];
        self.symbolCode = data['symbol'];
				self.symbolName = data['name'];


        //this.symbolName = data.symbolName;
        //this.updateMarketList( this.marketCode, this.symbolCode );
      }
    }

		//super.onChangeViewData(data, sender, byChild);
  }

  /*
   * 選択された銘柄、ChartTime、ChartTypeに合わせて、設定状態を初期化する
   * return chartType データが初期化されていない場合は、nullを返却
   */
  public initComponent(settingInfo?:ChartCFDRequestInfo) :string {
		let self = this;

    // 選択された銘柄、ChartTime、ChartTypeに合わせて、設定状態を初期化する
    if(settingInfo && settingInfo.symbolCode) {
      // console.log('initComponent',settingInfo);
      self.symbolCode = settingInfo.symbolCode;
      self.marketCode = settingInfo.marketCode;

      self.chartType = settingInfo.chartType;
      self.useOrderLine = settingInfo.useOrderLine;
      self.usePositLine = settingInfo.usePositLine;
      self.useAlertLine = settingInfo.useAlertLine;
      self.useExecuLine = settingInfo.useExecutionLine;

      self.timeType = settingInfo.timeType;
      self.timeInterval = settingInfo.timeInterval;
      self.timeTypeInterval = settingInfo.timeType + "_" + settingInfo.timeInterval;

      // #2271
      self.didChangeStateOfTheChartTypeAsTimeType();
      //

			self.requestData = {} as ChartRequestData;
			self.requestData.symbolCode   = self.symbolCode;
	    self.requestData.marketCode   = self.marketCode;
	    self.requestData.timeType     = self.timeType;
	    self.requestData.timeInterval = self.timeInterval;
	    self.requestData.dataCount    = null; // #2548

			let symbolCtrl:any = self.didGetSymbolControl();
			if(symbolCtrl) {
				symbolCtrl.updateSymbol(self.symbolCode, self.symbolName, false);
			}

      return this.chartType;
		}
		// #1392
		else {
			let symbolCtrl:any = self.didGetSymbolControl();
			if(symbolCtrl) {
				symbolCtrl.updateSymbol("", "", false);
			}
		}
		//

		this.didSetInitialValue();

    return null;
  }


  /* ------ 本クラス内で呼び出し ------ */

  private debugPrintRequestData() {
    console.log("Symbol(" + this.symbolCode + "), Market(" + this.marketCode + "), ")
  }

  private didUpdateRequestData(isInit:boolean, isSymbol?:boolean) {
		let self = this;

    // console.log('didUpdateRequestData',isInit);
    let isChanded = false;
    if(self.requestData === undefined || self.requestData == null) {
      self.requestData = {} as ChartRequestData;

      isChanded = true;
    }
    else {
      if(self.requestData.symbolCode !== self.symbolCode) {
        isChanded = true;
      }
      else if(self.requestData.marketCode !== self.marketCode) {
        isChanded = true;
      }
      else if(self.requestData.timeType !== self.timeType) {
        isChanded = true;
      }
      else if(self.requestData.timeInterval !== self.timeInterval) {
        isChanded = true;
      }
    }

    self.requestData.symbolCode   = self.symbolCode;
    self.requestData.marketCode   = self.marketCode;
    self.requestData.timeType     = self.timeType;
    self.requestData.timeInterval = self.timeInterval;
    self.requestData.dataCount    = null; // #2548

		self.requestData.triggeredSymbol	= isSymbol;

    if(isInit !== true && isChanded === true) {
      // console.log('didUpdateRequestData (isInit !== true && isChanded === true)');
      self.changeRequestData.emit(self.requestData);
    }

    return(isChanded);
  }

}
