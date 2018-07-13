import { Component, OnInit, ElementRef, ChangeDetectorRef  } from '@angular/core';
import { PanelManageService, CommonConst } from '../core/common';
import { ChartComponentViewBase } from './chartComponentViewBase';
import { ManagerService } from '../service/manager.service';

// #1542
import * as values from "../values/Values";

import { Deferred } from "../util/deferred";
//import { IConfigChartSeries, IConfigChart, IConfigChartBasic } from '../core/configinterface';
import { DeepCopy } from "../util/commonUtil";
import { ChartRequestData, ChartRequestInfo } from './chartTypeInterface';

// Transcation
import { ChartTransactionOepHandler } from './chartTransactionOepHandler';
import { ChartTransactionHandler } from './chartTransactionHandler';
//

export class ChartComponentViewVer2 extends ChartComponentViewBase implements OnInit {
  //
  constructor( public panelMng: PanelManageService,
							 public element: ElementRef,
               protected managerService:ManagerService,
               public changeRef:ChangeDetectorRef) {
    super(panelMng, element, managerService, changeRef);
  }

  //
	// #1542
	//
  protected didCreateMainTransactionHandler(managerService:ManagerService) : any  {
    let self = this;
    return(new ChartTransactionHandler(managerService, 0));
  }

  protected didCreateOepTransactionHandler(managerService:ManagerService) : any  {
      let self = this;
      return(new ChartTransactionOepHandler(managerService, -1));
  }

  protected IsHistoryDataReceived() {
    let self = this;
    let mainShRef:ChartTransactionHandler = self.mainSh as ChartTransactionHandler;
    if(mainShRef && mainShRef.IsHistoryDataReceived) {
      return(mainShRef.IsHistoryDataReceived());
    }

    return(false);
  }

  /**
   * [didRequestOrderData description]
   * @return {[type]}
   */
  protected didRequestOrderData(securityCode:string, marketCode?:string, reload?:boolean) {
    // http request
    var self = this;
    
    if(self.chartDeployData.useOrderLine !== true) {
      return;
    }

    if(reload === true) {
      self.didClearOepData(true, false);
    }

    if(self.oepSh) {
      let pointValue:number = 0;
      try {
        pointValue = self.chartDeployData.receiveInfo.pointValue;
      }
      catch(e) {
        console.error(e);
        pointValue = 0;
      }

      let oepShRef:ChartTransactionOepHandler = self.oepSh as ChartTransactionOepHandler;
      oepShRef.didRequestOrderData(securityCode, pointValue, marketCode);
    }
  }

  protected didRequestPositData(securityCode:string, marketCode?:string, reload?:boolean) {
    // //console.debug("[LOG:CCVB] =======position list ==========");
    // http request
    let self = this;
    if(self.chartDeployData.usePositLine !== true) {
      return;
    }

    if(reload === true) {
      self.didClearOepData(false, true);
    }

    if(self.oepSh) {
      let pointValue:number = 0;
      try {
        pointValue = self.chartDeployData.receiveInfo.pointValue;
      }
      catch(e) {
        console.error(e);
        pointValue = 0;
      }

      let oepShRef:ChartTransactionOepHandler = self.oepSh as ChartTransactionOepHandler;
      oepShRef.didRequestPositData(securityCode, pointValue, marketCode);
    }
  }

  protected didGetConvertedChartConfig() {
    let self = this;

    let resourceService:any = self.didGetResourceService();
    let chartConfig:any;
    if(resourceService && resourceService.didGetCurrentConfigAtTarget) {
      chartConfig = resourceService.didGetCurrentConfigAtTarget("chart");
    }

    if(!chartConfig) {
      //console.debug("[CHART][CONFIG] there is no config information.");
      return;
    }

    let convertedConfig:any = {
    };

    try {
      //console.debug(chartConfig);

      let basicInfo:any = chartConfig.basicInfo;

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

      convertedConfig.trend = DeepCopy(chartConfig.trend);
      convertedConfig.oscillator = DeepCopy(chartConfig.oscillator);
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

      let tempCopy = DeepCopy(tempSrc);

      convertedConfig.trend = tempCopy.trend;
      convertedConfig.oscillator = tempCopy.oscillator;
    }
    catch(e) {
      console.error(e);
    }

    return(convertedConfig);
  }

  public didRequestSaveChartObject() {
    let self = this;

    let saveData = self.onSaveCurrentTrendlinesBtnClicked();

    //console.debug(saveData);

    let chartRequestInfo:ChartRequestInfo = self.didGetChartRequestInfo();

    var input: any = {};
    input.meigaraCode = chartRequestInfo.meigaraCode;
    input.value = self.didConvertToLSSaveInfo(saveData, true);

    //console.debug(input.value);

    let businessService:any = self.didGetBusinessService();
    if(businessService && businessService.saveChartObject) {
      businessService.saveChartObject(input).subscribe(
        val => {
          if(val) {
              if(val.responseStatus == CommonConst.ORDER_RESPONSE_NG) {
                self.didShowErrorMessage(val.responseStatus, val.message, val);
              }
          }
          else {
          }
          //console.debug(val);
        }
      );
    }
  }

  protected didStepForTrendlineAfterRecevingHistory(securityCode:string, isDemo?:boolean) {
    let self = this;

    // Trendline save
    setTimeout(() => {
      //
      let chartRequestInfo:ChartRequestInfo = self.didGetChartRequestInfo();

      let meigaraCode:string = chartRequestInfo.meigaraCode;

      var input: any = {};
      input.meigaraCodes = [];
      input.meigaraCodes.push(meigaraCode);

      let businessService:any = self.didGetBusinessService();
      if(businessService && businessService.getChartObject) {
        businessService.getChartObject(input).subscribe(
        val => {
          let resultList = val.resultList;
          try {
            if(resultList && resultList.object) {
              let lsSaveInfos = resultList.object;

              if(lsSaveInfos) {
                let count = 0;
                let lsSaveInfo;
                if(lsSaveInfos.length !== undefined && lsSaveInfos.length != null) {
                  count = lsSaveInfos.length;
                  lsSaveInfo = lsSaveInfos[0];
                }
                else {
                  if(lsSaveInfos.object) {
                    lsSaveInfo = lsSaveInfos.object;
                  }
                  else {
                    lsSaveInfo = lsSaveInfos;
                  }
                }

                let isProcessed = false;
                if(lsSaveInfo && lsSaveInfo.meigaraCode === meigaraCode) {
                  //
                  isProcessed = true;

                  if(lsSaveInfo.objectValue) {
                    let xSaveInfo = self.didConvertToLSSaveInfo(lsSaveInfo.objectValue, false, true);
                    //console.debug(xSaveInfo);

                    if(xSaveInfo) {
                      if(isDemo !== true) {
                        self.didSetLoadInfoForTheLineTools(xSaveInfo.lss);
                      }
                    }
                  }
                }

                if(isProcessed !== true && count > 1) {
                  for(var ii = 1; ii < count; ii++) {
                    lsSaveInfo = lsSaveInfos[ii];
                    if(lsSaveInfo && lsSaveInfo.meigaraCode === meigaraCode) {
                      //
                      isProcessed = true;

                      let xSaveInfo = self.didConvertToLSSaveInfo(lsSaveInfo.objectValue, false);
                      //console.debug(xSaveInfo);

                      break;
                    }
                  }
                }
              }
            }
          }
          catch(e) {
            console.error(e);
          }
        }
      );
      }
    },
    50);
  }

  // [end] #1542

  // #2023
  public didRequestChartDataFromSettingCFD = (componentIndex:number, requestData:ChartRequestData, def:Deferred<any>, chartType?:string, useOption?:any, seriesInfo?:string) => {
		let self = this;

    if(chartType !== undefined && chartType != null) {
      self.didChangeChartType(chartType);
    }

    return(self.didProcForRequestingChartDataCFD(componentIndex, requestData, def, useOption, seriesInfo));
  }

	protected didProcForRequestingChartDataCFD(componentIndex:number, requestData:ChartRequestData, def:Deferred<any>, useOption?:any, seriesInfo?:string) {
		let self = this;

    //
    self.prepareForRequestingData();

    let mainShRef:any = self.mainSh;
		if(mainShRef && mainShRef.didProcForRequestingChartDataCFD) {
			mainShRef.didProcForRequestingChartDataCFD(componentIndex, requestData, def, useOption, seriesInfo);
		}

    return(def ? def.asObservable() : null);
	}
  //
}
