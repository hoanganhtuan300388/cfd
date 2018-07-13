/**
 *
 * チャート
 *
 */
import { Component, ElementRef, ChangeDetectorRef, ViewChild } from '@angular/core';
import { PanelManageService, PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips } from '../../../core/common';

import { ChartCfdComponent } from '../../../component/chart-cfd/chart-cfd.component';
import { ChartSettingComponent } from '../../../component/chart-setting/chart-setting.component';

import { ChartRequestInfo, ChartRequestData, ChartSymbolInfo } from '../../../core/chartTypeInterface';
import * as ChartConst from '../../../const/chartConst';

// #1594
import { DialogService } from "ng2-bootstrap-modal";
import { ChartConfigComponent } from '../../../component/chart-config/chart-config.component';
import { ResourceService } from '../../../core/common';
import { IConfigSetting, IConfigChartTechnical } from '../../../core/configinterface';
import { DeepCopy, DetectChange } from '../../../util/commonUtil';

import * as ChartCFDConst from '../../../const/chartCFDConst';

import { IIndicaterInfo, ConvertToIndicatorInfo, ConvertToIConfigChartTechnical, ChartCFDRequestInfo } from '../../../core/chartCFDInterface';
//

// #2216
import { ConvertRequestOhlcTypeCodeToTimeinfo, IsShowDisplaySetting } from '../../../core/chartCFDInterface';
import { IConfigChartDisplaySettings, IConfigChartColorSettings } from '../../../core/configinterface';
//

// #2019
import { ChartInfoPanelComponent } from '../../../component/chart-info-panel/chart-info-panel.component';
//
import {LocalStorage} from '../../../util/utils';
// #1952
const electron = (window as any).electron;

// #2023
import * as values from "../../../values/values";
import { Deferred } from "../../../util/deferred";
import { TitleBarComponent } from '../../../component/title-bar/title-bar.component'; // #2925

export const DEFAULT_TIME_TYPE:string = '1'; // #1446
export const DEFAULT_TIME_INTERVAL:string = '1';
//
const TECH_CONFIG_WIDTH   = 720;
const TECH_CONFIG_HEIGHT  = 480;


// チャート保存情報
export interface IChartLoadChildInfo {
  componentId:number;
  settingInfo:ChartCFDRequestInfo;
  inidicatorInfoJson:any;

	isLoaded:boolean;
}
export interface IChartLoadInfo {
	focusingIdx:number;
  matrixTypeId:string;
  infos:Array<IChartLoadChildInfo>;
	remainCount:number;
}

export interface IChartSaveOption {
	 timeType: string;
	 timeInterval: string;
	 useOrderLine: boolean;
   usePositLine: boolean;
   useAlertLine: boolean;
   useExecutionLine: boolean;
	 seriesInfo: any;
};
//

//-----------------------------------------------------------------------------
// COMPONENT : Scr03030600Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03030600',
  templateUrl: './scr-03030600.component.html',
  styleUrls: ['./scr-03030600.component.scss']
})
export class Scr03030600Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------

  // ----- 設定（画面上）
  @ViewChild('Setting') chartSetting: ChartSettingComponent;

  @ViewChild('chart') chartRef:ChartCfdComponent;

  // ----- 四本値情報パネル
  @ViewChild('InfoPanel') chartInfoPanel: ChartInfoPanelComponent; // #2019

  // #2925
  @ViewChild('titleBar') titleBar: TitleBarComponent;

  /* ------ テンプレートから使用される ------ */
  // テクニカル設定表示可否
  public isTechnicalDisabled:boolean = false;
  // 設定の有効、無効
  public isSettingDisabled:boolean = false;
  // テクニカル選択表示/非表示切り替え
  public isTechnicalVisible:boolean = true;  //最適化作業
  // 情報パネル表示/非表示切り替え
  public isInfoPanelVisible:boolean = false;  //最適化作業
  // 編集パネル表示/非表示切り替え
  public isEditPanelVisible:boolean = false;  //最適化作業
  /* 設定の右側のメニューを表示するか */
  public isRightMenuVisible:boolean = true;

  public  setting:IConfigSetting;  // clone config setting
  private origin:IConfigSetting;   // orgin config setting

  public modal:any;

  // 子コンポーネント（チャート）からの通知種別
  private notifyType = {
    afterInit: -1,
    dataView : 3,
  };

  // 遷移元からのproductCode
  private senimotoProductCode:string = '';
  private senimotoTimeInfo:string = ''; // #2266

  // 基本銘柄コード
  private defaultProductCode:string = ''; // #2216

  // チャートの保存情報
  private loadedChartInfo:IChartLoadInfo = {} as IChartLoadInfo;

  // #2030
  private inidicatorInfoJson:string;

  // #3101
  private notificationSubscriptionForSetting:any;

  // #2925
  // subscribed list
  private notifySubscribe = [];
  //

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public element: ElementRef,
               public changeRef:ChangeDetectorRef,
               public dialogService:DialogService,
               public resource:ResourceService ) {
    super( '03030600', screenMng, element, changeRef);

    var temp = JSON.stringify(resource.config.setting);

    // clone
    this.origin  = JSON.parse(temp);
    this.setting = JSON.parse(temp);
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------

  ngOnInit() {
    super.ngOnInit();

    // #2732, #2925
    let self = this;
    // #3440
    if(self.panelMng.getChartTechSettingStatus() == true) {
      self.titleBar.didSetDisableExport(true);
    }
    else {
      self.titleBar.didSetDisableExport(false);
    }
    self.updateView();
    // [end] #3440
    
    this.notifySubscribe.push(
      this.panelMng.onChannelEvent().subscribe(
        (val) => {
          console.debug("[#2925] onChannelEvent => " + JSON.stringify(val));

          let titleBarDisabled:boolean;
          if (val.channel == ChartConst.CHANNEL_EVENT_OPEN_TECHNICAL_VIEW) {
            titleBarDisabled = true;

            if (val.arg && val.arg.ownerId && val.arg.ownerId != self.uniqueId) {
              if (self.modal && self.modal.hide) {
                self.modal.hide();
              }
            }
          }
          else if (val.channel == ChartConst.CHANNEL_EVENT_ON_OPEN_TECHNICAL) {
            if (!val.arg || !val.arg.ownerId) {
              titleBarDisabled = false;
            }
            else if (val.arg.ownerId != self.uniqueId) {
              titleBarDisabled = false;
            }
          }
          else if (val.channel == ChartConst.CHANNEL_EVENT_ON_CLOSE_TECHNICAL) {
            titleBarDisabled = false;
          }

          if(titleBarDisabled !== undefined && titleBarDisabled != null) {
            self.titleBar.didSetDisableExport(titleBarDisabled);
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

  // #3101
  ngOnDestroy() {
    super.ngOnDestroy();

    let self = this;
    if (self.notificationSubscriptionForSetting && self.notificationSubscriptionForSetting.unsubscribe) {
      self.notificationSubscriptionForSetting.unsubscribe();
    }
    self.notificationSubscriptionForSetting = undefined;

    // #2925
    self.notifySubscribe.forEach(s => {
      s.unsubscribe();
    });
    //
  }
  //

  ngAfterViewInit() {
    super.ngAfterViewInit();

    let self = this;
    self.didRegistNotifyMethodToChart();

    // #2321, #3101
    self.notificationSubscriptionForSetting = self.resource.onChangeConfig().subscribe(
			(val) => {
				if(val) {
					let displaySettings:IConfigChartDisplaySettings = self.resource.config.setting.chartDisplay.chartSettings;

          self.isInfoPanelVisible = IsShowDisplaySetting(displaySettings.detailPriceDisplay); // #2321

          DetectChange(self.changeRef);
				}
			});
    
    // #3247 for MAC
    if(electron){
      let win = electron.remote.getCurrentWindow();
      win.on('moved', (event,arg)=>{
        this.onResizing(null);
      });  
    }

    // #3306 force stop scroll
    let $cont = $(this.element.nativeElement).find('.panel-body-chart');
    $cont.on("scroll", ()=>{
      $cont.scrollTop(0);
    });      
  }

  onResizing($event){
    super.onResizing();
    let self = this;
    self.didResize();
  }

  onResized($event){
    let self = this;
    self.didResize();
  }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------

  private didResize() {
    if(this.chartRef) {
      this.chartRef.didResizeComponent();
    }
  };

  protected didGetChartSettingComponent() : ChartSettingComponent {
		let self = this;
		return(self.chartSetting);
	}

  //
  // chart-setting EventEmitter
  //

  /**
   * チャートのデータリクエスト情報が変更された時に呼ばれるメソッド
   * @param  {ChartRequestData} requestData
   * @return {[type]}
   */
  public changeRequestDataFromSetting(requestData:ChartRequestData) {
    let self = this;

    if(!requestData) {
      return;
    }

		if(requestData.triggeredSymbol === true) {
			if(self.groupId > 0) {
				let data:IViewData = {} as IViewData;
				data.flag = CommonEnum.ViewDataFlag.BROADCAST | CommonEnum.ViewDataFlag.SYMBOL;
        data.groupId = self.groupId;
				data.symbol = requestData.symbolCode;
				data.market = requestData.marketCode;
        self.panelMng.broadcastViewData( data, self );
			}
		}

    let _realComponent = self.chartRef;
    if(_realComponent && _realComponent.didRequestChartDataFromSettingCFD) {
      // #2023
      let requestInfo:ChartCFDRequestInfo = _realComponent.didGetChartRequestInfo();
      let useOption:any = {
        useOrderLine : requestInfo.useOrderLine,
        usePositLine : requestInfo.usePositLine, // #3221
        useAlertLine : requestInfo.useAlertLine,
        useExecutionLine : requestInfo.useExecutionLine,
      };

      // #2256
      let def: Deferred<any> = new Deferred<any>();
      let subscription = def.asObservable().subscribe(
        val => {
              // 受信したリクエスト情報はここでアップデートされる。
          try {
            if (val && val.componentIndex !== undefined && val.componentIndex != null) {
              // 銘柄情報が取得できた場合は、チャート初期化成功として非活性の設定を解除する
              if (val.symbolCode && val.symbolCode.length > 0) {
                self.isSettingDisabled = false;
              }

              self.setTitle(CommonConst.PANEL_TITLE_CHART, val.symbolName);
            }
          }
          catch (e) {
            console.error(e);
          }

          // #1439
          self.didCallDetectChange();
          //
        }
      );
      //

      _realComponent.didRequestChartDataFromSettingCFD(0, requestData, def, null, useOption);
    }
  }

  public onTriggerApplyTrendline(trendLineCode:string) {
		if(trendLineCode === undefined || trendLineCode == null || trendLineCode === "") {
			return;
		}

		var isAll = true;

		try {
			if(trendLineCode.toUpperCase() === "TL9999") {
				isAll = false;
			}
		}
		catch(e) {
			console.error(e);

			return;
    }

    let self = this;
    let _realComponent = self.chartRef;
    if(_realComponent && _realComponent.didApplyTrendline) {
      this.chartRef.didApplyTrendline(trendLineCode, false);
    }
  }

  /*
   * チャート種別変更
   * @param chartType
   */
  public changeCrosslineShowFromSetting = (isUse:boolean) => {
    let self = this;
    let _realComponent = self.chartRef;
    if(_realComponent && _realComponent.didChangeCrosslineShow) {
      this.chartRef.didChangeCrosslineShow(isUse);
    }
  }

  /*
   * チャート種別変更
   * @param chartType
   */
  public changeChartTypeFromSetting = (chartType:any) => {
    let self = this;
    let _realComponent = self.chartRef;
    if(_realComponent && _realComponent.didChangeChartType) {
      this.chartRef.didChangeChartType(chartType);
    }
  }

  /*
   * ポジションライン変更
   * @param chartType
   */
  public changeUseOrderLineFromSetting = (isUse:boolean) => {
    let self = this;
    let _realComponent = self.chartRef;
    if(_realComponent && _realComponent.didChangeUseOrderLine) {
      var ret = _realComponent.didChangeUseOrderLine(isUse);
      // console.log("_realComponent.changeUseOrderLineFromSetting result " + ret);
    }
  }

  /*
   * ポジションライン変更
   * @param chartType
   */
  public changeUsePositLineFromSetting = (isUse:boolean) => {
    let self = this;
    let _realComponent = self.chartRef;
    if(_realComponent && _realComponent.didChangeUsePositLine) {
      var ret = _realComponent.didChangeUsePositLine(isUse);
      // console.log("_realComponent.didChangeUsePositLine result " + ret);
    }
  }

  /*
   * 約定履歴ライン変更
   * @param chartType
   */
  public changeUseExecutionLineFromSetting = (isUse:boolean) => {
    let self = this;
    let _realComponent = self.chartRef;
    if(_realComponent && _realComponent.didChangeUseExecutionLine) {
      var ret = _realComponent.didChangeUseExecutionLine(isUse);
      // console.log("_realComponent.didChangeUseExecutionLine result " + ret);
    }
  }

  /*
   * アラートライン変更
   * @param chartType
   */
  public changeUseAlertLineFromSetting = (isUse:boolean) => {
    let self = this;
    let _realComponent = self.chartRef;
    if(_realComponent && _realComponent.didChangeUseAlertLine) {
      var ret = _realComponent.didChangeUseAlertLine(isUse);
      // console.log("_realComponent.didChangeUseExecutionLine result " + ret);
    }
  }

  private didGetCurrentTechnicalSettingInfo = (chartTech:IConfigChartTechnical, toObject?:boolean) => {
    if(!chartTech) {
      return;
    }

    let self = this;
    let chartTechnical = ConvertToIndicatorInfo(chartTech, true);
    chartTechnical.isSave = false;
    chartTechnical.isAll  = true;
    console.log("didGetCurrentTechnicalSettingInfoAsJSON ===================================");
    console.log(chartTechnical);

    if(toObject) {
      return(chartTechnical);
    }

    return(JSON.stringify(chartTechnical));
  }

  private didApplyTechnicalSetting = (argInfo:any) => {
    let self = this;
    let result:any = argInfo;
    if(result.config) {
      self.setting.chartTech = result.config;

      let inidicatorInfoJson:string = self.didGetCurrentTechnicalSettingInfo(self.setting.chartTech);
      console.log("didApplyTechnicalSetting ===================================");
      console.log(inidicatorInfoJson);

      self.didSetCurrentIndicatorInformationAll(inidicatorInfoJson);
    }
  }

  private didSetCurrentIndicatorInformationAll(inidicatorInfoJson:string) {
    if(inidicatorInfoJson === undefined || inidicatorInfoJson == null || inidicatorInfoJson == "") {
      return;
    }

    let self = this;
    let _realComponent = self.chartRef;
    if(_realComponent) {
      _realComponent.didSetCurrentIndicatorInformationAll(inidicatorInfoJson);
    }
  }

  // monitor's center position
  private calcMonitorPosition(){
    let cursor = electron.screen.getCursorScreenPoint();
    let disp   = electron.screen.getDisplayNearestPoint(cursor);

    let left = disp.workArea.x + ((disp.workArea.width/2) - (TECH_CONFIG_WIDTH/2));
    let top  = disp.workArea.y + ((disp.workArea.height/2) - (TECH_CONFIG_HEIGHT/2));

    return {left:left, top:top};
  }

  /**
   *
   */
  public showTechnicalWindowFromSetting = (event:any) => {
    let self   = this;

    let chartSettingComponent:ChartSettingComponent = self.didGetChartSettingComponent();

    let _realComponent = self.chartRef;
    if(_realComponent && _realComponent.didGetCurrentIndicatorInformationAll) {
      try {
        var ret    = _realComponent.didGetCurrentIndicatorInformationAll(false, true);
        //var helper = WindowHelper.getInstance();
        var helper = electron.remote.require('./main');
        var win    = helper.WindowHelper.getInstance();
        self.setting.chartTech = ConvertToIConfigChartTechnical(ret);

        // #2925
        let paramData  = {
          config : self.setting.chartTech,
          isPageDisabled:true,
          ownerId: self.uniqueId
        };
        //

        let param  = paramData;
        let pos    = self.calcMonitorPosition();

        self.modal = win.openWindow('03030601', pos.left, pos.top, TECH_CONFIG_WIDTH, TECH_CONFIG_HEIGHT, {params:param,
          callback : (val) => {
            if(val) {
              self.didApplyTechnicalSetting(val);

              if(val.close == true) {
                self.modal.close();
              }
            }
            // #2479
            else {
              self.modal.close();
            }
            //
          },
          // #2408, #2905:remove
          // modal:true,
          // parentWindow:electron.remote.getCurrentWindow()
          //
        });

        // #2905
        // if(self.modal && self.titleBar) {
        //   self.titleBar.didSetDisableExport(true);
        // }
        //

        self.modal.on('closed', () => {
          this.titleBar.didSetDisableExport(false); // #2905

          this.modal = null;

          if (chartSettingComponent) {
            chartSettingComponent.isTechnicalActionDisabled = false;
            DetectChange(self.changeRef);
          }
          // this.screenMng.fireChannelEvent(ChartConst.CHANNEL_EVENT_ON_CLOSE_TECHNICAL, {}); // #2732, #2994
        })
      }
      catch(e) {
        console.error(e);
      }
    }
  }

  public showTechnicalFromSetting = () => {
    let self = this;

    let _realComponent = self.chartRef;
    if(_realComponent && _realComponent.didGetCurrentIndicatorInformationAll) {
      var ret = _realComponent.didGetCurrentIndicatorInformationAll(false, true);
      console.log("showTechnicalFromSetting ===================================");
      console.log(JSON.parse(ret));

      if(self.dialogService) {
        self.setting.chartTech = ConvertToIConfigChartTechnical(ret);
        let params = { config : self.setting.chartTech };
        let disposable = self.dialogService.addDialog(ChartConfigComponent, params);
        disposable.subscribe((val) => {
          if(val) {
            self.didApplyTechnicalSetting(val);
          }
        });
      }
      // console.log("_realComponent.didChangeUseExecutionLine result " + ret);
    }

  }

  // #2019
  private didRegistNotifyMethodToChart() {
    let self = this;
    if(self.chartRef && self.chartRef.didRegistNotifyMethod) {
      self.chartRef.didRegistNotifyMethod(self.onNotifyDataFromChartComponent);
    }
  }

  protected didGetChartInfoPanelComponent() : ChartInfoPanelComponent {
		let self = this;
		return(self.chartInfoPanel);
	}

  /**
   *
   * @param notifyData
   */
  private onNotifyDataFromChartComponent = (notifyData:any) => {
		let self = this;

		if(!notifyData) {
			//console.debug("[LOG:CPVB] (NotifyDataFrom) notify data is empty");
			return;
		}

    //console.debug("[LOG:CPVB] (NotifyDataFrom) notify data is came. => " + notifyData.type);
    //console.log(notifyData);
    if(notifyData && typeof notifyData === "object") {
      //
      // Data view
      //
      if(notifyData.type === self.notifyType.dataView) {
        // console.log(notifyData.data);

        // 情報パネル表示中なら内容を反映
        if (self.isInfoPanelVisible) {
					let chartInfoPanelComponent:ChartInfoPanelComponent = self.didGetChartInfoPanelComponent();
					if(chartInfoPanelComponent) {
            // #2303
            try {
              let xRcc = self.chartRef;
              let requestInfo:ChartCFDRequestInfo = xRcc.didGetChartRequestInfo() as ChartCFDRequestInfo;
              chartInfoPanelComponent.updateInfo(notifyData.data, requestInfo.timeType);
            }
            catch(e) {
              console.error(e);
            }
            //
					}
        }
      }

      return;
    }
  }


  /*
   * 情報パネルの表示・非表示を切り替える
   */
  public toggleShowInfoPanelFromSetting = (event:any) => {
    this.isInfoPanelVisible = !this.isInfoPanelVisible;

    // #2308
    let self = this;
    DetectChange(self.changeRef);
    //
	}

	/*
   * 情報パネルの表示を切り替える
   */
  public closeInfoPanelFromInfo = (event:any) => {
    this.toggleShowInfoPanelFromSetting(event);

    // #2308
    let self = this;
    let xRcc = self.chartRef;
    if(xRcc && xRcc.didClosedInfoPanel) {
      xRcc.didClosedInfoPanel();
    }
    //
  }
  //

  // #2023
  /**
   * layout復元
   *
   * @param param
   */
  protected initLayout(param:any){
    super.initLayout(param);

		let self = this;

    var rowSize = 0;

    let layoutInfo;
    let fromSave:boolean = false;

    let initFoot:string;

    // #2023
    if(param.layout) {
      if(param.layout.option && param.layout.option.linked === true) {
        fromSave = false;
        self.senimotoProductCode = param.layout.productCode;
        initFoot = param.layout.option.initFoot; // #2266
      }
      else {
        fromSave = true;
        layoutInfo = param.layout;
      }
    }
    else {
      self.senimotoProductCode = param.productCode;
    }

    // #2216
    let xCic:IChartLoadChildInfo = self.didLoadChartDefaultStyle(initFoot); // #2266

    // #2030
    let inidicatorInfoJson:string = self.didGetCurrentTechnicalSettingInfo(self.setting.chartTech);
    self.inidicatorInfoJson = inidicatorInfoJson;

    //
    self.didLoadChartInfo(layoutInfo, fromSave, xCic);

    // #2030
    self.didSetCurrentIndicatorInformationAll(self.inidicatorInfoJson);

    // #2023: restore size
    self.didResize();
  }

  // #2216
  private didLoadChartDefaultStyle = (argInitFoot?:string) => {
		let self = this;
		let xCic:IChartLoadChildInfo = {} as IChartLoadChildInfo;

		xCic.settingInfo	= {} as ChartCFDRequestInfo;
		xCic.isLoaded	  = false;

		let chartRequestInfo:ChartCFDRequestInfo = xCic.settingInfo;
    self.didSetDefaultChartRequestInfo(chartRequestInfo);

    let displaySettings:IConfigChartDisplaySettings = self.resource.config.setting.chartDisplay.chartSettings;

    chartRequestInfo.symbolCode 	= displaySettings.initProduct;
    // #2266
    let timeInfos:any = ConvertRequestOhlcTypeCodeToTimeinfo(argInitFoot);
    if(!timeInfos) {
      timeInfos = ConvertRequestOhlcTypeCodeToTimeinfo(displaySettings.initFoot);
    }
    //
    if(timeInfos) {
      chartRequestInfo.timeType			= timeInfos.timeType;
      chartRequestInfo.timeInterval	= timeInfos.timeInterval;
    }

    chartRequestInfo.useOrderLine	    = IsShowDisplaySetting(displaySettings.orderLineDisplay);
    chartRequestInfo.usePositLine	    = IsShowDisplaySetting(displaySettings.positionDisplay);
    chartRequestInfo.useAlertLine	    = IsShowDisplaySetting(displaySettings.alertLineDisplay);
    // #3451
    // chartRequestInfo.useExecutionLine = IsShowDisplaySetting(displaySettings.executionDisplay);
    // [end] #3451

    self.isInfoPanelVisible           = IsShowDisplaySetting(displaySettings.detailPriceDisplay); // #2321

    DetectChange(self.changeRef);

		return(xCic);
  }
  //

  /**
	 * [if description]
	 * @param  {[type]} layoutInfo===undefined||layoutInfo==null
	 * @return {[type]}
	 */
	private didLoadChartInfo = (layoutInfo:any, fromSave:boolean, xCic?:IChartLoadChildInfo) => {
		let self = this;
		if(layoutInfo === undefined || layoutInfo == null) {
				layoutInfo = {};
    }

    if(fromSave !== true) {
      // #2216
      if(xCic && xCic.settingInfo && xCic.settingInfo.symbolCode) {
        layoutInfo.productCode = xCic.settingInfo.symbolCode;
        layoutInfo.__xCic = xCic;
      }
      //

      if(self.senimotoProductCode) {
        layoutInfo.productCode = self.senimotoProductCode;
      }

      if(!layoutInfo.productCode) {
				return;
      }
		}

		try {
			self.loadedChartInfo = {} as IChartLoadInfo;

			//
			self.loadedChartInfo.infos = [];

      let childItem:IChartLoadChildInfo = self.didLoadChartInfoChild(layoutInfo);
      childItem.componentId = 0;

      self.loadedChartInfo.infos.push(childItem);
      self.loadedChartInfo.remainCount = 1;

      self.didApplyLoadedDataAt(self.chartRef);
		}
		catch(e) {
			console.error(e);
		}
  }

  private didProcForAfterLoading() {
    // 画面上部の設定画面の内容をフォーカスされた銘柄に変更
    this.initSetting();
  }

  /*
   * 画面上部の設定の更新
   */
  private initSetting() {
		let self = this;
		let chartSettingComponent:ChartSettingComponent = self.didGetChartSettingComponent();
		if(!chartSettingComponent) {
			return;
    }
    
    // #2925
    chartSettingComponent.ownerId = self.uniqueId;

    // 表示時に情報を取得する
    let xCi = self.chartRef;
    if(xCi && xCi.didGetChartRequestInfo) {
      var chartType = chartSettingComponent.initComponent(xCi.didGetChartRequestInfo());

      // チャート情報が取得できない場合は初期化する
      if(chartType !== undefined && chartType != null) {
        self.isSettingDisabled = false;
        self.changeSettingStateByChartType(chartType);
      }
    }
  }

  /*
   * チャートタイプによって設定ボタンをdisabledにする
   */
  private changeSettingStateByChartType(chartType:string) {
  }

	protected didApplyLoadedDataAt(component:any) {
		if(!component) {
			//console.debug("[LOG:CPVB] (ApplyLoadedData) notify fail because component is empty.");
			return;
		}

		let self = this;
		if(self.loadedChartInfo === undefined || self.loadedChartInfo == null) {
			//console.debug("[LOG:CPVB] (ApplyLoadedData) notify fail because there is no load info.(1)");
			return;
		}

		if(self.loadedChartInfo.infos === undefined || self.loadedChartInfo.infos == null || self.loadedChartInfo.infos.length === undefined || self.loadedChartInfo.infos.length == null) {
			//console.debug("[LOG:CPVB] (ApplyLoadedData) notify fail because there is no load info.(2)");
			return;
		}

		let targetIdx:number = 0

		try {
			let nCount = self.loadedChartInfo.infos.length;

			if(nCount < 1 || targetIdx >= nCount) {
				//console.debug("[LOG:CPVB] (ApplyLoadedData) notify fail because target index is over limit.(" + targetIdx + ", " + nCount + ")");
				return;
			}

			let def: Deferred<any> = new Deferred<any>();
	    let subscription = def.asObservable().subscribe(
	      val => {
					try {
						let xCic = self.loadedChartInfo.infos[val.componentIndex]
						xCic.isLoaded = true;
					}
					catch(e) {
						console.error(e);
					}
					finally {
						self.loadedChartInfo.remainCount--;
						if(self.loadedChartInfo.remainCount < 1) {

							setTimeout(() => {
								self.didProcForAfterLoading();

								// clear
								self.loadedChartInfo = {} as IChartLoadInfo;
								subscription.unsubscribe();

                // #1446
                self.didCallDetectChange();
							}, 100);
						}
					}
				}
			);

			let xPcic = self.loadedChartInfo.infos[targetIdx];
			// console.log(xPcic);

			let requestData:ChartRequestData = {} as ChartRequestData;
			let requestInfo:ChartCFDRequestInfo = xPcic.settingInfo;

			requestData.symbolCode	= requestInfo.symbolCode;
			requestData.marketCode	= requestInfo.marketCode;
			requestData.timeType		= requestInfo.timeType;
      requestData.timeInterval= requestInfo.timeInterval;
      
      requestData.dataCount   = String(ChartConst.REQUEST_COUNT); // #2944, #2585

			//console.debug("[LOG:CPVB] (ApplyLoadedData) request with load info to (" + targetIdx + ")");
			//console.debug("[LOG:CPVB] (ApplyLoadedData) request data => " + JSON.stringify(requestData));
			//console.debug("[LOG:CPVB] (ApplyLoadedData) request info => " + JSON.stringify(requestInfo));
      //console.debug("[LOG:CPVB] (ApplyLoadedData) inidicatorInfoJson => " + xPcic.inidicatorInfoJson);

      let chartType:string    = requestInfo.chartType; // #2023

      let useOption:any = {
        useOrderLine : requestInfo.useOrderLine,
        usePositLine : requestInfo.usePositLine, // #2280
        useAlertLine : requestInfo.useAlertLine,
        useExecutionLine : requestInfo.useExecutionLine,
      };

			self.didRequestDataFromLoadedInfoCFD(targetIdx, requestData, def, chartType, useOption, xPcic.inidicatorInfoJson);
		}
		catch(e) {
			console.log(e);
		}
  }

  /**
   * チャートのデータリクエスト情報が変更された時に呼ばれるメソッド
   * @param  {ChartRequestData} requestData
   * @return {[type]}
   */
  private didRequestDataFromLoadedInfoCFD(index:number, requestData:ChartRequestData, notifier?:Deferred<any>, chartType?:string, useOption?:any, seriesInfo?:string) {
    let self = this;

    // 現在選択されているチャートを対象にする。
    let xRcc = self.chartRef;
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
              this.isSettingDisabled = false;
            }

            self.setTitle(CommonConst.PANEL_TITLE_CHART, val.symbolName); // #2256

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

  private didLoadChartInfoChild = (loadedInfo:any) => {
		let self = this;
		let xCic:IChartLoadChildInfo = {} as IChartLoadChildInfo;

		xCic.settingInfo	= {} as ChartCFDRequestInfo;
		xCic.isLoaded	  = false;

		let chartRequestInfo:ChartCFDRequestInfo = xCic.settingInfo;
		self.didSetDefaultChartRequestInfo(chartRequestInfo);

    chartRequestInfo.symbolCode 	= loadedInfo.productCode;

    // #2216
    if(loadedInfo.__xCic) {
      xCic.settingInfo.timeType               = loadedInfo.__xCic.settingInfo.timeType;
      xCic.settingInfo.timeInterval           = loadedInfo.__xCic.settingInfo.timeInterval;
      xCic.settingInfo.useOrderLine           = loadedInfo.__xCic.settingInfo.useOrderLine;
      xCic.settingInfo.usePositLine           = loadedInfo.__xCic.settingInfo.usePositLine;
      xCic.settingInfo.useExecutionLine       = loadedInfo.__xCic.settingInfo.useExecutionLine;
      xCic.settingInfo.useAlertLine           = loadedInfo.__xCic.settingInfo.useAlertLine;

      xCic.settingInfo.showGrid               = loadedInfo.__xCic.settingInfo.showGrid;
      xCic.settingInfo.showCurrentPrice       = loadedInfo.__xCic.settingInfo.showCurrentPrice;
      xCic.settingInfo.showDetailInfo         = loadedInfo.__xCic.settingInfo.showDetailInfo;
      xCic.settingInfo.showHighLowPrice       = loadedInfo.__xCic.settingInfo.showHighLowPrice;

      xCic.settingInfo.gridColor              = loadedInfo.__xCic.settingInfo.gridColor;
      xCic.settingInfo.positiveLineFillColor  = loadedInfo.__xCic.settingInfo.positiveLineFillColor;
      xCic.settingInfo.hiddenLineFillColor    = loadedInfo.__xCic.settingInfo.hiddenLineFillColor;
    }

		let convertedSetting = self.didConvertToSaveInfo(loadedInfo.chartSetting, false);
		if(convertedSetting) {
			chartRequestInfo.timeType			= convertedSetting.timeType;
			chartRequestInfo.timeInterval	= convertedSetting.timeInterval;

			chartRequestInfo.useOrderLine	    = convertedSetting.useOrderLine;
      chartRequestInfo.usePositLine	    = convertedSetting.usePositLine;
      chartRequestInfo.useAlertLine 	  = convertedSetting.useAlertLine;
      chartRequestInfo.useExecutionLine	= convertedSetting.useExecutionLine;

      chartRequestInfo.chartType        = convertedSetting.seriesInfo.chartType; // #2023

      // xCic.inidicatorInfoJson	= JSON.stringify(convertedSetting.seriesInfo);
      self.inidicatorInfoJson = JSON.stringify(convertedSetting.seriesInfo); // #2030
		}

		return(xCic);
  }

  protected didSetDefaultChartRequestInfo(chartRequestInfo:ChartRequestInfo) {
		if(chartRequestInfo) {
      chartRequestInfo.timeType			= DEFAULT_TIME_TYPE;
      chartRequestInfo.timeInterval	= DEFAULT_TIME_INTERVAL;
      chartRequestInfo.useOrderLine	= false;
      chartRequestInfo.usePositLine	= false;
		}
	}

  /**
	 * OVERRIDE : save layout
	 */
	public getLayoutInfo():values.ILayoutInfo{
		//
    let self = this;

    var result = super.getLayoutInfo();

    let xRcc = self.chartRef;
    if(xRcc && xRcc.didGetChartRequestInfo) {
      let settingInfo:ChartCFDRequestInfo = xRcc.didGetChartRequestInfo() as ChartCFDRequestInfo;
      let chartSetting:IChartSaveOption = {
        timeType : '0',
        timeInterval : '1',
        useOrderLine : false,
        usePositLine : false,
        useAlertLine : false,
        useExecutionLine : false,
        seriesInfo : undefined
      };

      if(settingInfo) {
        result.productCode = settingInfo.symbolCode;

        chartSetting.timeType	        = settingInfo.timeType;
        chartSetting.timeInterval	    = settingInfo.timeInterval;

        chartSetting.useOrderLine	    = settingInfo.useOrderLine;
        chartSetting.usePositLine	    = settingInfo.usePositLine;
        chartSetting.useAlertLine	    = settingInfo.useAlertLine;
        chartSetting.useExecutionLine	= settingInfo.useExecutionLine;

        let indiInfo = xRcc.didGetCurrentIndicatorInformationAll(true, false);
        chartSetting.seriesInfo = indiInfo;

        result.chartSetting = self.didConvertToSaveInfo(chartSetting, true);
      }
    }

		return result;
  }

  private didConvertToSaveInfo(saveInfo:any, encode:boolean, compress?:boolean) {
		if(!saveInfo) {
			return;
		}

		try {
			if(encode === true)  {
				let temp1 = JSON.stringify(saveInfo);
				let temp2 = temp1.replace(/\"/g, "'");
				let temp3;
        temp3 = temp2;

				return(temp3);
			}
			else {
				let temp1 = saveInfo;
				let temp2;
        temp2 = temp1;

				let temp3 = temp2.replace(/'/g, "\"");
				let temp4 = JSON.parse(temp3);
				return(temp4);
			}
		}
		catch(e) {
			console.error(e);
		}

		return(saveInfo);
  }

  protected didCallDetectChange() {
    let self = this;
    DetectChange(self.changeRef);
  }
}
