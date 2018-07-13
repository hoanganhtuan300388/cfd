import { OnInit } from '@angular/core';
import { CommonEnum, CommonConst } from '../core/common';

import { Observable } from 'rxjs/Rx';

import { GetProductTypeFromSymbolCode, DeepCopy, ConvertSimpleDateFromBusinessDate, FormatDate, GetDecimalPointFromMeigaraInfo, IsArray, AppendDatas } from "../util/commonUtil";

//import { IReqOrderHistory } from "../values/values";
import { IReqPositionList } from "../values/values";
import { Deferred } from "../util/deferred";
import { ManagerService } from "../service/manager.service";

import * as ChartConst from '../const/chartConst';
import { ChartSymbolInfo, OrderData, PositData, didConvertDatetimeFromServer } from "./chartTypeInterface";
import { MakeOrderDataFromRawData, MakePositDataFromRawData, MakeExecutionDataFromRawData, MakeAlertDataFromRawData } from './chartCFDInterface';

import { ChartTransactionBaseHandler } from './chartTransactionBaseHandler';

// #2318
import { ERROR_CODE } from "../../../common/businessApi";
import { ChartCFDErrorInfo } from "./chartCFDInterface";
//

declare var $:any;

export class ChartTransactionOepHandler extends ChartTransactionBaseHandler {
	//
	protected deferred: Deferred<any> = new Deferred<any>();

	protected pointValue: number;

	//
	constructor(protected managerService: ManagerService, protected uniqueId:number) {
		super(managerService, uniqueId);
  }

	/**
   * ディレクティブ・コンポーポントを破棄㝙る剝㝫呼㝰れ㝾㝙。
   * @return {[type]}
   */
  public didDestroy() {
		let self = this;

		super.didDestroy();
  }

	protected didNotifyReceiveDatas(receiveDatas:any, isOrder:boolean) {
		let self = this;
		if(self.deferred) {
			let notifyData:any = {
				type  : ChartConst.NOTIFY_TYPE_OEP_HISTORY,
				receiveDatas : receiveDatas,
				isOrder : isOrder
			}

			self.deferred.next(notifyData);
		}
	}

	protected didNotifyReceiveAlerts(receiveDatas:any) {
		let self = this;
		if(self.deferred) {
			let notifyData:any = {
				type  : ChartConst.NOTIFY_TYPE_ALERT_HISTORY,
				receiveDatas : receiveDatas
			}

			self.deferred.next(notifyData);
		}
	}

	protected didNotifyReceiveExecutions(receiveDatas:any) {
		let self = this;
		if(self.deferred) {
			let notifyData:any = {
				type  : ChartConst.NOTIFY_TYPE_EXECUTION_HISTORY,
				receiveDatas : receiveDatas
			}

			self.deferred.next(notifyData);
		}
	}

	/**
	 * [didRequestOrderData description]
	 * @return {[type]}
	 */
	public didRequestOrderData(securityCode:string, pointValue:number, marketCode?:string) {
		// http request
		var self = this;
		self.pointValue = pointValue;

		//
		var input: any = {listdataGetType:'ALL'};
		let businessService:any = self.didGetBusinessService();
		if(!businessService) {
			// console.debug("");
			return;
		}

		//
		let productType:string = GetProductTypeFromSymbolCode(securityCode);

		var nextFunc = (val) => {
			// #2318
			if(val) {
				if(val.status == ERROR_CODE.NG || val.status == ERROR_CODE.WARN) {
					let errorInfo:ChartCFDErrorInfo = {
						status:val.status,
						isOrder:true,
					} as ChartCFDErrorInfo;
					self.didNotifyResponseError(0, null, errorInfo);
				}
				else {
					var orderHistoryItem = val.result['orderList'];
					let receiveDatas:any = [];
					if(IsArray(orderHistoryItem)) {
						var nCount = orderHistoryItem.length;
						for(var ii = 0; ii < nCount; ii++) {
							var orderData = MakeOrderDataFromRawData(orderHistoryItem[ii], securityCode, self.didGetPointValue());
							if(orderData) {
								receiveDatas.push(orderData);
							}
						}
					}
					else {
						var orderData = MakeOrderDataFromRawData(orderHistoryItem, securityCode, self.didGetPointValue());
						if(orderData) {
							receiveDatas.push(orderData);
						}
					}

					try {
						self.didNotifyReceiveDatas(receiveDatas, true);
					}
					catch(e) {
						console.error(e);
					}
				}
			}
		};

		// #2318
		var errorFunc = (err) => {
			if(err) {
				// #2318
				switch(err.status) {
					case ERROR_CODE.NETWORK:
					case ERROR_CODE.HTTP: {
							let errorInfo:ChartCFDErrorInfo = {
								status:err.status,
								isOrder:true,
							} as ChartCFDErrorInfo;
							self.didNotifyResponseError(err.statusCode, null, errorInfo);
						}
						break;
				}
				//
			}
		};
		//

		if(businessService.getOrderList) {
			businessService.getOrderList(input).subscribe(nextFunc, errorFunc); // #2318
		}
	}

	public didRequestPositData(securityCode:string, pointValue:number, marketCode?:string) {
		// console.debug("[LOG:CCVB] =======position list 生成==========");
    // http request
		let self = this;
		self.pointValue = pointValue;

    var input: IReqPositionList = {listdataGetType:'ALL'} as IReqPositionList;
		let businessService:any = self.didGetBusinessService();
		if(!businessService) {
			// console.debug("");
			return;
		}

		//
		let productType:string = GetProductTypeFromSymbolCode(securityCode);

		var nextFunc = (val) => {
			// #2318
			if(val) {
				if(val.status == ERROR_CODE.NG || val.status == ERROR_CODE.WARN) {
					let errorInfo:ChartCFDErrorInfo = {
						status:val.status,
						isPosition:true,
					} as ChartCFDErrorInfo;
					self.didNotifyResponseError(0, null, errorInfo);
				}
				else {
					var positHistoryItem = val.result['positionList'];
					let receiveDatas:any = [];
					if(IsArray(positHistoryItem)) {
						var nCount = positHistoryItem.length;
						for(var ii = 0; ii < nCount; ii++) {
							var positData = MakePositDataFromRawData(positHistoryItem[ii], securityCode, self.didGetPointValue());
							if(positData) {
								receiveDatas.push(positData);
							}
						}
					}
					else {
						var positData = MakePositDataFromRawData(positHistoryItem, securityCode, self.didGetPointValue());
						if(positData) {
							receiveDatas.push(positData);
						}
					}

					try {
						self.didNotifyReceiveDatas(receiveDatas, false);
					}
					catch(e) {
						console.error(e);
					}
				}
			}
		};

		// #2318
		var errorFunc = (err) => {
			if(err) {
				// #2318
				switch(err.status) {
					case ERROR_CODE.NETWORK:
					case ERROR_CODE.HTTP: {
							let errorInfo:ChartCFDErrorInfo = {
								status:err.status,
								isPosition:true,
							} as ChartCFDErrorInfo;
							self.didNotifyResponseError(err.statusCode, null, errorInfo);
						}
						break;
				}
				//
			}
		};
		//

		if(businessService.getPositionList) {
			businessService.getPositionList(input).subscribe(nextFunc, errorFunc); // #2318
		}
	}

	/**
	 * [didRequestExecutionData description]
	 * @return {[type]}
	 */
	public didRequestExecutionData(securityCode:string, pointValue:number, marketCode?:string) {
		// #3451
		/*
		// http request
		var self = this;
		self.pointValue = pointValue;

		//
		let input: any = { listdataGetType:"ALL", executionDateType:"1" }; // #2032
		let businessService:any = self.didGetBusinessService();
		if(!businessService) {
			// console.debug("");
			return;
		}

		//
		let productType:string = GetProductTypeFromSymbolCode(securityCode);

		var nextFunc = (val) => {
			// #2318
			if(val) {
				if(val.status == ERROR_CODE.NG || val.status == ERROR_CODE.WARN) {
					let errorInfo:ChartCFDErrorInfo = {
						status:val.status,
						isExecution:true,
					} as ChartCFDErrorInfo;
					self.didNotifyResponseError(0, null, errorInfo);
				}
				else {
					var executionHistoryItem = val.result['executionList'];
					let receiveDatas:any = [];
					if(IsArray(executionHistoryItem)) {
						var nCount = executionHistoryItem.length;
						for(var ii = 0; ii < nCount; ii++) {
							var executionData = MakeExecutionDataFromRawData(executionHistoryItem[ii], securityCode, self.didGetPointValue());
							if(executionData) {
								receiveDatas.push(executionData);
							}
						}
					}
					else {
						var executionData = MakeExecutionDataFromRawData(executionHistoryItem, securityCode, self.didGetPointValue());
						if(executionData) {
							receiveDatas.push(executionData);
						}
					}

					try {
						self.didNotifyReceiveExecutions(receiveDatas);
					}
					catch(e) {
						console.error(e);
					}
				}
			}
		};

		// #2318
		var errorFunc = (err) => {
			if(err) {
				// #2318
				switch(err.status) {
					case ERROR_CODE.NETWORK:
					case ERROR_CODE.HTTP: {
							let errorInfo:ChartCFDErrorInfo = {
								status:err.status,
								isExecution:true,
							} as ChartCFDErrorInfo;
							self.didNotifyResponseError(err.statusCode, null, errorInfo);
						}
						break;
				}
				//
			}
		};
		//

		if(businessService.getExecutionList) {
			businessService.getExecutionList(input).subscribe(nextFunc, errorFunc); // #2318
		}
		*/
		// [end] #3451
	}

	/**
	 * [didRequestExecutionData description]
	 * @return {[type]}
	 */
	public didRequestAlertData(securityCode:string, pointValue:number, marketCode?:string) {
		// http request
		var self = this;
		self.pointValue = pointValue;

		//
		var input: any = {};
		let businessService:any = self.didGetBusinessService();
		if(!businessService) {
			// console.debug("");
			return;
		}

		//
		let productType:string = GetProductTypeFromSymbolCode(securityCode);

		var nextFunc = (val) => {
			console.log(val);
			var alertHistoryItem = [];
			let receiveDatas:any = [];
			try {
				var resultItems = val.result;
				var xAlert;
				if(IsArray(resultItems)) {
					for(var ii = 0; ii < resultItems.length; ii++) {
						let resultItem = resultItems[ii];
						if(resultItem && resultItem[CommonConst.SETTING_FUNCTION_ID_ALERT]) {
							xAlert = resultItem[CommonConst.SETTING_FUNCTION_ID_ALERT];
							break;
						}
					}
				}
				else {
					xAlert = resultItems[CommonConst.SETTING_FUNCTION_ID_ALERT];
				}

				if(xAlert && xAlert.length && xAlert.length > 0) {
					let xAlertItem = xAlert[0];
					let keys = Object.keys(xAlertItem);
					for(var ii = 0; ii < keys.length; ii++) {
						let key = keys[ii];
						let alertData = DeepCopy(xAlertItem[key]);
						alertData.alertKey = key;
						alertHistoryItem.push(alertData);
					}
				}

				if(IsArray(alertHistoryItem)) {
					var nCount = alertHistoryItem.length;
					for(var ii = 0; ii < nCount; ii++) {
						var alertData = MakeAlertDataFromRawData(alertHistoryItem[ii], securityCode, self.didGetPointValue());
						if(alertData) {
							receiveDatas.push(alertData);
						}
					}
				}
				else {
					var alertData = MakeAlertDataFromRawData(alertHistoryItem, securityCode, self.didGetPointValue());
					if(alertData) {
						receiveDatas.push(alertData);
					}
				}
			}
			catch(e) {
				console.error(e);
			}

			//console.debug("[LOG:CCVB] orderHistoryItem: \n");
			// console.debug(receiveDatas);
			//this.createRowData(this.symbolStockCode,this.dateFrom,this.dateTo);
			try {
				self.didNotifyReceiveAlerts(receiveDatas);
			}
			catch(e) {
				console.error(e);
			}
		};

		if(businessService.getAlert) {
			businessService.getAlert(input).subscribe(nextFunc);
		}
	}

	protected didGetPointValue() : number {
		let self = this;

		return(self.pointValue);
	}
}
