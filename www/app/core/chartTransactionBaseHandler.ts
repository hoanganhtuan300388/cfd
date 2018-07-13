import { OnInit } from '@angular/core';
import { CommonEnum, CommonConst } from '../core/common';

import { Observable } from 'rxjs/Rx';

import { Deferred } from "../util/deferred";
import { ManagerService } from "../service/manager.service";

import * as ChartConst from '../const/chartConst';

export class ChartTransactionBaseHandler {
	//
	protected deferred: Deferred<any> = new Deferred<any>();

	protected pointValue: number;

	//
  constructor(protected managerService: ManagerService, protected uniqueId:number) {
  }

	public didGetObserver() {
		let self = this;
		return(self.deferred.asObservable());
	}

	protected didGetSymbolManage() {
		let self = this;
		return(self.managerService.didGetSymbolManage());
	}

	protected didGetBusinessService() {
		let self = this;
		return(self.managerService.didGetBusinessService());
	}

	public didDestroy() {

	}

	protected didGetRequestModeVersion() {
		return(ChartConst.REQUEST_MODE_DWM_VER);
	}

	// #1544
	protected didNotifyResponseError(errorCode:number, errorMessage:string, reserved?:any) {
		let self = this;
		if(self.deferred) {
			let notifyData:any = {
				type    : ChartConst.NOTIFY_TYPE_RESPONSE_ERROR,
				code    : errorCode,
				message : errorMessage,
				reserved: reserved
			}

			self.deferred.next(notifyData);
		}
	}
	//
}
