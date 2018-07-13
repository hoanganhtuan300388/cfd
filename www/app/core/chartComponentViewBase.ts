import { Component, OnInit, Input, ElementRef, Output, ViewChild, EventEmitter, HostListener, SimpleChange, ChangeDetectorRef } from '@angular/core';
import { PanelManageService, IViewData, IViewState, CommonEnum, CommonConst } from '../core/common';
import { ComponentViewBase } from '../core/componentViewBase';
import { ViewBase} from "../core/viewBase"
import { Observable } from 'rxjs/Rx';
import { TimeZoneInfos } from "../const/businessDatetimes";

import * as values from "../values/Values";
import * as ChartConst from '../const/chartConst';

import { GetProductTypeFromSymbolCode, DeepCopy, ConvertSimpleDateFromBusinessDate, FormatDate, GetDecimalPointFromMeigaraInfo } from "../util/commonUtil";

import { Deferred } from "../util/deferred";
import { ManagerService } from '../service/manager.service';

import { didCalcPrice, didConvertDate, didConvertTime, didConvertDatetimeFromServer, didGetTimeZoneInfo } from './chartTypeInterface';
import { StartingPoint, StartingPointForInput, ChartRequestData, ChartRequestInfo, ChartSymbolInfo } from './chartTypeInterface';
import { ITimeType } from './chartTypeInterface';
import { TimeZoneItem, TimeZoneInfo } from './chartTypeInterface';
import { OrderData, PositData } from './chartTypeInterface';
import { ChartData, ChartDeployData } from './chartTypeInterface';
import { GetChartChartTimeTypeCode, GetTimeTypeNameFromCode, GetChartTypeTitleFromTimeInfo } from './chartTypeInterface';
import { TIME_TYPE_CODES } from './chartTypeInterface';

// Transcation
import { ChartTransactionBaseHandler } from './chartTransactionBaseHandler';


declare var $:any;
declare var __utils__;

export function getDOMElementById(jobjParent, id) {
    var jqElem;

    if(jobjParent !== undefined) {
      jqElem = jobjParent.find('#' + id);
    }
    else {
      jqElem = $('#' + id);
    }

    var domElem = $(jqElem).get(0);

    return(domElem);
}

export class ChartComponentViewBase extends ComponentViewBase implements OnInit {
	// selected this. event
	@Output() selected = new EventEmitter();

  // /* 銘柄コード */
  protected symbolCode:string;

  /* lib/ngc/screenChart.js */
  protected chart:any = null;

  protected registNotifyMethod:any = null;

  protected notifyType = {
		afterInit: -1,
    orderAndPosition : 0,
    deletingIndicator : 1,
    focusing : 2,
    dataView : 3,
		error : 4,
		trendLine : 5,
		newOrder : 6,
		cancelOrder : 7,
		executionOrder : 8
  };

  //
  // added by choi sunwoo at 2017.03.31 for #591
  protected isShowChildElement:boolean = false;

  protected chartDeployData:ChartDeployData = {} as ChartDeployData;

	// Order list
	protected orderHistoryItem: any[] = [];

	// Transcation
	protected oepSh:ChartTransactionBaseHandler;
	protected oepShSubscription:any;

	protected mainSh:ChartTransactionBaseHandler;
	protected mainShSubscription:any;

	// Notification
	protected notificationSubscription:any;

	// 足種別
  protected timeTypeCodes:Array<ITimeType> = TIME_TYPE_CODES;

	// FIXME: DEBUG
	protected DEBUG_REAL_STOP:boolean = false;

  //
  constructor( public panelMng: PanelManageService,
							 public element: ElementRef,
							 protected managerService:ManagerService,
							 public changeRef:ChangeDetectorRef) {
    super(panelMng, element, changeRef);
  }

	protected didInitTransactionHandler() {
		let self = this;

		self.didInitMainTransactionHandler();
		self.didInitOepTransactionHandler();
	}

	protected didInitNotification() {
		let self = this;

		self.didInitOepNotification();
	}

  didInitChart() {
		let self = this;
		var __jqElem = self.getChartWrapperJqElement();

    var __ngcFactory = $.ngcModule.getNGCFactory();
    if(__jqElem !== undefined && __jqElem != null && __ngcFactory !== undefined && __ngcFactory != null) {
      //----- lib/ngc/screenFactory.js
      var __factory = __ngcFactory.getScreenFactory();

      //----- lib/ngc/screenChart.js
      var elementId = "";// + __screenManager.count();
      var __scrChart = __factory.getScreenChart(elementId);

      //----- lib/screen.js(parent) -> method
      //----- lib/ngc/chartWrap.js
      __scrChart.method.m_chartWrap = __ngcFactory.getChartWrap(__scrChart);

      //----- jQueryElement <div id="eidChart_part" class="" style="height: 100%">...</div>
      //var __jqElem = $(this.wrapperChart.nativeElement);
      var __jqTarget = __jqElem.find('#eidChart_part');

      __scrChart.method.attachToTarget(__jqTarget);
      // ----- event〝m_chartWrap(chartWrapper)を初期化
      __scrChart.didInitScreen(self.getDefaultEnv());

      var argScreen = __jqElem;

      //----- lib/ngc/chartDataConverter.js
      var __scrEV_CRT = __ngcFactory.getChartDataConverter();
      var __domElemEV_CRT = getDOMElementById(argScreen, 'eidSymbolControl');
      __scrEV_CRT.didInitialize($(__domElemEV_CRT), __scrChart.method.m_chartWrap);
      __scrChart.method.m_chartWrapDataConverter = __scrEV_CRT;

      this.didSetChart(__scrChart);
    }
  }

	/**
	 * #1170 : 注文通知
	 */
	didInitOepNotification() {
		let self = this;
		let businessService:any = self.didGetBusinessService();
		if(businessService && businessService.getOrderNotification) {
			self.notificationSubscription = businessService.getOrderNotification().subscribe(
				val => {
					self.didProcForOepNotification(val);
				},
				err => {
					//console.log(err);
				},
				() => {}
			);
		}
	}

	didInitOepTransactionHandler() {
		let self = this;
		self.oepSh = self.didCreateOepTransactionHandler(self.managerService);
    if(self.oepSh) {
		self.oepShSubscription = self.oepSh.didGetObserver().subscribe(
			val => {
				if(val) {
					////console.debug("[LOG:CCVB] orderHistoryItem: \n");
					//console.debug(val);
					//this.createRowData(this.symbolStockCode,this.dateFrom,this.dateTo);
					try {
						self.didReceiveOepDataFromServer(val.receiveDatas, val.isOrder);
					}
					catch(e) {
						console.error(e);
					}
				}
			}
		);
	}
	}

	protected didInitMainTransactionHandler() {
		let self = this;
		self.mainSh = self.didCreateMainTransactionHandler(self.managerService);
    if(self.mainSh) {
		self.mainShSubscription = self.mainSh.didGetObserver().subscribe(
			val => {
				if(val) {
					if(val.type === ChartConst.NOTIFY_TYPE_SYMBOLINFO) {
						if(val.deployData) {
							self.didSetChartDeployDataFrom(val.deployData);
						}

						if(val.def) {
							val.def.next(val.info);
							val.def.complete();
						}
					}
					else if(val.type === ChartConst.NOTIFY_TYPE_HISTORY) {
						if(val.receiveRawData && val.deployData) {
							var __requestInfo = val.deployData.receiveInfo;

							self.didRecvChartDataFromServer(val.receiveRawData, __requestInfo, false, val.timeZoneInfo);
						}
					}
					else if(val.type === ChartConst.NOTIFY_TYPE_HISTORY_NEXT) {
						if(val.receiveRawData && val.deployData) {
							var __requestInfo = val.deployData.receiveInfo;

							self.didRecvChartDataFromServer(val.receiveRawData, __requestInfo, true);
						}
					}
					else if(val.type === ChartConst.NOTIFY_TYPE_AFTER_HISTORY) {
						if(val.uniqueId === 0) {
							self.didDoStepAfterRecevingHistory(val.securityCode, val.seriesInfo);
						}
					}
					else if(val.type === ChartConst.NOTIFY_TYPE_REAL) {
						if(val.receiveRawData) {
							self.didRecvChartRealDataFromServer(val.receiveRawData);
						}
					}
					else if(val.type === ChartConst.NOTIFY_TYPE_BDATE_CHANGED) {
						if(val.businessDate) {
							self.didUpdateBusinessDate(val.businessDate, val.timeZoneInfo); // #3414
						}
					}
          // #1544
          else if(val.type === ChartConst.NOTIFY_TYPE_RESPONSE_ERROR) {
						self.didShowErrorMessage(val.code, val.message, val.reserved);
					}
          //
					// #2007
          else if(val.type === ChartConst.NOTIFY_TYPE_UPDATE_ASKBID) {
						self.didUpdateAskBidData(null, val.ask, val.bid, val.validFlag);
					}
          //
					
					////console.debug("[LOG:CCVB] orderHistoryItem: \n");
					//console.debug(val);
				}
			}
		);
	}
	}

	protected didProcForAfterContentInit() {

	}

	protected getChartWrapperJqElement() : any {

	}

	protected getDefaultEnv() : string {
		return;
	}

	protected didGetMarketCode() : string {
		return("001");
	}

	protected didProcForNewOrder(argData:any) {

	}

	protected didProcForCancelOrder(argData:any) {

	}

	protected didProcForSettlement(argData:any) {

	}

	protected didProcForAmendOrder(argData:any) {

	}

	protected didCreateMainTransactionHandler(managerService:ManagerService) : any {
			return;
	}

  protected didCreateOepTransactionHandler(managerService:ManagerService) : any  {
			return;
	}

	protected didFinalizeTransaction() {
		let self = this;

		// Main
		if(self.mainShSubscription) {
			self.mainShSubscription.unsubscribe();
		}

		if(self.mainSh) {
			self.mainSh.didDestroy();
		}
		delete(self.mainSh);
		self.mainShSubscription = null;

		// Oep
		if(self.oepShSubscription) {
			self.oepShSubscription.unsubscribe();
		}

		if(self.oepSh) {
			self.oepSh.didDestroy();
		}
		delete(self.oepSh);
		self.oepShSubscription = null;
	}

	protected didFinalizeNotification() {
		let self = this;

		if(self.notificationSubscription) {
			self.notificationSubscription.unsubscribe();
		}

		self.notificationSubscription = undefined;
	}

  ngOnInit() {
    // clear chart deploy datas
    this.didClearChartDeployDatas(false, true);

    //
    super.ngOnInit();
  }

  /**
   * ディレクティブ・コンポーポントを破棄
   * @return {[type]}
   */
  ngOnDestroy() {
		super.ngOnDestroy();
		let self = this;
		self.prepareForRequestingData(true);

		self.didFinalizeTransaction();
  }

  ngAfterContentInit(){
		let self = this;
    //if (this.hasSymbolCode()) {
    self.didInitChart();
		self.didInitNotification();
		self.didInitTransactionHandler();

		let config:any = self.didGetConvertedChartConfig();

    if(self.chart !== undefined && self.chart != null) {
			if(config) {
				self.chart.didApplyChartSetting(config.chartConfig);
				self.chart.didApplyChartIndicatorPlotColorSetting(config.trend);
				self.chart.didApplyChartIndicatorPlotColorSetting(config.oscillator);
			}

      self.chart.OnResize();
    }

    if(self.registNotifyMethod) {
      setTimeout(function(){
        var notifyData = {
          type : self.notifyType.afterInit,
          notifier : self
        };
        self.registNotifyMethod(notifyData);
      }, 50);
  	}

		//
		self.didProcForAfterContentInit();
  }

  /**
   * view 状態変更イベント
   */
  public onChangeViewState( data:IViewState, sender:ViewBase, byChild:boolean ){
		let self = this;
    if(self.chart !== undefined && self.chart != null) {
			if(data.type === CommonEnum.ViewStateFlag.CHANGE) {
				let config = self.didGetConvertedChartConfig();
				self.chart.didApplyChartSetting(config.chartConfig);
				self.chart.didApplyChartIndicatorPlotColorSetting(config.trend);
				self.chart.didApplyChartIndicatorPlotColorSetting(config.oscillator);
			}

      self.chart.OnResize();
    }
  }

  /**
   * show child element
   * @param  {boolean} isShow
   * @return {[type]}
   */
  public didShowChildElement(isShow:boolean) {
    this.isShowChildElement = isShow;
  }
  //

  public didResizeComponent() {
    if(this.chart !== undefined && this.chart != null) {
      this.chart.OnResize();
    }
  }

	public didSetLoadInfoForTheLineTools(argInfo:any) {
		if(this.chart !== undefined && this.chart != null && this.chart.didSetLoadInfoForTheLineTools) {
      var result = this.chart.didSetLoadInfoForTheLineTools(argInfo);
      return(result);
    }
	}

  //
  public onSaveCurrentTrendlinesBtnClicked() {
    if(this.chart !== undefined && this.chart != null && this.chart.didGetSaveInfoOfTheLineTools) {
      var result = this.chart.didGetSaveInfoOfTheLineTools();
      return(result);
    }
  }

  public onTrendLineIconClicked(trendLineCode:string) {
    if(this.chart !== undefined && this.chart != null) {
      if(this.chart.method && this.chart.method.m_chartWrap && this.chart.method.m_chartWrap.didAddLineStudy) {
        this.chart.method.m_chartWrap.didAddLineStudy(trendLineCode);
      }
    }
  }

  /*
   * @param argMethod　通知用メソッド
   */
  public didRegistNotifyMethod(argMethod:any) {
    this.registNotifyMethod = argMethod;
  }

	protected didReflectMethodForNewOrder = (reflector, argData) => {
    let self = this;

		self.didProcForNewOrder(argData);
  }

	protected didReflectMethodForCancelOrder = (reflector, argData) => {
    let self = this;

		self.didProcForCancelOrder(argData);
				}

	protected didReflectMethodForExecutionOrder = (reflector, argData) => {
    let self = this;

		self.didProcForSettlement(argData);
	    }

  /**
   * @memberOf ChartStockComponent
   */
  protected didReflectMethodForOep = (reflector, argData) => {
    let self = this;

				if(argData) {
			if(argData.isOrder === true) {
				self.didProcForAmendOrder(argData);
					}
					else {
				self.didProcForSettlement(argData);
					}
				}
	    }

  /**
   * @memberOf ChartStockComponent
   */
  protected didReflectMethodForNofifyingEventAboutDeletedIndicator = (reflector, argData) => {
    let _self = this;

    if(_self.registNotifyMethod) {
      setTimeout(function(){
        var notifyData = {
          type : _self.notifyType.deletingIndicator,
          notifier : _self,
          reflector : reflector,
          data : argData
        };
        _self.registNotifyMethod(notifyData);
      }, 50);
    }
  }

  /**
   *
   * @memberOf ChartStockComponent
   */
  protected didReflectorForFocusing = (reflector) => {
    let _self = this;

    if(_self.registNotifyMethod) {
      setTimeout(function(){
        var notifyData = {
          type : _self.notifyType.focusing,
          notifier : _self,
          reflector : reflector,
          data : null
        };
        _self.registNotifyMethod(notifyData);
      }, 50);
    }
  }

  /**
   *
   *
   *
   * @memberOf ChartStockComponent
   */
  didReflectMethodForNofifyingEventDataViewInfo = (reflector, argData) => {
    let _self = this;

    if(_self.registNotifyMethod) {
      setTimeout(function(){
        var notifyData = {
          type : _self.notifyType.dataView,
          notifier : _self,
          reflector : reflector,
          data : argData
        };
        _self.registNotifyMethod(notifyData);
      }, 50);
    }
  }

	/**
	 * [if description]
	 * @param  {[type]} _self.registNotifyMethod
	 * @return {[type]}
	 */
  didReflectMethodForNofifyingEventError = (reflector, argData) => {
    let _self = this;

    if(_self.registNotifyMethod) {
      setTimeout(function(){
        var notifyData = {
          type : _self.notifyType.error,
          notifier : _self,
          reflector : reflector,
          data : argData
        };
        _self.registNotifyMethod(notifyData);
      }, 50);
    }
  }

	/**
	 * [if description]
	 * @param  {[type]} _self.registNotifyMethod
	 * @return {[type]}
	 */
  didReflectMethodForNofifyingEventTrendline = (reflector, argData) => {
    let _self = this;

    if(_self.registNotifyMethod) {
      setTimeout(function(){
        var notifyData = {
          type : _self.notifyType.trendLine,
          notifier : _self,
          reflector : reflector,
          data : argData
        };
        _self.registNotifyMethod(notifyData);
      }, 50);
    }
  }

	// #1571
  protected didReflectMethodForNextData = (reflector) => {
		let self = this;

    let mainShRef:any = self.mainSh;
		if(mainShRef && mainShRef.didRequestChartDataForNextData) {
			mainShRef.didRequestChartDataForNextData(reflector);
		}
	}

  protected didSetChart(argChart:any) {
		let self = this;
    self.chart = argChart;

    //
    // register
    //
    if(self.chart && self.chart.didRegisterReflector) {
		  self.chart.didRegisterReflector("oep", self.didReflectMethodForOep);
			self.chart.didRegisterReflector("newOrder", self.didReflectMethodForNewOrder);	// 2017.07.25 for #1094
			self.chart.didRegisterReflector("cancelOrder", self.didReflectMethodForCancelOrder);	// 2017.07.31 for #894
			self.chart.didRegisterReflector("executionOrder", self.didReflectMethodForExecutionOrder);	// 2017.07.31 for #894
      //self.chart.didRegisterReflector("focus", self.didReflectorForFocusing);
      self.chart.didRegisterReflector("indicator", self.didReflectMethodForNofifyingEventAboutDeletedIndicator);
      self.chart.didRegisterReflector("dataview", self.didReflectMethodForNofifyingEventDataViewInfo);
			self.chart.didRegisterReflector("error", self.didReflectMethodForNofifyingEventError);
			self.chart.didRegisterReflector("trendline", self.didReflectMethodForNofifyingEventTrendline);
			self.chart.didRegisterReflector("nextData", self.didReflectMethodForNextData);
    }
  }

  protected didSetFocusingToChart = (focus:boolean, refresh:boolean) => {
    if(this.chart && this.chart.didSetFocusingFlag) {
      this.chart.didSetFocusingFlag(focus, refresh);
    }
  }

  /**
   * view data
   */
  public onChangeViewData( data:IViewData, sender:ViewBase, byChild:boolean ){
		//console.debug("[LOG:CCVB] chart-stock => onChangeViewData");
		//console.debug(data);
		//console.debug(sender);

    this.symbolCode = data.symbol;

    super.onChangeViewData(data,sender,byChild);
  }

  /*
   * ポャート種別変更イベント
   * @param chartType
   */
  public didChangeChartType = (chartType:string) => {
    // //console.debug('didChangeChartType ' + chartType);
    if(this.chart && this.chart.didChangeBasicChartType) {
			this.chartDeployData.chartType = chartType;

      // fixed by choi sunwoo at 2017.06.05 for using wrong method
      this.chart.didChangeBasicChartType(chartType);
    }
  }

	/**
	 * 注文ライン表示・非表示
	 * @param  {Boolean} isUse===true
	 * @return {[type]}
	 */
	public didChangeUseOrderLine = (isUse:boolean) => {
		let self = this;
		if(isUse === true) {
			if(self.chartDeployData.useOrderLine === true) {
				// do nothing

				return;
			}

			self.didClearOepData(true, false);

			self.chartDeployData.useOrderLine = true;

			let requestData:ChartRequestData = self.chartDeployData.requestData;
			if(!requestData) {
				return;
			}

			if(self.IsHistoryDataReceived()) {
  			let securityCode:string = requestData.symbolCode;

  			// request order data
  			self.didRequestOrderData(securityCode, self.didGetMarketCode());
		  }
		}
		else {
			self.chartDeployData.useOrderLine = false;

			// clear

			// clear all order line in chart
			self.didClearOepData(true, false);
		}
	}

	public didChangeUsePositLine = (isUse:boolean) => {
		let self = this;
		if(isUse === true) {
			if(self.chartDeployData.usePositLine === true) {
				// do nothing

				return;
			}

			self.didClearOepData(false, true);

			self.chartDeployData.usePositLine = true;

			let requestData:ChartRequestData = self.chartDeployData.requestData;
			if(!requestData) {
				return;
			}

			if(self.IsHistoryDataReceived()) {
  			let securityCode:string = requestData.symbolCode;

  			// request order data
  		  self.didRequestPositData(securityCode, self.didGetMarketCode());
		  }
		}
		else {
			// clear
			self.chartDeployData.usePositLine = false;

			// clear all position line in chart
			self.didClearOepData(false, true);
		}
	}

  //
  // added by choi sunwoo at 2017.06.05 for #813
  // call chart method
  //

  public didGetCurrentIndicatorInformationAll = (isSave:boolean, compress?:boolean) => {
    if(this.chart && this.chart.didGetCurrentIndicatorInformationAll) {
      return(this.chart.didGetCurrentIndicatorInformationAll(isSave, compress));
    }
  };

	public didSetCurrentIndicatorInformationAll = (saveInfo:string, decompress?:boolean) => {
		let self = this;
		try {
			if(!self.chartDeployData || !self.chartDeployData.requestData) {
				return(false);
			}

			let symbol = self.chartDeployData.requestData.symbolCode;
			if(symbol === undefined || symbol == null || symbol === "") {
				return(false);
			}

	    if(this.chart && this.chart.didSetCurrentIndicatorInformationAll) {
	      return(this.chart.didSetCurrentIndicatorInformationAll(saveInfo, decompress));
	    }
		}
		catch(e) {
			//console.debug(e);
		}

		return(false);
  };

  public didGetCurrentIndicatorInformationByTypeId = (argTypeId: string) => {
    if(this.chart && this.chart.didGetCurrentIndicatorInformationByTypeId) {
      return(this.chart.didGetCurrentIndicatorInformationByTypeId(argTypeId));
    }
  };

  public didAddIndicator = (code:string, info:string) => {
    if(this.chart && this.chart.didAddIndicator) {
      return(this.chart.didAddIndicator(code, info));
    }
  };

  public didDeleteIndicatorByTypeId = (code:string) => {
    if(this.chart && this.chart.didDeleteIndicatorByTypeId) {
      return(this.chart.didDeleteIndicatorByTypeId(code));
    }
  };

  public didChangeIndicatorSettingByTypeId = (code:string, info:string) => {
    if(this.chart && this.chart.didChangeIndicatorSettingByTypeId) {
      return(this.chart.didChangeIndicatorSettingByTypeId(code, info));
    }
  };

	//
  // added by choi sunwoo at 2017.07.05 for #888
  //
  public didRecvChartRealDataFromServer = (receiveDatas:any) => {
    if(this.chart && this.chart.didRecvChartDataFromServer) {
			return(this.chart.didRecvChartRealDataFromServer(receiveDatas));
    }
  }
	//

	//
  // #1252, #3414
  //
  public didUpdateBusinessDate = (businessDate:number, timeZoneInfo?: any) => {
    if(this.chart && this.chart.didUpdateBusinessDate) {
			return (this.chart.didUpdateBusinessDate(businessDate, true, timeZoneInfo));
    }
  }
	//

  // #2007
  public didUpdateAskBidData = (hide:boolean, ask?:number, bid?:number, validFlag?:boolean) => {
    if(this.chart && this.chart.didUpdateAskBidData) {
			return(this.chart.didUpdateAskBidData(hide, ask, bid, validFlag));
    }
  }
	//

  //
  // added by choi sunwoo at 2017.06.12 for #848
  //
  public didRecvChartDataFromServer = (receiveData:any, requestInfo:any, isNext?:boolean, timeZoneInfo?:TimeZoneInfo) => {
    if(this.chart && this.chart.didRecvChartDataFromServer) {
			if(isNext) {
				return(this.chart.didRecvChartNextDataFromServer(receiveData));
			}
			else {
      	return(this.chart.didRecvChartDataFromServer(receiveData, requestInfo, timeZoneInfo));
			}
    }
  }

	public didReceiveOepDataFromServer = (receiveDatas:any, isOrder:boolean) => {
    if(this.chart && this.chart.didReceiveOepDataFromServer) {
      return(this.chart.didReceiveOepDataFromServer(receiveDatas, isOrder));
    }
  }

	public didClearOepData = (isOrder:boolean, isPosit:boolean) => {
		let self = this;
    if(this.chart && this.chart.didClearOrderPositObjects) {
      return(this.chart.didClearOrderPositObjects(isOrder, isPosit));
    }
  }

  public didClearChartDatas = () => {
    if(this.chart && this.chart.didClearDatas) {
      return(this.chart.didClearDatas());
    }
  }

	public didApplyZoomInOutState(zoomInOutState:boolean) {
		if(this.chart && this.chart.didApplyZoomInOut) {
			return(this.chart.didApplyZoomInOut(zoomInOutState));
		}
	}

	public didGoToEndPos(flag:boolean) {
		if(this.chart && this.chart.didApplyGoToEndPos) {
			return(this.chart.didApplyGoToEndPos(true, true));
		}
	}

	public didApplyTrendline(trendLineCode:string, isSelect?:boolean, color?:string, text?:string) {
		if(this.chart && this.chart.didApplyTrendline) {
			return(this.chart.didApplyTrendline(trendLineCode, isSelect, color, text));
		}
	}

	// #1796
  public didUpdateTrendlinesStyle(color?:string, text?:string) {
		if(this.chart && this.chart.didUpdateTrendlinesStyle) {
			return(this.chart.didUpdateTrendlinesStyle(color, text));
		}
	}
  //
	
	public didGetChartRequestInfo() : ChartRequestInfo {
		let self = this;

		var requestInfo:ChartRequestInfo = {} as ChartRequestInfo;

    let requestData:ChartRequestData = self.chartDeployData.requestData;
		let receiveInfo:ChartSymbolInfo  = self.chartDeployData.receiveInfo;
		if(requestData === undefined || requestData == null) {
      requestInfo.timeType     = '0';
      requestInfo.timeInterval = '1';
		}
		else {
			requestInfo.symbolCode = self.chartDeployData.requestData.symbolCode;
      requestInfo.marketCode = self.chartDeployData.requestData.marketCode;
      requestInfo.timeType = self.chartDeployData.requestData.timeType;
      requestInfo.timeInterval = self.chartDeployData.requestData.timeInterval;
		}

		if(receiveInfo !== undefined && receiveInfo != null) {
			requestInfo.symbolName   = receiveInfo.name;
      requestInfo.displayTitle = receiveInfo.display;

			requestInfo.meigaraCode	 = receiveInfo.meigaraCode;
		}
		else {
			requestInfo.symbolName   = '';
      requestInfo.displayTitle = '未設定';
			requestInfo.meigaraCode  = '';
		}

    requestInfo.chartType    = self.chartDeployData.chartType;
    requestInfo.useOrderLine = self.chartDeployData.useOrderLine;
    requestInfo.usePositLine = self.chartDeployData.usePositLine;

		return(requestInfo);
	}

  //
  // Request & Receive
  //

	protected didConvertToLSSaveInfo(saveInfo:any, encode:boolean, toObject?:boolean) {
		if(saveInfo === undefined || saveInfo == null) {
			return(saveInfo);
		}

		try {
			if(encode === true)  {
				let temp1 = JSON.stringify(saveInfo);
				if(typeof saveInfo === "string") {
					temp1 = saveInfo;
				}
				else {
					temp1 = JSON.stringify(saveInfo);
				}
				let temp2 = temp1.replace(/\"/g, "'");

				return(encodeURI(temp2));
			}
			else {
				let temp1 = decodeURI(saveInfo);
				let temp2 = temp1.replace(/'/g, "\"");
				let temp3;
				if(toObject) {
					temp3 = JSON.parse(temp2);
				}
				else {
					temp3 = temp2;
				}
				return(temp3);
			}
		}
		catch(e) {
			console.error(e);
		}

		return(saveInfo);
	}

  // #1542: move to Ver1
	public didRequestSaveChartObject() {
  }
  //

  public didCloseRealData = () => {
		let self = this;

    self.prepareForRequestingData();
  }

	// MARK: REQUEST

  public didRequestChartDataFromSetting = (componentIndex:number, requestData:ChartRequestData, def:Deferred<any>, useOrderLine?:boolean, usePositLine?:boolean, seriesInfo?:string) => {
		let self = this;

    return(self.didProcForRequestingChartData(componentIndex, requestData, def, useOrderLine, usePositLine, seriesInfo));
  }

	protected didProcForRequestingChartData(componentIndex:number, requestData:ChartRequestData, def:Deferred<any>, useOrderLine?:boolean, usePositLine?:boolean, seriesInfo?:string) {
		let self = this;

    //
    self.prepareForRequestingData();

    let mainShRef:any = self.mainSh;
		if(mainShRef && mainShRef.didProcForRequestingChartData) {
			mainShRef.didProcForRequestingChartData(componentIndex, requestData, def, useOrderLine, usePositLine, seriesInfo);
			}

    return(def ? def.asObservable() : null);
	}

	/**
	 * データリクエスト
	 * @param  {[type]} preRequestData
	 * @return {[type]}
	 */
  protected prepareForRequestingData(isDestory?:boolean) {
    let self = this;

		// ポャートデータをクリア
    self.didClearChartDatas();

    // #1547
    self.didClearOepData(true, true);
    //

    return(true);
  }

	protected didGetDateAndTimeFromTickPriceDatetime(dateTime:string) {
		// YYYY/mm/dd
	}

	protected didDoStepAfterRecevingHistory(securityCode:string, seriesInfo?:string) {
		let self = this;

		// Series
		if(seriesInfo) {
			self.didSetCurrentIndicatorInformationAll(seriesInfo);
		}
		else if(self.chartDeployData.seriesInfo) {
			self.didSetCurrentIndicatorInformationAll(self.chartDeployData.seriesInfo);
		}

		// Order & Position
		setTimeout(() => {
        self.didRequestExtraDataAll(securityCode, self.didGetMarketCode());
		},
		50);

		// Trendline
		self.didStepForTrendlineAfterRecevingHistory(securityCode);
	}

	protected didStepForTrendlineAfterRecevingHistory(securityCode:string, isDemo?:boolean) {
	}

	protected prepareToSendDataToChart(requestData:ChartRequestData, receiveInfo:ChartSymbolInfo, receiveRawData:any, isNext?:boolean) {
		let securityCode:string = requestData.symbolCode;
		let marketCode:string   = requestData.marketCode;
		let businessDate:string = receiveInfo.businessDate;
		let isFop:boolean		    = receiveInfo.isFop;
		let productType:string	= receiveInfo.productType;

		let timeZoneInfo:TimeZoneInfo = didGetTimeZoneInfo(securityCode, marketCode, productType, businessDate);

		return(timeZoneInfo);
	}

	protected didRequestOrderData(securityCode:string, marketCode?:string, reload?:boolean) {
	}

	protected didRequestPositData(securityCode:string, marketCode?:string, reload?:boolean) {
	}

  protected didRequestExtraDataAll(securityCode:string, marketCode?:string, reload?:boolean) {
    let self = this;
    self.didRequestOrderData(securityCode, marketCode, reload);
    self.didRequestPositData(securityCode, marketCode, reload);
	}

	/**
	 * デプロイ情報をクリア
	 * @param  {boolean} onlyFlag	フラグ情報
	 * @return {[type]}
	 */
  protected didClearChartDeployDatas(onlyFlag?:boolean, initFlag?:boolean) {
		let self = this;

    if(onlyFlag === true) {
      self.chartDeployData.stopReceiveReal = true;
      self.chartDeployData.historyIsRequested = false;
			self.chartDeployData.historyIsReceived  = false;

      return;
    }

		// #1131
		// once when init
		if(initFlag === true) {
  		self.chartDeployData.chartType = "Candle";
  		self.chartDeployData.useOrderLine = false;
  		self.chartDeployData.usePositLine = false;
		}
		//


    self.chartDeployData.tickDatas = [];
    self.chartDeployData.receiveInfo = null;
    self.chartDeployData.receiveRawDatas = [];

		self.chartDeployData.orderDatas = [];
		self.chartDeployData.positionDatas = [];

		self.chartDeployData.lastData = undefined;
		self.chartDeployData.snapshotData = undefined;
  }

	protected didGetChartChartTimeTypeCode(argType) {
		return(GetChartChartTimeTypeCode(argType));
	}

	/**
	 * [didSetChartDeployDataFrom description]
	 * @param  {ChartDeployData} chartDeployData
	 * @return {[type]}
	 */
	protected didSetChartDeployDataFrom(chartDeployData:ChartDeployData) {

    if(chartDeployData === undefined || chartDeployData == null) {
      return;
    }

		let self = this;

    let receiveInfo:ChartSymbolInfo = {} as ChartSymbolInfo;
		if(chartDeployData.receiveInfo) {
			let xRiSrc:ChartSymbolInfo = chartDeployData.receiveInfo;

			receiveInfo.code      	= xRiSrc.code						;
			receiveInfo.name      	= xRiSrc.name           ;
			receiveInfo.timeGap   	= xRiSrc.timeGap        ;
			receiveInfo.timeType  	= xRiSrc.timeType       ;
			receiveInfo.lotSize		  = xRiSrc.lotSize      	;
			receiveInfo.pointValue  = xRiSrc.pointValue     ;
			receiveInfo.display	  	= xRiSrc.display        ;
			receiveInfo.isFop				= xRiSrc.isFop  				;
			receiveInfo.productType	= xRiSrc.productType    ;
			receiveInfo.businessDate= xRiSrc.businessDate   ;
			receiveInfo.meigaraCode	= xRiSrc.meigaraCode		;
		}

    self.chartDeployData.receiveInfo = receiveInfo;

    self.chartDeployData.requestData = {} as ChartRequestData;
		if(chartDeployData.requestData) {
			let xRdSrc:ChartRequestData = chartDeployData.requestData;

	    self.chartDeployData.requestData.symbolCode   = xRdSrc.symbolCode;
	    self.chartDeployData.requestData.marketCode   = xRdSrc.marketCode;
	    self.chartDeployData.requestData.timeType     = xRdSrc.timeType;
	    self.chartDeployData.requestData.timeInterval = xRdSrc.timeInterval;
	    self.chartDeployData.requestData.dataCount    = xRdSrc.dataCount;
		}

		if(chartDeployData.useOrderLine !== undefined && chartDeployData.useOrderLine != null) {
			self.chartDeployData.useOrderLine	= chartDeployData.useOrderLine;
		}

		if(chartDeployData.usePositLine !== undefined && chartDeployData.usePositLine != null) {
			self.chartDeployData.usePositLine	= chartDeployData.usePositLine;
		}

		self.chartDeployData.seriesInfo	  = chartDeployData.seriesInfo;

		//
    return(receiveInfo.display);
  }

	/**
	 * convert time type code to time type name(display)
	 * @param  {string} code
	 * @return {string}
	 */
  protected didGetTimeTypeNameFromCode(code:string) : string {
    return(GetTimeTypeNameFromCode(code));
  }

	/**
   * 時間情報から表示する文字列へ変換する。
   * @param  {any}    timeType
   * @param  {any}    timeInterval
   * @return {string}
   */
  protected didGetChartTypeTitleFromTimeInfo (timeType:any, timeInterval:any) : string {
    return(GetChartTypeTitleFromTimeInfo(timeType, timeInterval));
  }

	//
	// #959
	//
	protected didGetConvertedChartConfig() {
		let self = this;

		let resourceService:any = self.didGetResourceService();
		/*
		let chartConfig:IConfigChart;
		if(resourceService && resourceService.didGetCurrentConfigAtTarget) {
			chartConfig = resourceService.didGetCurrentConfigAtTarget("chart") as IConfigChart;
		}

		if(!chartConfig) {
			//console.debug("[CHART][CONFIG] there is no config information.");
			return;
		}
		*/

		let convertedConfig:any = {
		};

		/*
		try {
			//console.debug(chartConfig);

			let basicInfo:IConfigChartBasic = chartConfig.basicInfo;

			let xChartConfig:any = {};

			xChartConfig.UseSmoothScroll = basicInfo.tbSmoothScrollSwitch === "1" ? true : false;
			xChartConfig.GridVertColor = basicInfo.tbColorPickerVertical;
			xChartConfig.GridHorzColor = basicInfo.tbColorPickerHorizontal;

			xChartConfig.OrderBidColor = basicInfo.tbColorPickerOrderKai;
			xChartConfig.OrderAskColor = basicInfo.tbColorPickerOrderUri;
			xChartConfig.OrderLineStyle = basicInfo.tbOrderLineType === "1" ? 0 : 1;
			xChartConfig.PositBidColor = basicInfo.tbColorPickerPositionKai;
			xChartConfig.PositAskColor = basicInfo.tbColorPickerPositionUri;
			xChartConfig.PositLineStyle = basicInfo.tbPositionLineType === "1" ? 0 : 1;

			xChartConfig.CandleUpColor = basicInfo.tbColorPickerCandleUp;
			xChartConfig.CandleDnColor = basicInfo.tbColorPickerCandleDown;
			xChartConfig.CandleLineColor = basicInfo.tbColorPickerCandle;

			convertedConfig.chartConfig = xChartConfig;

			convertedConfig.trend = __utils__.didClone(chartConfig.trend);
			convertedConfig.oscillator = __utils__.didClone(chartConfig.oscillator);
		}
		catch(e) {
			console.error(e);
		}

		//
		// indicator
		// trend
		// oscillator
		//
		try {
			let tempSrc = {
				trend: chartConfig.trend,
				oscillator: chartConfig.oscillator
			};

			let tempCopy = __utils__.didClone(tempSrc);

			convertedConfig.trend = tempCopy.trend;
			convertedConfig.oscillator = tempCopy.oscillator;
		}
		catch(e) {
			console.error(e);
		}
		*/
		return(convertedConfig);
	}

	protected didClearLocalOepData(isOrder:boolean, isPosit:boolean) {
		let self = this;

		// need
		if(isOrder === true) {
			self.chartDeployData.orderDatas = [];
		}

		if(isPosit === true) {
			self.chartDeployData.positionDatas = [];
		}
		//
	}

  //===================================================================================================================
	// MARK: Error response #1544
	//===================================================================================================================

  // #1544
  protected didShowErrorMessage(errorCode:number, errorMessage:string, reserved?:any) {

  }

	//===================================================================================================================
	// MARK: Status
	//===================================================================================================================

	protected IsHistoryDataReceived() {
		return(false);
	}

	//===================================================================================================================
	// MARK: Notification
	//===================================================================================================================
	protected didProcForOepNotification(notification:any) {
		let self = this;

		let securityCode:string;

		if(self.IsHistoryDataReceived() !== true) {
			return;
		}

		if(self.chartDeployData.requestData) {
			securityCode = self.chartDeployData.requestData.symbolCode;
		}

		if(securityCode && typeof securityCode === "string" && securityCode !== "") {
			// Order & Position
			setTimeout(() => {
          self.didRequestExtraDataAll(securityCode, self.didGetMarketCode(), true);
			},
			50);
		}
	}

	//===================================================================================================================
	// MARK: Service
	//===================================================================================================================

	protected didGetSymbolManage() {
		let self = this;
		return(self.managerService.didGetSymbolManage());
	}

	protected didGetBusinessService() {
		let self = this;
		return(self.managerService.didGetBusinessService());
	}

	protected didGetDialogService() {
		let self = this;
		return(self.managerService.didGetDialogService());
	}

	protected didGetResourceService() {
		let self = this;
		return(self.managerService.didGetResourceService());
	}

	protected didGetSharedDataService() {
		let self = this;
		return(self.managerService.didGetSharedDataService());
	}

	//===================================================================================================================
	// MARK: HostListener
	//===================================================================================================================

	// fire event. selected this component.
  @HostListener('click', ['$event'])
  onChartClick(event:Event){
    this.selected.emit(this);
  }
}
