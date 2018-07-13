/**
 *
 * レート一覧：価格リスト
 *
 */
import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import {
	PanelViewBase, ComponentViewBase,
	PanelManageService, BusinessService, ResourceService,
	CommonConst, Tooltips,
	IViewState, IViewData, ViewBase, StringUtil
} from "../../core/common";
import { IReqOrderDetail, IResOrderDetail } from "../../values/Values";
import { Comma } from '../../util/stringUtil';
import { ERROR_CODE } from "../../../../common/businessApi";
import { Messages, GetWarningMessage} from '../../../../common/message';
import { MessageBox } from '../../util/utils';
import { isError } from 'util';

declare var moment: any;

export interface orderDetailInfo {
	cfdProductCodeDetail: string,
	settleTypeDetail: string,
	buySellTypeDetail: string,
	orderTypeDetail: string,
	orderQuantityDetail: string,
	executionTypeDetail: string,
	orderPriceDetail: string,
	orderPriceDetailUnit: string,
	orderStatusDetail: string,
	failureReasonDetail: string,
	losscutRateDetail: string,
	orderDatetimeDetail: string,
	invalidDatetimeDetail: string,
	orderJointIdDetail: string,
	buySellType: number,
}

export interface orderOperationInfo {
	orderOperType: string,
	orderDateOper: string,
	orderType: string,
	settleType: string,
	orderExe: string,
	orderPrice: string,
	trailWidth: string,
	losscut: string,
	orderDate: string,
	orderExec: string,
	isGroup: boolean
}
export interface orderSettleInfo {
	cfdProductCode: string,
	buySellType: string,
	excutionDate: string,
	settlementDueDate: string,
	currentQuantity: string,
	quotationPrice: string,
	settleAmount: string,
	settlementPrice: string,

	profitLoss: string,
	interestRateAmount: string,
	dividendAmount: string,
	commission: string,
	positionKey: string,
}
export interface orderExecutionInfo {
	cfdProductCodeDetail: string,
	settleType: string,
	buySellTypeDetail: string,
	excutionDate: string,
	settleDate: string,
	buySellType: string;
	executionQuantity: string,
	executionPrice: string,
	conversionRate: string,
	settleAmount: string,
	profitLoss: string,
	interestRateAmount: string,
	dividendAmount: string,
	commission: string,
	executionKey: string,
}

//-----------------------------------------------------------------------------
// COMPONENT : orderDetailComponent
// ----------------------------------------------------------------------------
@Component({
	selector: 'orderDetail',
	templateUrl: './orderDetail.component.html',
	styleUrls: ['./orderDetail.component.scss']
})
export class orderDetailComponent extends ComponentViewBase implements OnInit {
	//---------------------------------------------------------------------------
	// property
	// --------------------------------------------------------------------------

	public orderKey;
	public orderDetailList: Array<orderDetailInfo> = [];
	public operationList: Array<orderOperationInfo> = [];
	public executionList: Array<orderExecutionInfo> = [];
	public orderSettleList: Array<orderSettleInfo> = [];
	public settleType;
	public executionType;

	// public settle_cfdProductCode = "";
	// public settle_buySellType = "";
	// public settle_buySellTypeName = "";
	// public settle_excutionDate = "";
	// public settle_settlementDueDate = "";
	// public settle_currentQuantity = "";
	// public settle_quotationPrice = "";
	// public settle_settlementQuantity = "";
	// public settle_settlementPrice = "";
	// public settle_settleAmount = "";
	// public settle_profitLoss = "";
	// public settle_interestRateAmount = "";
	// public settle_dividendAmount = "";
	// public settle_commission = "";
	// public settle_positionKey = "";

	public IFListDetail: string = "1";
	public rowCount: number;
	public showOperation: boolean = false;
	public showExection: boolean = false;
	public showSettlePosition: boolean = false;
	private cfdProductCode: string;
  public orderExec:string;
  
  public isError:boolean = false;
  public errTxt:string = "";
	//---------------------------------------------------------------------------
	// constructor
	// --------------------------------------------------------------------------
	constructor(public panelMng: PanelManageService,
		public resource: ResourceService,
		public business: BusinessService,
		public element: ElementRef,
		public changeRef: ChangeDetectorRef) {
		super(panelMng, element, changeRef);
		//console.log("orderDetail=>"+this.orderKey);
	}

	//---------------------------------------------------------------------------
	// member
	//---------------------------------------------------------------------------
	public orderDetailTrSend(orderKey: string) {
		this.init();
		console.log("orderDetailTrSend");
		console.log("orderKey==>" + orderKey);
		this.orderKey = orderKey
		let Detail;

		var input: IReqOrderDetail = { orderKey: this.orderKey };
		console.log("input.orderKey==>" + input.orderKey);
		this.business.getOrderDetail(input).subscribe(
			val => {
				console.log("getOrderDetail");
        console.log(val);
        if(val.status == ERROR_CODE.OK) { // NG or WARN
		  this.isError = false;
		  this.orderDetailList.length = 0;
		  this.operationList.length = 0;
		  this.executionList.length = 0;
		  this.orderSettleList.length = 0;
          this.orderDetail(val.result.orderDetailList);
          this.orderOperation(val.result.orderOperationList)
          this.execution(val.result.executionList);
          this.settlePosition(val.result.settlePositionList);
          console.log(this.orderDetailList);
          console.log(this.operationList);
          console.log(this.executionList);
          console.log(this.orderSettleList);
        }
        else if(val.status == ERROR_CODE.WARN) { // NG or WARN
          this.isError = true;
          this.errTxt = Messages.ERR_0006;
        }
        else if(val.status == ERROR_CODE.NG) {
          this.isError = true;
          this.errTxt = Messages.ERR_0006 + '[CFDS1501T]';
        }
				this.updateView();
			},
			err => {
        switch(err.status) {
          case ERROR_CODE.NETWORK:
            this.isError = true;
            this.errTxt = Messages.ERR_0002 + '[CFDS1502C]';
            break;
        }
        this.updateView();
			}
		)

	}

	public settlePosition(settleList) {
		if (settleList.length == 0) {
			this.showSettlePosition = false;
			return;
		}
		this.showSettlePosition = true;
		let dividendExistenceFlg: string;
		for (var settle of settleList) {
			let settleinfo:any = {};
			settleinfo.settle_cfdProductCode = this.business.symbols.getSymbolInfo(settle.cfdProductCode).meigaraSeiKanji;
			dividendExistenceFlg = this.business.symbols.getSymbolInfo(settle.cfdProductCode).dividendExistenceFlg;
			settleinfo.settle_buySellType = settle.buySellType;
			settleinfo.settle_buySellTypeName = settle.buySellType == "1" ? "売" : "買";
			settleinfo.settle_excutionDate = moment(settle.excutionDate, 'YYYYMMDDHHmmss').format('YY/MM/DD HH:mm:ss');
			settleinfo.settle_settlementDueDate = settle.settlementDueDate == "25001231235959" ? "-" : moment(settle.settlementDueDate, 'YYYYMMDDHHmmss').format('YY/MM/DD HH:mm:ss');
			settleinfo.settle_currentQuantity = this.withComma(settle.currentQuantity);
			settleinfo.settle_quotationPrice = this.formatNumber(settle.quotationPrice,true);

			settleinfo.settle_settlementQuantity = this.withComma(settle.settlementQuantity);
			settleinfo.settle_settlementPrice = this.formatNumber(settle.settlementPrice,true);
			settleinfo.settle_settleAmount = this.formatNumber(settle.settleAmount);
			let result = this.isMinus(settle.settleAmount);
			if (result == "minus") {
				settleinfo.settle_settleAmountWithColor = true;
			} else if (result == "plus") {
				settleinfo.settle_settleAmount = "+" + settleinfo.settle_settleAmount;
			}
			settleinfo.settle_profitLoss = this.formatNumber(settle.profitLoss);
			result = this.isMinus(settle.profitLoss);
			if (result == "minus") {
				settleinfo.settle_profitLossWithColor = true;
			} else if (result == "plus") {
				settleinfo.settle_profitLoss = "+" + settleinfo.settle_profitLoss;
			}
			settleinfo.settle_interestRateAmount = this.formatNumber(settle.interestRateAmount);
			result = this.isMinus(settle.interestRateAmount);
			if (result == "minus") {
				settleinfo.settle_interestRateAmountWithColor = true;
			} else if (result == "plus") {
				settleinfo.settle_interestRateAmount = "+" + settleinfo.settle_interestRateAmount;
			}
			if (dividendExistenceFlg == '0') {
				settleinfo.settle_dividendAmount = "-";
			} else {
				settleinfo.settle_dividendAmount = this.formatNumber(settle.dividendAmount);
				result = this.isMinus(settle.dividendAmount);
				if (result == "minus") {
					settleinfo.settle_dividendAmountWithColor = true;
				} else if (result == "plus") {
					settleinfo.settle_dividendAmount = "+" + settleinfo.settle_dividendAmount;
				}
			}
			settleinfo.settle_commission = this.formatNumber(settle.commission);
			result = this.isMinus(settle.commission);
			if (result == "minus") {
				settleinfo.settle_commissionWithColor = true;
			} else if (result == "plus") {
				settleinfo.settle_commission = "+" + settleinfo.settle_commission;
			}
			settleinfo.settle_positionKey = settle.positionKey.substring(settle.positionKey.length - 4, settle.positionKey.length);
			this.orderSettleList.push(settleinfo);
		}
	}

	public execution(executionListArray) {
		if (executionListArray.length == 0) {
			this.showExection = false;
			return;
		}
		this.showExection = true;
		let dividendExistenceFlg: string;
		for (var exec of executionListArray) {
			let execInfo: any = {};
			execInfo.cfdProductCode = this.business.symbols.getSymbolInfo(exec.cfdProductCode).meigaraSeiKanji;
			dividendExistenceFlg = this.business.symbols.getSymbolInfo(exec.cfdProductCode).dividendExistenceFlg;
			execInfo.settleType = exec.settleType == "0" ? "新規" : "決済";
			execInfo.buySellType = exec.buySellType;
			execInfo.buySellTypeDetail = exec.buySellType == "1" ? "売" : "買";;
			execInfo.excutionDate = moment(exec.executionDatetime, 'YYYYMMDDHHmmss').format('YY/MM/DD HH:mm:ss');
			execInfo.settleDate = moment(exec.settleDate, 'YYYYMMDD').format('YY/MM/DD');
			execInfo.executionQuantity = this.withComma(exec.executionQuantity);
			execInfo.executionPrice = this.formatNumber(exec.executionPrice,true);

			if (exec.conversionRate.length >= 6) {
				execInfo.conversionRate = this.formatNumber(exec.conversionRate.substring(0, 6));
			} else {
				execInfo.conversionRate = this.formatNumber(exec.conversionRate);
			}
			let result = null;
			if (exec.settleType == "0") {
				execInfo.settleAmount = "-";
				execInfo.profitLoss = "-";
				execInfo.interestRateAmount = "-"
				execInfo.dividendAmount = "-";
			} else if (exec.settleType == "1") {
				execInfo.settleAmount = this.formatNumber(exec.settleAmount);
				result = this.isMinus(exec.settleAmount);
				if (result == "minus") {
					execInfo.settleAmountWithColor = true;
				} else if (result == "plus") {
					execInfo.settleAmount = "+" + execInfo.settleAmount;
				}
				execInfo.profitLoss = this.formatNumber(exec.profitLoss);
				result = this.isMinus(exec.profitLoss);
				if (result == "minus") {
					execInfo.profitLossWithColor = true;
				} else if (result == "plus") {
					execInfo.profitLoss = "+" + execInfo.profitLoss;
				}
				execInfo.interestRateAmount = this.formatNumber(exec.interestRateAmount);
				result =  this.isMinus(exec.interestRateAmount);
				if (result == "minus") {
					execInfo.interestRateAmountWithColor = true;
				} else if (result == "plus") {
					execInfo.interestRateAmount = "+" + execInfo.interestRateAmount;
				}
				if (dividendExistenceFlg == '0') {
					execInfo.dividendAmount = "-";
				} else {
					execInfo.dividendAmount = this.formatNumber(exec.dividendAmount);
					result = this.isMinus(exec.dividendAmount);
					if (result == "minus") {
						execInfo.dividendAmountWithColor = true;
					} else if (result == "plus") {
						execInfo.dividendAmount = "+" + execInfo.dividendAmount;
					}
				}
			}
			execInfo.commission = this.formatNumber(exec.commission);
			result = this.isMinus(exec.commission);
			if (result == "minus") {
				execInfo.commissionWithColor = true;
			} else if (result == "plus") {
				execInfo.commission = "+" + execInfo.commission;
			}
			execInfo.executionKey = exec.executionKey.substring(exec.executionKey.length - 4, exec.executionKey.length)
			console.log("execInfo.executionKey=>" + execInfo.executionKey);
			this.executionList.push(execInfo);
		}
		console.log("this.executionList=>" + this.executionList);
	}

	public orderOperation(orderOperationList) {
		let list = orderOperationList.filter((oper) => oper.orderOperationType != "1");
		if (list.length == 0) {
			this.showOperation = false;
			return;
		}
		this.showOperation = true;
		//let oper : orderOperationList;
		let count = 0;

		let type = orderOperationList[0].orderType;
		for (let oper of orderOperationList) {
			for (let i = 0; i < this.rowCount; i++) {
				let operInfo: any = {};
				if (i != 0) {
					operInfo.isGroup = true;
				} else {
					operInfo.isGroup = false;
				}
				if (oper.orderOperationType == "1") {
					operInfo.orderOperType = "新規";
				} else if (oper.orderOperationType == "2") {
					operInfo.orderOperType = "変更";
				} else {
					operInfo.orderOperType = "取消";
				}

				operInfo.orderDateOper = moment(oper.orderOperationDatetime, 'YYYYMMDDHHmmss').format('YY/MM/DD HH:mm:ss');
				operInfo.orderType = this.orderType(oper.orderType);

				count++;
				if (oper.orderType == "3" || oper.orderType == "2") {
					if (count == 3) {
						count = 1;
					}
				} else if (type == "4") {
					if (count == 4) {
						count = 1;
					}
				}

				if (oper.orderType == "4") {
					if (count == 1) {
						operInfo.settleType = "新規";
						operInfo.orderPrice = this.formatNumber(oper.orderPrice,true);
						operInfo.orderExec = this.orderExec;
					} else if (count == 2) {
						operInfo.settleType = "決済";
						operInfo.orderPrice = this.formatNumber(oper.orderPriceSettle,true);
						operInfo.orderExec = "指値";
					} else {
						operInfo.settleType = "決済";
						operInfo.orderPrice = this.formatNumber(oper.orderPriceOcoStop,true);
						operInfo.orderExec = "逆指値";
					}
				} else if (oper.orderType == "3") {
					if (this.settleType == "0") {
						operInfo.settleType = "新規";
					} else {
						operInfo.settleType = "決済";
					}
					if (count == 1) {
						operInfo.orderPrice = this.formatNumber(oper.orderPriceSettle,true);
						operInfo.orderExec = "指値";
					} else {
						operInfo.orderPrice = this.formatNumber(oper.orderPriceOcoStop,true);
						operInfo.orderExec = "逆指値";
					}
				} else if (oper.orderType == "2") {
					if (count == 1) {
						operInfo.settleType = "新規";
						operInfo.orderPrice = this.formatNumber(oper.orderPrice,true);
					} else {
						operInfo.settleType = "決済";
						operInfo.orderPrice = this.formatNumber(oper.orderPriceSettle,true);
					}
				} else {
					operInfo.settleType = this.settleType == "0" ? "新規" : "決済";
					operInfo.orderPrice = this.formatNumber(oper.orderPrice,true);
				}
				if (oper.orderType == "6") {
					operInfo.trailWidth = oper.trailWidth;
				} else {
					operInfo.trailWidth = "-";
				}

				if (operInfo.settleType == "新規") {
					//losscutRate
					//losscutRateOcoStop

					if (oper.orderType == "4") {
						if (count == 1) {
							if (oper.losscutRate == null) {
								operInfo.losscut = "自動";
							} else {
								operInfo.losscut = this.formatNumber(oper.losscutRate,true);
							}
						} else if (count == 2 || count == 3) {
							operInfo.losscut = "-";
						}
					} else if (oper.orderType == "3") {
						if (count == 1) {

							if (oper.losscutRate == null) {
								operInfo.losscut = "自動";
							} else {
								operInfo.losscut = this.formatNumber(oper.losscutRate,true);
							}

						} else if (count == 2) {
							if (this.executionType == '3' && oper.losscutRateOcoStop == null) {
								operInfo.losscut = "自動";
							} else if (this.executionType == '3' && oper.losscutRateOcoStop != null) {
								operInfo.losscut = this.formatNumber(oper.losscutRateOcoStop,true);
							} else {
								operInfo.losscut = "-";
							}
						}
					} else if (oper.orderType == "2") {
						if (count == 1) {
							if (oper.losscutRate == null) {
								operInfo.losscut = "自動";
							} else {
								operInfo.losscut = this.formatNumber(oper.losscutRate,true);
							}
						} else {
							operInfo.losscut = "-";
						}
					} else if (oper.orderType == "1") {
						if (this.executionType != "1" && oper.losscutRate == null) {
							operInfo.losscut = "自動";
						} else if (this.executionType != "1" && oper.losscutRate != null) {
							operInfo.losscut = this.formatNumber(oper.losscutRate,true);
						} else {
							operInfo.losscut = "-";
						}
					}

				} else {
					operInfo.losscut = "-";
				}

				if (oper.orderType == "2") {
					if (count == 1) {
						operInfo.orderDate = moment(oper.invalidDatetimeNew, 'YYYYMMDDHHmm').format('YY/MM/DD HH:mm');
					} else if (count == 2) {
						operInfo.orderDate = moment(oper.invalidDatetimeSettle, 'YYYYMMDDHHmm').format('YY/MM/DD HH:mm');
					}
				} else if (oper.orderType == "3") {
					if (oper.invalidDatetimeNew) {
						operInfo.orderDate = moment(oper.invalidDatetimeNew, 'YYYYMMDDHHmm').format('YY/MM/DD HH:mm');
					} else {
						operInfo.orderDate = moment(oper.invalidDatetimeSettle, 'YYYYMMDDHHmm').format('YY/MM/DD HH:mm');
					}
				} else if (oper.orderType == "4") {
					if (count == 1) {
						operInfo.orderDate = moment(oper.invalidDatetimeNew, 'YYYYMMDDHHmm').format('YY/MM/DD HH:mm');
					} else {
						operInfo.orderDate = moment(oper.invalidDatetimeSettle, 'YYYYMMDDHHmm').format('YY/MM/DD HH:mm');
					}
				} else {
					if (operInfo.settleType == "新規") {
						operInfo.orderDate = moment(oper.invalidDatetimeNew, 'YYYYMMDDHHmm').format('YY/MM/DD HH:mm');
					} else {
						operInfo.orderDate = moment(oper.invalidDatetimeSettle, 'YYYYMMDDHHmm').format('YY/MM/DD HH:mm');
					}
				}
				this.operationList.push(operInfo);
			}
		}
	}

	public orderType(orderType) {
		if (orderType == "1") return "通常";
		else if (orderType == "2") return "IFD";
		else if (orderType == "3") return "OCO";
		else if (orderType == "4") return "IFD-OCO";
		else if (orderType == "5") return "一括決済";
		else if (orderType == "6") return "トレール";
		else if (orderType == "7") return "ロスカット";
		else if (orderType == "8") return "最終清算";
		else if (orderType == "9") return "強制決済";
	}
	public orderDetail(DetailList) {
		this.cfdProductCode = DetailList[0].cfdProductCode;
		for (let Detail of DetailList) {
			var detail: any = {};
			detail.cfdProductCodeDetail = this.business.symbols.getSymbolInfo(Detail.cfdProductCode).meigaraSeiKanji;
			detail.settleTypeDetail = Detail.settleType == "0" ? "新規" : "決済";
			detail.buySellTypeDetail = Detail.buySellType == "1" ? "売" : "買";
			detail.buySellType = Detail.buySellType;
			this.settleType = Detail.settleType;
			if (Detail.orderType == "1") {
				if (Detail.executionType == "1") detail.orderTypeDetail = "成行";
				else if (Detail.executionType == "2") detail.orderTypeDetail = "指値";
				else if (Detail.executionType == "3") detail.orderTypeDetail = "逆指値";
				this.rowCount = 1;
			} else {
				detail.orderTypeDetail = this.orderType(Detail.orderType);
				if (Detail.orderType == "2" || Detail.orderType == "3") {
					this.rowCount = 2;
				} else if (Detail.orderType == "4") {
					this.rowCount = 3;
				} else {
					this.rowCount = 1;
				}
			}

			if (Detail.orderType == "2") {
				this.IFListDetail = "2";
			} else if (Detail.orderType == "3") {
				this.IFListDetail = "3";
			} else if (Detail.orderType == "4") {
				this.IFListDetail = "4";
			} else {
				this.IFListDetail = "1";
			}

			detail.orderQuantityDetail = this.withComma(Detail.orderQuantity);

			this.executionType = Detail.executionType;
			if (Detail.executionType == "1") detail.executionTypeDetail = "成行";
			else if (Detail.executionType == "2") detail.executionTypeDetail = "指値";
			else if (Detail.executionType == "3") detail.executionTypeDetail = "逆指値";
			if (Detail.settleType == "0") {
				this.orderExec = detail.executionTypeDetail;
			}
			detail.orderPriceDetail = this.formatNumber(Detail.orderPrice,true);
			detail.orderPriceDetailUnit = "";
			if (Detail.orderType == '1' && Detail.executionType == "1") {
				if (Detail.allowedSlippage != null) {
					detail.orderPriceDetailUnit = " 許容±" + Detail.allowedSlippage;
				} else {
					detail.orderPriceDetailUnit = " 許容無制限";
				}

			} else if (Detail.orderType == "6") {
				var orderS = Detail.orderStatus;
				if (orderS == "3" || orderS == "8") {
					if (Detail.stopPrice == null) {
						detail.orderPriceDetail = this.formatNumber(Detail.orderPrice,true) + " 幅" + Detail.trailWidth;
					} else {
						detail.orderPriceDetail = this.formatNumber(Detail.orderPrice,true);
					}

				} else if (orderS == "0" || orderS == "1" || orderS == "2" || orderS == "4" || orderS == "5") {

					if (Detail.stopPrice == null) {
						detail.orderPriceDetail = this.formatNumber(Detail.orderPrice,true) + " 幅" + Detail.trailWidth;
					} else if (Detail.buySellType == "2") {
						if (Detail.stopPrice < Detail.orderPrice) {
							detail.orderPriceDetail = this.formatNumber(Detail.orderPrice,true) + "[現在：" + this.formatNumber(Detail.stopPrice,true) + "] 幅" + Detail.trailWidth;
						} else {
							detail.orderPriceDetail = this.formatNumber(Detail.orderPrice,true) + " 幅" + Detail.trailWidth;
						}
					} else if (Detail.buySellType == "1") {
						if (Detail.stopPrice > Detail.orderPrice) {
							detail.orderPriceDetail = this.formatNumber(Detail.orderPrice,true) + "[現在：" + this.formatNumber(Detail.stopPrice,true) + "] 幅" + Detail.trailWidth;
						} else {
							detail.orderPriceDetail = this.formatNumber(Detail.orderPrice,true) + " 幅" + Detail.trailWidth;
						}
					}
				} else {
					detail.orderPriceDetail = this.formatNumber(Detail.orderPrice,true);
				}

			} else {
				detail.orderPriceDetail = this.formatNumber(Detail.orderPrice,true);
			}
			if (Detail.orderStatus == "0") detail.orderStatusDetail = "待機中";
			else if (Detail.orderStatus == "1") detail.orderStatusDetail = "有効";
			else if (Detail.orderStatus == "2") detail.orderStatusDetail = "約定済";
			else if (Detail.orderStatus == "3") detail.orderStatusDetail = "取消済";
			else if (Detail.orderStatus == "4") detail.orderStatusDetail = "執行中";
			else if (Detail.orderStatus == "5") detail.orderStatusDetail = "取消中";
			else if (Detail.orderStatus == "6") detail.orderStatusDetail = "執行待";
			else if (Detail.orderStatus == "7") detail.orderStatusDetail = "ロスカット待";
			else if (Detail.orderStatus == "8") detail.orderStatusDetail = "失効";

			if (Detail.orderStatus !== "3" && Detail.orderStatus !== "8") detail.failureReasonDetail = "";
			else if (Detail.failureReason == "1") detail.failureReasonDetail = "強制取消";
			else if (Detail.failureReason == "2") detail.failureReasonDetail = "期限切れ";
			else if (Detail.failureReason == "3") detail.failureReasonDetail = "スピード注文";
			else if (Detail.failureReason == "4") detail.failureReasonDetail = "ロスカット";
			else if (Detail.failureReason == "5") detail.failureReasonDetail = "決済完了";
			else if (Detail.failureReason == "6") detail.failureReasonDetail = "証拠金不足";
			else if (Detail.failureReason == "7") detail.failureReasonDetail = "OCO";
			else if (Detail.failureReason == "8") detail.failureReasonDetail = "失効";


			if (Detail.executionType != null && Detail.executionType == '1') {
				detail.losscutRateDetail = "-";
			} else {

				if (Detail.settleType == "0") {
					if (Detail.losscutRate == null) {
						detail.losscutRateDetail = "自動";
					} else {
						detail.losscutRateDetail = this.formatNumber(Detail.losscutRate,true);
					}
				} else {
					detail.losscutRateDetail = "-";
				}
			}

      detail.orderDatetimeDetail = moment(Detail.orderDatetime, 'YYYYMMDDHHmm').format('YY/MM/DD HH:mm');
      if(Detail.orderType == "7" || Detail.orderType == "9") {  // 		ロスカット:7 強制決済:9 場合空白表示
        detail.invalidDatetimeDetail = "";
      }
      else {
        detail.invalidDatetimeDetail = moment(Detail.invalidDatetime, 'YYYYMMDDHHmmss').format('YY/MM/DD HH:mm');
      }
			detail.orderJointIdDetail = Detail.orderKey.substring(Detail.orderKey.length - 4, Detail.orderKey.length)
			this.orderDetailList.push(detail);
		}
	}

	private formatNumber(value,useBoUnit:boolean=false) {
		if (value != undefined) {
			let currentPrice:number = value;
			if (useBoUnit) {
				let	boUnit = this.business.symbols.getSymbolInfo(this.cfdProductCode).boUnit;
				let format = StringUtil.getBoUnitFormat(boUnit);
				let formatVal:string = StringUtil.formatNumber(currentPrice, format);
				return formatVal;	
			} else {
				return StringUtil.CommaWithZero(currentPrice);
			}
		}
	}

	private withComma(value) {
		if (value) {
			return Comma(value);
		}
		return value;
	}

	private init(){
		this.orderDetailList = [];
		this.operationList = [];
		this.executionList = [];
		this.orderSettleList = [];
		this.executionType = null;
		this.IFListDetail = "1";
		this.rowCount= 0;
		this.showOperation = false;
		this.showExection = false;
		this.showSettlePosition = false;
	}

	private isMinus(val):string {
		let result = null;
		if (!isNaN(val)) {
			if (Number(val) < 0) {
				result = "minus";
			} else if (Number(val) > 0) {
				result = "plus";
			}
		}
		return result;
	}
}
