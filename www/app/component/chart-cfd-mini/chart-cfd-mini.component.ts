import { Component, OnInit, Input, ElementRef, Output, ViewChild, EventEmitter, HostListener, SimpleChange, ChangeDetectorRef } from '@angular/core';
import { PanelManageService, ComponentViewBase, IViewData, IViewState, CommonEnum, CommonConst, ViewBase } from '../../core/common';

// #1086
import { ChartComponentViewVer2 } from '../../core/chartComponentViewVer2';
import { didCalcPrice } from '../../core/chartTypeInterface';
import { ResourceService } from '../../service/resource.service';
import { Deferred } from "../../util/deferred";

import { DialogService } from "ng2-bootstrap-modal";
import { ManagerService } from '../../service/manager.service';
import { ContextMenuService, ContextMenuComponent } from 'ngx-contextmenu';
import { ChartRequestInfo, ChartRequestData, ChartSymbolInfo } from '../../core/chartTypeInterface';

import { GetPointValue, DeepCopy } from '../../util/commonUtil';

import { ChartCFDDeployData, ChartCFDRequestInfo } from '../../core/chartCFDInterface';

import * as ChartConst from '../../const/chartConst'; // #1878
import * as ChartCFDConst from '../../const/chartCFDConst'; // #2215

import { ChartTransactionOepHandler } from '../../core/chartTransactionOepHandler';

// #2216
import { IsShowDisplaySetting } from '../../core/chartCFDInterface';
import { IConfigChartDisplaySettings, IConfigChartColorSettings } from '../../core/configinterface';
//

declare var $:any;
declare var __utils__;

// #1966
interface IContextMenuItem {
	title: string;
	actionCode:number;
	extraData?:any;
}


@Component({
	selector: 'chart-cfd-mini',
  templateUrl: './chart-cfd-mini.component.html',
  styleUrls: ['./chart-cfd-mini.component.scss']
})
export class ChartCfdMiniComponent extends ChartComponentViewVer2 implements OnInit {
	private _demoRequest:boolean = false;
	/* 銘柄コード */
  public symbolCode:string = "7203_INDICATOR";

	/* ポャート */
  @ViewChild('wrapperChart') wrapperChart: ElementRef;

	// deploy data
	protected chartDeployData:ChartCFDDeployData = {} as ChartCFDDeployData;

	//
  constructor( public panelMng: PanelManageService,
							 public element: ElementRef,
							 protected managerService:ManagerService,
						 	 protected contextMenuService:ContextMenuService,
							 protected resource:ResourceService,
							 public changeRef:ChangeDetectorRef ) {
    super(panelMng, element, managerService, changeRef);
  }

  ngOnInit() {
		//
    super.ngOnInit();
  }

	protected getChartWrapperJqElement() : any {
		let self = this;
		return($(self.wrapperChart.nativeElement));
	}

	protected getDefaultEnv() : string {
		var xEnv = {
			System : {
				DefaultPriceBar: "cfd",
				UseForMiniChart: true,
			}
		};

		return(JSON.stringify(xEnv));
	}

	// #1966
	protected didSetChart(argChart:any) {
		super.didSetChart(argChart);
	}
	
	didInitChart() {
		super.didInitChart();
	}

	protected didProcForAfterContentInit() {
		let self = this;
		if(self.chart !== undefined && self.chart != null) {
			// #2458
			let xChartConfig:any = {};
			xChartConfig.GridVertHide = true;
			xChartConfig.GridHorzHide = true;
			self.chart.didApplyChartSetting(xChartConfig);
			// 
		}
	}

	/**
	 * デプロイ情報をクリア㝙る。
	 * @param  {boolean} onlyFlag	フラグ情報㝮㝿
	 * @return {[type]}
	 */
  protected didClearChartDeployDatas(onlyFlag?:boolean, initFlag?:boolean) {
		super.didClearChartDeployDatas(onlyFlag, initFlag);

		let self = this;

    if(onlyFlag === true) {
      return;
    }

		// #1131
		// once when init
		if(initFlag === true) {
  		self.chartDeployData.useExecutionLine = false;
  		self.chartDeployData.useAlertLine = false;
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
	
	public didGetChartRequestInfo() : ChartCFDRequestInfo {
		let self = this;

		var requestInfo:ChartCFDRequestInfo = super.didGetChartRequestInfo() as ChartCFDRequestInfo;

    requestInfo.useExecutionLine = self.chartDeployData.useExecutionLine;
    requestInfo.useAlertLine = self.chartDeployData.useAlertLine;

		return(requestInfo);
	}

	/**
	 * クロスライン表示表示・非表示
	 * @param  {Boolean} isUse===true
	 * @return {[type]}
	 */
	public didChangeCrosslineShow = (isUse:boolean) => {
		let self = this;
		self.chartDeployData.showCrossline = isUse;
		if(self.chart && self.chart.didApplyLocalSetting) {
			self.chart.didApplyLocalSetting("crossLine", isUse);
		}
	}

	protected didRequestExtraDataAll(securityCode:string, marketCode?:string, reload?:boolean) {
		return;
	}

	// #1878
  didInitOepTransactionHandler() {
		let self = this;
		// do nothing
	}

  //

	//---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------

	// #2030
	public didSetCurrentIndicatorInformationAll = (saveInfo:string, decompress?:boolean) => {
		let self = this;
		// do nothing
		return(false);
  };

	/**
	 * #2089
	 */
	didInitOepNotification() {
		// do nothing
	}
	
	public onChangeViewState( data:IViewState, sender:ViewBase, byChild:boolean ){
		let self = this;
    // do nothing
  }

	protected didSetChartDeployDataFrom(chartDeployData:ChartCFDDeployData) {
		let display:string = super.didSetChartDeployDataFrom(chartDeployData);
    if(chartDeployData === undefined || chartDeployData == null) {
      return(display);
    }

		let self = this;

		if(chartDeployData.useExecutionLine !== undefined && chartDeployData.useExecutionLine != null) {
			self.chartDeployData.useExecutionLine	= chartDeployData.useExecutionLine;
		}

		if(chartDeployData.useAlertLine !== undefined && chartDeployData.useAlertLine != null) {
			self.chartDeployData.useAlertLine	= chartDeployData.useAlertLine;
		}

		//
    return(display);
  }
	//

	protected didGetConvertedChartConfig() {
    let self = this;

    let convertedConfig:any = {
    };

    try {
      let xChartConfig:any = {};

			xChartConfig.GridShow         = false;
			xChartConfig.ShowCurrentPrice = false;
			xChartConfig.ShowHighLowPrice = false;
	
      convertedConfig.chartConfig = xChartConfig;
    }
    catch(e) {
      console.error(e);
    }

    return(convertedConfig);
	}
  
  //===================================================================================================================
	// MARK: Notification
	//===================================================================================================================
	protected didProcForOepNotification(notification:any, type?:number) {
		let self = this;

		// do nothing
	}

	//---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------

	//---------------------------------------------------------------------------
  // demo
	//---------------------------------------------------------------------------
	
	//
	// TODO: demo
	//
	public didDemoRequestSymbolData(symbolInfo) {
    if(this.chart !== undefined && this.chart != null) {
			try {
				 this.chart.method.m_chartWrapDataConverter.m_xDemoEventHandler.OnReceive_RequestData(symbolInfo);
			}
			catch(e) {
				console.error(e);
			}
    }
	}
	
	
}
