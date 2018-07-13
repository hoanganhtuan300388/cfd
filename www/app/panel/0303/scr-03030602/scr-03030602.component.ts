/**
 * 
 * チャート
 * 
 */
import { Component, ElementRef, ChangeDetectorRef, ViewChild } from '@angular/core';
import { PanelManageService, PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips } from '../../../core/common';

import { ChartCfdMiniComponent } from '../../../component/chart-cfd-mini/chart-cfd-mini.component';

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

// #1952
const electron = (window as any).electron;

// #2023
import * as values from "../../../values/values";
import { Deferred } from "../../../util/deferred";

export const DEFAULT_TIME_TYPE:string = ChartConst.TIME_TYPE_MINUTE; // #1446
export const DEFAULT_TIME_INTERVAL:string = '5';
//


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
// COMPONENT : Scr03030602Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03030602',
  templateUrl: './scr-03030602.component.html',
  styleUrls: ['./scr-03030602.component.scss']
})
export class Scr03030602Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------

  @ViewChild('chart') chartRef:ChartCfdMiniComponent;

  // ----- 四本値情報パネル
  @ViewChild('InfoPanel') chartInfoPanel: ChartInfoPanelComponent; // #2019

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

  // 基本銘柄コード
  private defaultProductCode:string = ''; // #2216

  // チャートの保存情報
  private loadedChartInfo:IChartLoadInfo = {} as IChartLoadInfo;

  // #2030
  private inidicatorInfoJson:string;

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public element: ElementRef,
               public changeRef:ChangeDetectorRef,
               public dialogService:DialogService,
               public resource:ResourceService ) {                 
    super( '03030602', screenMng, element, changeRef); 

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
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();

    let self = this;
    self.didProcForAfterViewInit();
  }

  onResizing($event){
    super.onResizing();
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

  private didProcForAfterViewInit = () => {
    let self = this;

    // request sample
    let def: Deferred<any> = new Deferred<any>();
    let subscription = def.asObservable().subscribe(
      val => {
        try {
          if(val) {
            console.log();
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
    let chartRef:ChartCfdMiniComponent = self.chartRef;
    let requestData:ChartRequestData = {} as ChartRequestData;
    requestData.symbolCode   = "00001060000"; // 日本225
    requestData.dataCount    = "10";
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
              this.isSettingDisabled = false;
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
}
