import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ThemeDialog } from "../../component/theme-dialog/theme-dialog.component";
import { PanelManageService, ResourceService } from '../../core/common';
import { DialogService } from "ng2-bootstrap-modal";

@Component({
  selector: 'speed-order-confirm',
  templateUrl: './speed-order-confirm.component.html',
  styleUrls: ['./speed-order-confirm.component.scss']
})
export class SpeedOrderConfirmComponent extends ThemeDialog {
  public demoTrade:boolean;
  constructor(
    protected dialogService: DialogService,
    protected resource: ResourceService,
    protected panelMng: PanelManageService,
    protected element: ElementRef) {

    super(dialogService, resource, panelMng, element);
    this.demoTrade = resource.environment.demoTrade;
    console.log("SpeedOrderConfirmComponent");
  }

  //最適化作業
  public disagreed() {
    // this.resource.environment.speedOrderAgreement = false;

    this.close();
  }

  //最適化作業
  public agreed() {
    this.resource.confirmHideSpeedOrderAgreement = true;
    this.resource.fireUpdateSpeedOrderAgreement();

    let that = this as any;

    if(that.params)
      this.panelMng.openPanel(this.resource.config.common.virtualScreen, '03020104', that.params);
    else
      this.panelMng.openPanel(this.resource.config.common.virtualScreen, '03020104', {subid:''});

    //this.panelMng.openPanel(this.resource.config.common.virtualScreen, '01020108');
    this.close();


    /*SharedDataService::environment::speedOrderAgreement
    SharedDataService::environment::demoTrade*/

  }

  public showManual(){
    this.openUrl(this.resource.environment.clientConfig.operationManualURI);
  }

  private openUrl(url:string){
    const electron = (window as any).electron;
    if(electron){
      const shell = electron.shell;

      shell.openExternal(url);
    }
  }

}
