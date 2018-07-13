import { Injectable } from '@angular/core';

import { PanelManageService, BusinessService, CommonEnum, CommonConst } from '../core/common';
import { ResourceService } from '../service/resource.service';
import { DialogService } from "ng2-bootstrap-modal";

@Injectable()
export class ManagerService {

  constructor( public panelMng: PanelManageService,
               public business: BusinessService,
               public dialogService: DialogService,
               public resource: ResourceService
						 ) {}

	public didGetPanelManageService() {
		return(this.panelMng);
	}

	public didGetBusinessService() {
		return(this.business);
	}

	public didGetDialogService() {
		return(this.dialogService);
	}

	public didGetSharedDataService() {
		return(null);
	}

	public didGetResourceService() {
		return(this.resource);
	}

	public didGetSymbolManage() {
		return(this.business.symbols);
	}
}
