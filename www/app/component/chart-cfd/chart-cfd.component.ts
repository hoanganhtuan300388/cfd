import { Component, OnInit, Input, ElementRef, Output, ViewChild, EventEmitter, HostListener, SimpleChange, ChangeDetectorRef } from '@angular/core';
import { PanelManageService, ComponentViewBase, IViewData, IViewState, CommonEnum, CommonConst, ViewBase } from '../../core/common';
import { BusinessService } from '../../core/common'; // #3414

// #1086
import { ChartComponentViewVer2 } from '../../core/chartComponentViewVer2';
import { didCalcPrice } from '../../core/chartTypeInterface';
import { ResourceService } from '../../service/resource.service';
import { Deferred } from "../../util/deferred";

import { DialogService } from "ng2-bootstrap-modal";
import { ManagerService } from '../../service/manager.service';
import { ContextMenuService, ContextMenuComponent } from 'ngx-contextmenu';
import { ChartRequestInfo, ChartRequestData, ChartSymbolInfo } from '../../core/chartTypeInterface';
//import { IConfigChart } from '../../core/configinterface';

// import { Scr01020103Component } from '../../panel/0102/scr-01020103/scr-01020103.component';  // modify order
// import { Scr01020104Component } from '../../panel/0102/scr-01020104/scr-01020104.component';  // cancel order

import { GetPointValue, DeepCopy } from '../../util/commonUtil';

import { ChartCFDDeployData, ChartCFDRequestInfo } from '../../core/chartCFDInterface';

// #1966
import { SpeedOrderConfirmComponent } from '../../component/speed-order-confirm/speed-order-confirm.component';
//

import * as ChartConst from '../../const/chartConst'; // #1878
import * as ChartCFDConst from '../../const/chartCFDConst'; // #2215

import { ChartTransactionHandler } from '../../core/chartTransactionHandler'; // #3414
import { ChartTransactionOepHandler } from '../../core/chartTransactionOepHandler';

// #2138
import { MessageBox } from '../../util/utils';
import { AlertModifyDialogComponent } from '../../component/alert-modify-dialog/alert-modify-dialog.component';
//

// #2216
import { IsShowDisplaySetting } from '../../core/chartCFDInterface';
import { IConfigChartDisplaySettings, IConfigChartColorSettings } from '../../core/configinterface';
//

import { ILayoutInfo } from '../../values/Values'; // #2215

import { AwakeContextMenu } from '../../util/commonUtil'; // #2338

// #2318
import { ERROR_CODE } from "../../../../common/businessApi";
import { ChartCFDErrorInfo } from "../../core/chartCFDInterface";
import { Messages } from '../../../../common/message';
//

declare var $:any;
declare var __utils__;

// #1966
interface IContextMenuItem {
	title: string;
	actionCode:number;
	extraData?:any;
}

const ACTION_CODE_SPEED_ORDER:number 			= 0;
const ACTION_CODE_AMEND_ORDER:number 			= 1;
const ACTION_CODE_CANCEL_ORDER:number 		= 2;
const ACTION_CODE_SETTLE_ORDER:number 		= 3;
const ACTION_CODE_NEW_LIMIT_ASK:number 		= 10;
const ACTION_CODE_NEW_LIMIT_BID:number 		= 11;
const ACTION_CODE_NEW_STOP_ASK:number 		= 12;
const ACTION_CODE_NEW_STOP_BID:number 		= 13;
const ACTION_CODE_NEW_MARKET_ASK:number 	= 14;
const ACTION_CODE_NEW_MARKET_BID:number 	= 15;
const ACTION_CODE_ADD_ALERT:number 				= 20;
const ACTION_CODE_MOD_ALERT:number 				= 21;
const ACTION_CODE_DEL_ALERT:number 				= 22;
const ACTION_CODE_MENU_ITEM_START:number	= 100;

//

// #2089
const NOTIFICATION_TYPE_ORDER:number 			= 0;
const NOTIFICATION_TYPE_POSITION:number 	= 1;
const NOTIFICATION_TYPE_EXECUTION:number	= 2;
const NOTIFICATION_TYPE_ALERT:number 			= 3;
//

@Component({
	selector: 'chart-cfd',
  templateUrl: './chart-cfd.component.html',
  styleUrls: ['./chart-cfd.component.scss']
})
export class ChartCfdComponent extends ChartComponentViewVer2 implements OnInit {
	private _demoRequest:boolean = false;
	/* 銘柄コード */
  public symbolCode:string = "7203_INDICATOR";

	/* ポャート */
  @ViewChild('wrapperChart') wrapperChart: ElementRef;

	/* Scrollbar */
	@ViewChild('wrapperScroll') wrapperScroll: ElementRef;
	/* lib/ngc/screenChart.js */
  protected scrollBar:any = null;

	 // #1966
	public contextInfo:any;
	/* コンテキストメニュー */
	@ViewChild('contextMenu') public contextMenu: ContextMenuComponent;

	public isAvailableMenuItem1:boolean = false;
	public contextMenuItems1:IContextMenuItem[] = [];	// 対象注文
	public contextMenuItems2:IContextMenuItem[] = [];	// スピード注文
	public contextMenuItems3:IContextMenuItem[] = [];	// 新規注文
	public contextMenuItems4:IContextMenuItem[] = [];	// アラート
	public contextMenuItems5:IContextMenuItem[] = [];	// 通常右クリック
	
	// [end] #1966

	// deploy data
	protected chartDeployData:ChartCFDDeployData = {} as ChartCFDDeployData;

	// subscribed list
	private notifySubscribe = [];

	/* 情報パネルの表示・非表示を切り替えるイベント */
  @Output() showInfoPanel = new EventEmitter();	 // #2019

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
		
		// #3414
		let self = this;
		let businessService: any = self.didGetBusinessService();
		if (businessService && businessService.notifyer) {
			self.notifySubscribe.push(
				businessService.notifyer.EOD().subscribe(
					(val) => {
						let mainShRef: ChartTransactionHandler = self.mainSh as ChartTransactionHandler;
						if (mainShRef && mainShRef.didNotifiedEODFromServer) {
							mainShRef.didNotifiedEODFromServer(val);
						}
					}
				));
		}
		// [end] #3414
	}
	
  ngOnDestroy(){
		super.ngOnDestroy();
		this.notifySubscribe.forEach(s=>{
      s.unsubscribe();
    })  
  }	

	protected getChartWrapperJqElement() : any {
		let self = this;
		return($(self.wrapperChart.nativeElement));
	}

	protected getScrollWrapperJqElement() : any {
		let self = this;
		return($(self.wrapperScroll.nativeElement));
	}

	protected getDefaultEnv() : string {
		var xEnv = {
			System : {
				DefaultPriceBar: "cfd",
			}
		};

		return(JSON.stringify(xEnv));
	}

	// #1966
	protected didSetChart(argChart:any) {
		super.didSetChart(argChart);
		
		let self = this;
    //
    // register
    //
    if(self.chart && self.chart.didRegisterReflector) {
			self.chart.didRegisterReflector("contextMenu", self.didReflectMethodForContextMenu);
			self.chart.didRegisterReflector("detailView", self.didReflectMethodForDetailView); // #2019
		}

		// #2216, #3101
		self.notifySubscribe.push(self.resource.onChangeConfig().subscribe(
			(val) => {
				if(val) {
					let config:any = self.didGetConvertedChartConfig();
					
					if(self.chart !== undefined && self.chart != null) {
						if(config) {
							self.chart.didApplyChartSetting(config.chartConfig);
						}
					}
					
					console.log( '[resource] onChangeConfig ', val );
					
				}
			}));
		//
	}
	
	protected didReflectMethodForContextMenu = (reflector, argData) => {
    let self = this;

		self.didProcForContextMenu(argData);
	}

	// #2019
	protected didReflectMethodForDetailView = (reflector, argData) => {
    let self = this;

		self.showInfoPanel.emit();
	}
	//

	protected didGetOffsetInfoOfTheEventElement(domElem:any) {
		if(!domElem) {
			return({
				top:  0,
				left: 0
			});
		}

		let $jqElem = $(domElem);

		return($jqElem.offset());
	}

	protected didAdjustEventOffset(argEvent:any) {
		let self = this;
		if(argEvent) {
			// #1733
			let offsetInfoSelf:any = self.didGetOffsetInfoOfTheEventElement(self.element.nativeElement);
			let offsetInfoParent:any = DeepCopy(offsetInfoSelf);
			try {
				let cpvb:any = self._parentView;
				if(cpvb && cpvb.componentRoot && cpvb.componentRoot.nativeElement) {
					let domElem = cpvb.componentRoot.nativeElement;
					if(domElem) {
						offsetInfoParent = $(domElem).offset();
					}
				}
			}
			catch(e) {

			}

			argEvent.clientX += (offsetInfoSelf.left - offsetInfoParent.left);
			argEvent.clientY += (offsetInfoSelf.top  - offsetInfoParent.top ) + 34;
			// [end] #1733
		}
	}

	protected didCheckSymbolCode(symbolCode:string, orderInfo?:any) : boolean {
		return(true);
	}

	protected didClearContextMenu() {
		let self = this;
		self.isAvailableMenuItem1 = false;
		self.contextMenuItems1 = [];
		self.contextMenuItems2 = [];
		self.contextMenuItems3 = [];
		self.contextMenuItems4 = [];
		self.contextMenuItems5 = [];
	}

	protected didMakeContextMenu(contextInfo:any) {
		let self = this;
		self.didClearContextMenu();

		if(!contextInfo) {
			return;
		}

		let priceValue:string = contextInfo.orderInfo.limitPrice;

		let isMain:boolean = contextInfo.isMain;
		let isAlert:boolean = false;

		self.isAvailableMenuItem1 = false;

		let extraData:any = {
			product:contextInfo.symbolCode,
			objectId:undefined,
			priceValue:priceValue,
			objectInfo:contextInfo.objectInfo
		};

		if(contextInfo.objectInfo) {
			if(contextInfo.objectInfo.isExecution == true) {
				isMain = false;
			}
			else if(contextInfo.objectInfo.isAlert == true) {
				isAlert = true;
				extraData.objectId = contextInfo.objectInfo.origin.id;

				// #2459, #2138
				try {
					let alertPrice:any = contextInfo.objectInfo.origin.originalData.basicRate;
					extraData.priceValue = alertPrice;
					
					if(contextInfo.objectInfo.origin.menuText) {
						self.contextMenuItems4.push({title:("アラート編集(" + contextInfo.objectInfo.origin.menuText + ")"), actionCode:ACTION_CODE_MOD_ALERT, extraData:extraData});
						self.contextMenuItems4.push({title:("アラート削除(" + contextInfo.objectInfo.origin.menuText + ")"), actionCode:ACTION_CODE_DEL_ALERT, extraData:extraData});
					}
					else {
						self.contextMenuItems4.push({title:("アラート編集(" + contextInfo.objectInfo.origin.id + ")"), actionCode:ACTION_CODE_MOD_ALERT, extraData:extraData});
						self.contextMenuItems4.push({title:("アラート削除(" + contextInfo.objectInfo.origin.id + ")"), actionCode:ACTION_CODE_DEL_ALERT, extraData:extraData});
					}
				}
				catch(e) {
					console.error(e);
				}
				//
			}
			else if(contextInfo.objectInfo.isOrder == true) {
				if(contextInfo.objectInfo.origin.menuText) {
					extraData.objectId = contextInfo.objectInfo.origin.id;
					self.contextMenuItems1.push({title:("注文変更(" + contextInfo.objectInfo.origin.menuText + ")"), actionCode:ACTION_CODE_AMEND_ORDER, extraData:extraData});
					self.contextMenuItems1.push({title:("注文取消(" + contextInfo.objectInfo.origin.menuText + ")"), actionCode:ACTION_CODE_CANCEL_ORDER, extraData:extraData});
				}
				else {
					extraData.objectId = contextInfo.objectInfo.origin.id;
					self.contextMenuItems1.push({title:("注文変更(" + contextInfo.objectInfo.origin.id + ")"), actionCode:ACTION_CODE_AMEND_ORDER, extraData:extraData});
					self.contextMenuItems1.push({title:("注文取消(" + contextInfo.objectInfo.origin.id + ")"), actionCode:ACTION_CODE_CANCEL_ORDER, extraData:extraData});
				}
				
				self.isAvailableMenuItem1 = true;
			}
			else if(contextInfo.objectInfo.isOrder != true) {
				if(contextInfo.objectInfo.origin.menuText) {
					extraData.objectId = contextInfo.objectInfo.origin.id;
					self.contextMenuItems1.push({title:("決済注文(" + contextInfo.objectInfo.origin.menuText + ")"), actionCode:ACTION_CODE_SETTLE_ORDER, extraData:extraData});
				}
				else {
					extraData.objectId = contextInfo.objectInfo.origin.id;
					self.contextMenuItems1.push({title:("決済注文(" + contextInfo.objectInfo.origin.id + ")"), actionCode:ACTION_CODE_SETTLE_ORDER, extraData:extraData});
				}
				self.isAvailableMenuItem1 = true;
			}
		}

		self.contextMenuItems2.push({title:"スピード注文", actionCode:ACTION_CODE_SPEED_ORDER});
		
		if(isMain == true) {
			if(isAlert != true) {
				self.contextMenuItems4.push({title:("アラート登録" + priceValue), actionCode:ACTION_CODE_ADD_ALERT, extraData:extraData});
			}

			let action1:string = "";
			let actionCode1:number = ACTION_CODE_NEW_LIMIT_ASK;
			let action2:string = "";
			let actionCode2:number = ACTION_CODE_NEW_LIMIT_BID;
			if(contextInfo.pricePos < 0) {
				action1 = "新規注文　逆指値(売)",
				actionCode1 = ACTION_CODE_NEW_STOP_ASK;
				action2 = "　　　　　指値(買)",
				actionCode2 = ACTION_CODE_NEW_LIMIT_BID;
			}
			else if(contextInfo.pricePos > 0) {
				action1 = "新規注文　指値(売)",
				actionCode1 = ACTION_CODE_NEW_LIMIT_ASK;
				action2 = "　　　　　逆指値(買)",
				actionCode2 = ACTION_CODE_NEW_STOP_BID;
			}
			else {
				action1 = "新規注文　指値(売)",
				actionCode1 = ACTION_CODE_NEW_LIMIT_ASK;
				action2 = "　　　　　指値(買)",
				actionCode2 = ACTION_CODE_NEW_LIMIT_BID;
			}

			action1 += (" " + priceValue);
			action2 += (" " + priceValue);

			self.contextMenuItems3.push({title:action1, actionCode:actionCode1, extraData:extraData});
			self.contextMenuItems3.push({title:action2, actionCode:actionCode2, extraData:extraData});
		}
		else {
			if(isAlert != true) {
				self.contextMenuItems4.push({title:("アラート登録"), actionCode:ACTION_CODE_ADD_ALERT, extraData:extraData});
			}
		}

		let action3:string = isMain == true ? "　　　　　成行(売)" :  "新規注文　成行(売)";
		let actionCode3:number = ACTION_CODE_NEW_MARKET_ASK;
		let action4:string = "　　　　　成行(買)";
		let actionCode4:number = ACTION_CODE_NEW_MARKET_BID;
		self.contextMenuItems3.push({title:action3, actionCode:actionCode3, extraData:extraData});
		self.contextMenuItems3.push({title:action4, actionCode:actionCode4, extraData:extraData});

		// Menu item
		// #2353
		// for(var ii = 0; ii < 3; ii++) {
		// 	self.contextMenuItems5.push({title:"通常右クリックメニュー" + ii, actionCode:(ACTION_CODE_MENU_ITEM_START + ii)});
		// }
	}

	protected didProcForContextMenu(argData:any) {
		let self = this;
		self.contextInfo = undefined;

		if(!argData || !argData.symbolCode || !argData.symbol) {
			return;
		}

		try {
			var contextInfo = argData;

			var orderInfo:any = {
			};

			if(self.didCheckSymbolCode(contextInfo.symbolCode, contextInfo) !== true) {
				return;
			}

			var xPrice:any = {
				price: contextInfo.price,
				point: contextInfo.verpos
			};

			// TODO: トリガー価格または指値を調整する。
			if(xPrice.price !== undefined && xPrice.price != null) {
				orderInfo.limitPrice = GetPointValue(xPrice);
			}
			else {
				orderInfo.limitPrice = "";
			}

			contextInfo.orderInfo = orderInfo;
			self.contextInfo = contextInfo;

			if(argData.event) {
				let contextMenu:ContextMenuComponent = self.didGetContextMenu();
				if(!contextMenu) {
					return;
				}

				self.didAdjustEventOffset(argData.event);

				self.didMakeContextMenu(self.contextInfo);

				self.updateView();
				self.contextMenuService.show.next({
	        contextMenu: contextMenu,
	        event: argData.event,
	        item: argData
				});
				
				AwakeContextMenu(argData.event, self.element.nativeElement); // #2338
			}
    }
		catch(e) {
			console.error(e);
		}
	}

	protected didGetContextMenu() : ContextMenuComponent {
		let self = this;
		return(self.contextMenu);
	}

	public onContextMenuProc($event, actionCode:number, extraData:any) {
		let self = this;

		let params:any = {
			channel: 'chart'
		};

		let chartRequestInfo:ChartCFDRequestInfo = self.didGetChartRequestInfo();
		if(!chartRequestInfo) {
			console.warn("[WARN] There is no request information.");
			return;
		}

		if(actionCode == ACTION_CODE_SPEED_ORDER) {
			self.didShowSpeedOrderConfirm();

			return;
		}

		// #2138
		if(actionCode == ACTION_CODE_DEL_ALERT) {
			let alertId:any = extraData.objectId;
			self.deleteAlert(alertId);
			return;
		}

		if(actionCode == ACTION_CODE_ADD_ALERT) {
			let dialogService:DialogService = self.managerService.didGetDialogService();
			if(dialogService) {
				let params:any = {
					key:undefined,
					product:extraData.product,
					basicRate:extraData.priceValue
				};

				dialogService.addDialog(AlertModifyDialogComponent,{params:params}).subscribe(
					(val) => {
						if(val) {
							self.panelMng.fireChannelEvent('alertAddModify', {});
						}
					});
			}

			return;
		}

		if(actionCode == ACTION_CODE_MOD_ALERT) {
			self.didShowAlertModify(extraData); // #2459

			return;
		}
		//

		// #2215
		if(actionCode >= ACTION_CODE_NEW_LIMIT_ASK && actionCode <= ACTION_CODE_NEW_MARKET_BID) {
			let orderType:string = ChartCFDConst.ORDER_EXECUTION_TYPE_MARKET;
			if(actionCode == ACTION_CODE_NEW_LIMIT_ASK || actionCode == ACTION_CODE_NEW_LIMIT_BID) {
				orderType = ChartCFDConst.ORDER_EXECUTION_TYPE_LIMIT;
			}
			else if(actionCode == ACTION_CODE_NEW_STOP_ASK || actionCode == ACTION_CODE_NEW_STOP_BID) {
				orderType = ChartCFDConst.ORDER_EXECUTION_TYPE_STOP;
			}

			let buySellType:string = ChartCFDConst.OEP_BUYSELL_TYPE_SELL;
			if(actionCode == ACTION_CODE_NEW_LIMIT_BID || actionCode == ACTION_CODE_NEW_STOP_BID || actionCode == ACTION_CODE_NEW_MARKET_BID) {
				buySellType = ChartCFDConst.OEP_BUYSELL_TYPE_BUY;
			}

			// #2215
			let layout:ILayoutInfo = {
				productCode:chartRequestInfo.symbolCode,
				option: {
					multiType: "1",
					orderType: orderType,
					buySellType: buySellType,
					price: extraData.priceValue,
					channel: "chart",
				}
			} as ILayoutInfo;
			let params:any = {
				layout: layout
			};
			//

			self.openScreen('03020100', params);
			return;
		}

		if(actionCode == ACTION_CODE_AMEND_ORDER) {
			try {
				let orderInfos:any[] = []; // orderInfos is array
				// #2481
				if(extraData.objectInfo.jointObjectInfos) {
					let nJoiCnt:number = extraData.objectInfo.jointObjectInfos.length;
					if(nJoiCnt && nJoiCnt > 0) {
						for(var ii = 0; ii < nJoiCnt; ii++) {
							let jointObjectInfo:any = extraData.objectInfo.jointObjectInfos[ii];
							if(jointObjectInfo && jointObjectInfo.originalData) {
								orderInfos.push(DeepCopy(jointObjectInfo.originalData));
							}
						}
					}
				}

				let orderInfo:any = DeepCopy(extraData.objectInfo.origin.originalData);
				if(orderInfos.length < 1 && orderInfo) {
					orderInfos.push(orderInfo);
				}
				//
				let layout:ILayoutInfo = {
					productCode:chartRequestInfo.symbolCode,
					option: {
						channel: "chart",
						orderJointId:orderInfo.orderJointId, // #2481
						orderInfo:orderInfos
					}
				} as ILayoutInfo;
				let params:any = {
					layout: layout
				};
				
				self.openScreen('03020101', params);
			}
			catch(e) {
				console.error(e);
			}
			
			return;
		}

		if(actionCode == ACTION_CODE_CANCEL_ORDER) {
			try {
				let orderInfos:any[] = []; // orderInfos is array
				// #2481
				if(extraData.objectInfo.jointObjectInfos) {
					let nJoiCnt:number = extraData.objectInfo.jointObjectInfos.length;
					if(nJoiCnt && nJoiCnt > 0) {
						for(var ii = 0; ii < nJoiCnt; ii++) {
							let jointObjectInfo:any = extraData.objectInfo.jointObjectInfos[ii];
							if(jointObjectInfo && jointObjectInfo.originalData) {
								orderInfos.push(DeepCopy(jointObjectInfo.originalData));
							}
						}
					}
				}

				let orderInfo:any = DeepCopy(extraData.objectInfo.origin.originalData);
				if(orderInfos.length < 1 && orderInfo) {
					orderInfos.push(orderInfo);
				}
				//
				let layout:ILayoutInfo = {
					productCode:chartRequestInfo.symbolCode,
					option: {
						channel: "chart",
						orderJointId:orderInfo.orderJointId, // #2481
						orderInfo:orderInfos
					}
				} as ILayoutInfo;
				let params:any = {
					layout: layout
				};
				
				self.openScreen('03020102', params);
			}
			catch(e) {
				console.error(e);
			}
			
			return;
		}
		//

		// #2232
		if(actionCode == ACTION_CODE_SETTLE_ORDER) {
			try {
				if(extraData.objectInfo) {
					// #2332
					let layout:ILayoutInfo = {
						productCode:chartRequestInfo.symbolCode,
						option : DeepCopy(extraData.objectInfo.origin.originalData)
					} as ILayoutInfo;
					let params:any = {
						layout: layout
					};
					//

					// #3286
					layout.option.productName = chartRequestInfo.symbolName;
					//

					self.openScreen('03020103', params);
				}
			}
			catch(e) {
				console.error(e);
			}
			//

			return;
		}
		//
	}

	// #2138
	public deleteAlert(alert:any){
		MessageBox.question({
			title:CommonConst.PANEL_TITLE_CHART,
			message:"選択されたアラートを削除します。よろしいですか。"
		},
		(response, checkboxChecked)=>{
			if(response==1) { //OK
				let setting = this.resource.config.setting.alert;
				delete(setting[alert]);
				let info = [{"008":[setting]}];
				this.update(info,true);
			}
		}
		);
	}

	private update(alert,refresh:boolean=false){
		let self = this;
		let businessService:any = self.didGetBusinessService();
		if(businessService && businessService.setAlert) {
			businessService.setAlert(alert).subscribe(
				(val) => {
					if(val.status == "0"){
						self.resource.config.setting.alert = alert[0]["008"][0];
						self.panelMng.fireChannelEvent('alertAddModify', {});
					}
				},
				err=>{
					console.log(err);
				}
			)
		}
  }
	//

	//

	//
	//
	//

	/**
   * open screen
   *
   * @param scrId
   */
  protected openScreen(scrId, params?:any) {
		let self = this;

		// 外出した画面から呼び出される画面は外だして表示。
		if(params == null){
			params = {};
		}
		if(params.layout == null){
			params.layout = {};
		}
	
		params.layout.external = this.isExternalWindow();
		
    self.panelMng.openPanel(self.panelMng.virtualScreen(), scrId, params);
	}
	
  /**
   * 外だしウィンドウなのかチェックする。
   */
  protected isExternalWindow(){
    var win = window as any;
    var param = win.electron?win.electron.parameter?win.electron.parameter:null:null;

    return param?param.panelId?true:false:false;
	}
		
	/**
   * open speed-order-confirm dialog
   */
  public didShowSpeedOrderConfirm() {
		let self = this;
		let dialogService:DialogService = self.managerService.didGetDialogService();
		if(dialogService) {
      let disposable ;
      let chartRequestInfo = self.didGetChartRequestInfo();
      let param = {
        layout:{productCode:chartRequestInfo.symbolCode}	
      }
			if (this.resource.confirmHideSpeedOrderAgreement == false) {
				if(this.resource.environment.demoTrade){
					disposable = dialogService.addDialog(SpeedOrderConfirmComponent, { params: param });
				}else{
					disposable = dialogService.addDialog(SpeedOrderConfirmComponent, { params: param });
				}
			} else { 
				this.openScreen('03020104', param);
			}
		}
  }

	/**
   * view data㝮変更イベントを块信
   */
  public onChangeViewData( data:IViewData, sender:ViewBase, byChild:boolean ){
    super.onChangeViewData(data,sender,byChild);
	}
	
	protected didInitZSBControl() {
		let self = this;
		var __jqElem = self.getScrollWrapperJqElement();

    if(__jqElem !== undefined && __jqElem != null) {
			var __jqTarget = __jqElem.find('#eidZs_part');

      //----- lib/ngc/screenChart.js
      var elementId = "";// + __screenManager.count();
			var __zsScroll = $.ngcModule.didGetZsScrollScreen(elementId);
			var __zsScroll = $.ngcModule.didGetZsScrollScreen(elementId);
			__zsScroll.method.attachToTarget(__jqTarget);
			__zsScroll.didInitScreen();
			__zsScroll.SetZSBInit(30, 100, 4, true);

			self.scrollBar = __zsScroll;
			if(self.chart) {
				self.chart.didSetZSBHandle(__zsScroll);

				return(true);
			}
    }
	}

	didInitChart() {
		super.didInitChart();

		let self = this;
		self.didChangeCrosslineShow(true);
		
		if(self.chart !== undefined && self.chart != null) {
			if(self.didInitZSBControl() === true) {
				self.scrollBar.OnResize();
			}
		}
	}

	public didResizeComponent() {
		super.didResizeComponent();
    if(this.scrollBar !== undefined && this.scrollBar != null) {
      this.scrollBar.OnResize();
    }
  }

	protected didProcForAfterContentInit() {
		let self = this;
		if(self.chart !== undefined && self.chart != null) {
			if(self._demoRequest) {
				self.didDemoRequestSymbolData({symbolCode: self.symbolCode});
			}
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

	/**
	 * アラートライン表示・非表示
	 * @param  {Boolean} isUse===true
	 * @return {[type]}
	 */
	public didChangeUseAlertLine = (isUse:boolean) => {
		let self = this;
		if(isUse === true) {
			if(self.chartDeployData.useAlertLine === true) {
				// do nothing

				return;
			}

			self.didClearAlertData();

			self.chartDeployData.useAlertLine = true;

			let requestData:ChartRequestData = self.chartDeployData.requestData;
			if(!requestData) {
				return;
			}

			if(self.IsHistoryDataReceived()) {
				let securityCode:string = requestData.symbolCode;

				// request alert data
				self.didRequestAlertData(securityCode, self.didGetMarketCode());
			}
		}
		else {
			self.chartDeployData.useAlertLine = false;

			// clear

			// clear all alert line in chart
			self.didClearAlertData();
		}
	}

	/**
	 * 約定履歴ライン表示・非表示
	 * @param  {Boolean} isUse===true
	 * @return {[type]}
	 */
	public didChangeUseExecutionLine = (isUse:boolean) => {
		let self = this;
		if(isUse === true) {
			if(self.chartDeployData.useExecutionLine === true) {
				// do nothing

				return;
			}

			self.didClearExecutionData();

			self.chartDeployData.useExecutionLine = true;

			let requestData:ChartRequestData = self.chartDeployData.requestData;
			if(!requestData) {
				return;
			}

			if(self.IsHistoryDataReceived()) {
				let securityCode:string = requestData.symbolCode;

				// request execution data
				self.didRequestExecutionData(securityCode, self.didGetMarketCode());
			}
		}
		else {
			// clear
			self.chartDeployData.useExecutionLine = false;

			// clear all execution line in chart
			self.didClearExecutionData();
		}
	}

	protected didRequestExtraDataAll(securityCode:string, marketCode?:string, reload?:boolean) {
		super.didRequestExtraDataAll(securityCode, marketCode, reload);

    let self = this;
    self.didRequestAlertData(securityCode, marketCode, reload);
    self.didRequestExecutionData(securityCode, marketCode, reload);
	}

	// #2009
	protected didRequestExecutionData(securityCode:string, marketCode?:string, reload?:boolean) {
    // //console.debug("[LOG:CCVB] =======position list 生成==========");
    // http request
    let self = this;
    if(self.chartDeployData.useExecutionLine !== true) {
      return;
    }

    if(reload === true) {
      self.didClearExecutionData();
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
      oepShRef.didRequestExecutionData(securityCode, pointValue, marketCode);
    }
  }

  protected didRequestAlertData(securityCode:string, marketCode?:string, reload?:boolean) {
    // //console.debug("[LOG:CCVB] =======position list 生成==========");
    // http request
    let self = this;
    if(self.chartDeployData.useAlertLine !== true) {
      return;
    }

    if(reload === true) {
      self.didClearAlertData();
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
      oepShRef.didRequestAlertData(securityCode, pointValue, marketCode);
    }
  }
	//

	public didClearAlertData = () => {
		let self = this;
    if(this.chart && this.chart.didClearAlertObjects) {
      return(this.chart.didClearAlertObjects());
    }
	}
	
	public didClearExecutionData = () => {
		let self = this;
    if(this.chart && this.chart.didClearExecutionObjects) {
      return(this.chart.didClearExecutionObjects());
    }
	}
	
	/**
	 * データリクエスト㝮準備を㝙る。
	 * @param  {[type]} preRequestData
	 * @return {[type]}
	 */
  protected prepareForRequestingData(isDestory?:boolean) {
		super.prepareForRequestingData(isDestory);
		
		let self = this;
		
		self.didClearAlertData();
		self.didClearExecutionData();

    return(true);
  }

	// #1878
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
              if(val.type === ChartConst.NOTIFY_TYPE_OEP_HISTORY) {
								self.didReceiveOepDataFromServer(val.receiveDatas, val.isOrder);
              }
              else if(val.type === ChartConst.NOTIFY_TYPE_EXECUTION_HISTORY) {
                self.didReceiveExecutionDataFromServer(val.receiveDatas);
							}
							else if(val.type === ChartConst.NOTIFY_TYPE_ALERT_HISTORY) {
                self.didReceiveAlertDataFromServer(val.receiveDatas);
							}
            }
            catch(e) {
              console.error(e);
            }
          }
        }
      );
    }
	}
	
	public didReceiveAlertDataFromServer = (receiveDatas:any) => {
    if(this.chart && this.chart.didReceiveAlertDataFromServer) {
      return(this.chart.didReceiveAlertDataFromServer(receiveDatas));
    }
	}

	public didReceiveExecutionDataFromServer = (receiveDatas:any) => {
    if(this.chart && this.chart.didReceiveExecutionDataFromServer) {
      return(this.chart.didReceiveExecutionDataFromServer(receiveDatas));
    }
	}
	
  //

	//---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------

	// #2030
	public didSetCurrentIndicatorInformationAll = (saveInfo:string, decompress?:boolean) => {
		let self = this;
		try {
	    if(this.chart && this.chart.didSetCurrentIndicatorInformationAll) {
	      return(this.chart.didSetCurrentIndicatorInformationAll(saveInfo, decompress));
	    }
		}
		catch(e) {
			//console.debug(e);
		}

		return(false);
  };

	/**
	 * #2089
	 */
	didInitOepNotification() {
		let self = this;
		let businessService:any = self.didGetBusinessService();
		if(businessService && businessService.notifyer) {
			let notifyer:any = businessService.notifyer;
      if(notifyer.order) {
				// #3101
				self.notifySubscribe.push(notifyer.order().subscribe(
          val => {
            self.didProcForOepNotification(val, NOTIFICATION_TYPE_ORDER);
          },
          err => {
            //console.log(err);
          },
          () => {}
				));
				//
      }
      if(notifyer.position) {
				// #3101
				self.notifySubscribe.push(notifyer.position().subscribe(
          val => {
            self.didProcForOepNotification(val, NOTIFICATION_TYPE_POSITION);
          },
          err => {
            //console.log(err);
          },
          () => {}
				));
				//
      }
      if(notifyer.execution) {
				// #3101
				self.notifySubscribe.push(notifyer.execution().subscribe(
          val => {
            self.didProcForOepNotification(val, NOTIFICATION_TYPE_EXECUTION);
          },
          err => {
            //console.log(err);
          },
          () => {}
				));
				//
      }
		}

		// #2138
		this.notifySubscribe.push(self.panelMng.onChannelEvent().subscribe(
			(val) => {
				if(val && (val.channel == 'alertAddModify' || val.channel == "unselectAlert")) {
					self.didProcForOepNotification(val, NOTIFICATION_TYPE_ALERT);
				}
    }));
		//
	}
	
	// #2216
	protected didGetConvertedChartConfig() {
    let self = this;

    let resourceService:ResourceService = self.didGetResourceService();
		let displaySettings:IConfigChartDisplaySettings;
		let colorSettings:IConfigChartColorSettings;
    if(resourceService) {
			try {
				displaySettings = resourceService.config.setting.chartDisplay.chartSettings;
				colorSettings = resourceService.config.setting.chartColor.chartColorSettings;
			}
			catch(e) {
				console.error(e);
			}
    }

    if(!displaySettings && !colorSettings) {
      //console.debug("[CHART][CONFIG] there is no config information.");
      return;
    }

    let convertedConfig:any = {
    };

    try {
      //console.debug(chartConfig);
      let xChartConfig:any = {};

			// #2216
			if(displaySettings.gridDisplay == "vertical") {
				xChartConfig.GridVertHide = false;
				xChartConfig.GridHorzHide = true;
			}
			else if(displaySettings.gridDisplay == "horizontal") {
				xChartConfig.GridVertHide = true;
				xChartConfig.GridHorzHide = false;
			}
			else {
				xChartConfig.GridVertHide = false;
				xChartConfig.GridHorzHide = false;
			}
			//
			xChartConfig.ShowCurrentPrice = IsShowDisplaySetting(displaySettings.currentPriceDisplay);
			xChartConfig.ShowHighLowPrice = IsShowDisplaySetting(displaySettings.highLowPriceDisplay);

			xChartConfig.DetailViewStatusIsShown = IsShowDisplaySetting(displaySettings.detailPriceDisplay); // #2308
	
			let colorSettings:IConfigChartColorSettings = self.resource.config.setting.chartColor.chartColorSettings;
			xChartConfig.GridHorzColor    = 
			xChartConfig.GridVertColor    = colorSettings.gridColor;
			xChartConfig.CandleUpColor  	= colorSettings.positiveLineFillColor;
			xChartConfig.CandleDnColor    = colorSettings.hiddenLineFillColor;

      convertedConfig.chartConfig = xChartConfig;
    }
    catch(e) {
      console.error(e);
    }

    return(convertedConfig);
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
  
  //===================================================================================================================
	// MARK: Notification
	//===================================================================================================================
	protected didProcForOepNotification(notification:any, type?:number) {
		let self = this;

		let securityCode:string;

		if(self.IsHistoryDataReceived() !== true) {
			return;
		}

		if(self.chartDeployData.requestData) {
			securityCode = self.chartDeployData.requestData.symbolCode;
		}

		if(securityCode && typeof securityCode === "string" && securityCode !== "") {
			let marketCode:string = self.didGetMarketCode();

			// Order & Position
			setTimeout(() => {
          if(type == NOTIFICATION_TYPE_ORDER) {
						self.didRequestOrderData(securityCode, marketCode, true);
          }
          else if(type == NOTIFICATION_TYPE_POSITION) {
						self.didRequestPositData(securityCode, marketCode, true);
          }
          else if(type == NOTIFICATION_TYPE_EXECUTION) {
            self.didRequestExecutionData(securityCode, marketCode, true);
					}
					else if(type == NOTIFICATION_TYPE_ALERT) {
            self.didRequestAlertData(securityCode, marketCode, true);
          }
			},
			50);
		}
	}

	// #2308
	public didClosedInfoPanel = () => {
		let self = this;
		if(self.chart !== undefined && self.chart != null) {
			let xChartConfig:any = {
				DetailViewStatusIsShown : false
			};
			self.chart.didApplyChartSetting(xChartConfig);
		}
	}
	//

	// #2437
	protected didProcForAmendOrder(argData:any) {
		let self = this;

		setTimeout(() => {
			if(argData) {
				let chartRequestInfo:ChartCFDRequestInfo = self.didGetChartRequestInfo();

				try {
					let orderInfos:any[] = []; // orderInfos is array
					// #2481
					if(argData.jointObjectInfos) {
						let nJoiCnt:number = argData.jointObjectInfos.length;
						if(nJoiCnt && nJoiCnt > 0) {
							for(var ii = 0; ii < nJoiCnt; ii++) {
								let jointObjectInfo:any = argData.jointObjectInfos[ii];
								if(jointObjectInfo && jointObjectInfo.originalData) {
									orderInfos.push(DeepCopy(jointObjectInfo.originalData));
								}
							}
						}
					}

					let orderInfo:any = DeepCopy(argData.objectInfo.originalData);
					if(orderInfos.length < 1 && orderInfo) {
						orderInfos.push(orderInfo);
					}
					//

					// #2480
					var xPrice:any = {
						price: argData.price,
						point: argData.symbol.receiveInfo.pointValue
					};

					var priceValue = GetPointValue(xPrice);
					//

					let layout:ILayoutInfo = {
						productCode:chartRequestInfo.symbolCode,
						option: {
							channel: "chart",
							orderJointId:orderInfo.orderJointId, // #2481
							orderInfo:orderInfos,
							priceValue:priceValue,	// #2480
						}
					} as ILayoutInfo;
					let params:any = {
						layout: layout
					};
					
					self.openScreen('03020101', params);
				}
				catch(e) {
					console.error(e);
				}
			}
		});
	}
	//

	// #2459
	private didShowAlertModify = (extraData:any) => {
		if(!extraData) {
			return;
		}

		let self = this;
		let dialogService:DialogService = self.managerService.didGetDialogService();
		if(dialogService) {
			let params:any = {
				key:extraData.objectId,
				product:extraData.product,
				basicRate:extraData.priceValue
			};

			dialogService.addDialog(AlertModifyDialogComponent,{params:params}).subscribe(
				(val) => {
					if(val) {
						self.panelMng.fireChannelEvent('alertAddModify', {});
					}
				});
		}
	}

	protected didProcForSettlement(argData:any) {
		let self = this;

		setTimeout(() => {
			if(argData) {
				let chartRequestInfo:ChartCFDRequestInfo = self.didGetChartRequestInfo();

				try {
					if(argData.objectInfo && argData.objectInfo.alertKey) {
						var xPrice:any = {
							price: argData.price,
							point: argData.symbol.receiveInfo.pointValue
						};
	
						var priceValue = GetPointValue(xPrice);

						let extraData:any = {
							product:argData.symbolCode,
							objectId:argData.objectInfo.alertKey,
							priceValue:priceValue,
							objectInfo:argData.objectInfo
						};

						self.didShowAlertModify(extraData);
					}
				}
				catch(e) {
					console.error(e);
				}
			}
		});
	}
	//

	//---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------

	// #2318
  protected didShowErrorMessage(errorCode:number, errorMessage:string, reserved?:any) {
		let self = this;
		let errorInfo:ChartCFDErrorInfo = reserved as ChartCFDErrorInfo;
		if(errorInfo) {
			let isWarnMessage:boolean = true; // 

			const NETWORK_ERROR_MESSAGE:string = Messages.ERR_0002;
			const OEP_NG_MESSAGE:string   		 = Messages.ERR_0001;
			const OEP_WARN_MESSAGE:string 		 = Messages.ERR_0001;

			let title:string;
			let	message:string;
			let demoTrade:boolean = self.resource.environment.demoTrade;
			if(errorInfo.isPrice == true) {
				title = "チャート取得エラー";
				if(errorInfo.isTick == true) {
					if(errorInfo.status == ERROR_CODE.NETWORK) {
						message = NETWORK_ERROR_MESSAGE + "[CFDS0402C]";
					}
					else if(errorInfo.status == ERROR_CODE.HTTP) {
						if(errorCode == 500) {
							message = Messages.ERR_0014 + "[CFDS0401Y]";
						}
						else if(errorCode == 400) {
							message = Messages.ERR_0014;
						}
					}
				}
				else {
					if(errorInfo.status == ERROR_CODE.NETWORK) {
						message = NETWORK_ERROR_MESSAGE + "[CFDS0302C]";
					}
					else if(errorInfo.status == ERROR_CODE.HTTP) {
						if(errorCode == 500) {
							message = Messages.ERR_0014 + "[CFDS0301Y]";
						}
						else if(errorCode == 400) {
							message = Messages.ERR_0014;
						}
					}
				}
			}
			else if(errorInfo.isOrder == true) {
				title = "注文一覧取得エラー";
				if(errorInfo.status == ERROR_CODE.NETWORK) {
					message = NETWORK_ERROR_MESSAGE + "[CFDS0902C]"
				}
				else if(errorInfo.status == ERROR_CODE.NG) {
					message = OEP_NG_MESSAGE + "[CFDS0901T]";
				}
				else if(errorInfo.status == ERROR_CODE.WARN) {
					message = OEP_WARN_MESSAGE;
				}
			}
			else if(errorInfo.isPosition == true) {
				title = "建玉一覧取得エラー";
				if(errorInfo.status == ERROR_CODE.NETWORK) {
					message = NETWORK_ERROR_MESSAGE + "[CFDS0802C]"
				}
				else if(errorInfo.status == ERROR_CODE.NG) {
					message = OEP_NG_MESSAGE + "[CFDS0801T]";
				}
				else if(errorInfo.status == ERROR_CODE.WARN) {
					message = OEP_WARN_MESSAGE;
				}
			}
			else if(errorInfo.isExecution == true) {
				title = "約定履歴取得エラー";
				if(errorInfo.status == ERROR_CODE.NETWORK) {
					message = NETWORK_ERROR_MESSAGE + "[CFDS1002C]"
				}
				else if(errorInfo.status == ERROR_CODE.NG) {
					message = OEP_NG_MESSAGE + "[CFDS1001T]";
				}
				else if(errorInfo.status == ERROR_CODE.WARN) {
					message = OEP_WARN_MESSAGE;
				}
			}

			if(message && message.length > 0) {
				if(isWarnMessage === undefined || isWarnMessage == null) {
					MessageBox.info({title:title, message:message});
				}
				else if(isWarnMessage === true) {
					MessageBox.warning({title:title, message:message});
				}
				else {
					MessageBox.error({title:title, message:message});
				}
			}
		}
	}
	// [end] #2318

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
