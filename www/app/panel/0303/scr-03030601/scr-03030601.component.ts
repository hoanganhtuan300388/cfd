import { Component, ElementRef, ChangeDetectorRef, ViewChild } from '@angular/core';
import { PanelManageService, ResourceService } from '../../../core/common';
import { DialogService } from "ng2-bootstrap-modal";

import { ConfigChartTechnicalComponent } from '../../../component/config-chart-technical/config-chart-technical.component';

import { ModalViewBase } from '../../../core/modalViewBase';

import * as ChartConst from '../../../const/chartConst'; // #2994

@Component({
  selector: 'scr-03030601',
  templateUrl: './scr-03030601.component.html',
  styleUrls: ['./scr-03030601.component.scss']
})
export class Scr03030601Component extends ModalViewBase {

  @ViewChild('TechnicalSetting') TechnicalSetting:ConfigChartTechnicalComponent;

  public config:any;

  // #2925
  // subscribed list
  private notifySubscribe = [];
  private ownerId: string;
  //

  constructor(
    public screenMng:PanelManageService,
    public element: ElementRef,
    public changeRef:ChangeDetectorRef) {                 
      super( '03030601', screenMng, element, changeRef); 
      
      console.log("ChartConfigComponent");
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  ngOnInit() {
    super.ngOnInit();

    // #2925
    let self = this;
    self.notifySubscribe.push(self.panelMng.onChannelEvent().subscribe(
      (val) => {
        if (val.channel == ChartConst.CHANNEL_EVENT_ON_OPEN_TECHNICAL) {
          if (val.arg && val.arg.ownerId && val.arg.ownerId != self.ownerId) {
            self.onClickConfirm(-1);
          }
        }
      }));
    // [end] #2925
  }

  // #2925
  ngOnDestroy() {
    super.ngOnDestroy();
    this.notifySubscribe.forEach(s => {
      s.unsubscribe();
    })
  }
  // [end] #2925

  ngAfterViewInit() {
    super.ngAfterViewInit();

    // #2994
    let self = this;
    self.panelMng.fireChannelEvent(ChartConst.CHANNEL_EVENT_ON_OPEN_TECHNICAL, {ownerId:self.ownerId}); // #2732, #2994, #2925
    //
  }

  protected initLayout(param:any){
    super.initLayout(param);

    let self = this;
    try {
      self.config = param.config;
      self.ownerId = param.ownerId; // #2925
      self.TechnicalSetting.isPageDisabled = param.isPageDisabled;
      self.TechnicalSetting.didUpdateConfig(self.config);
    }
    catch(e) {
      console.error(e);
    }
  }

  //---------------------------------------------------------------------------
  // event handler
  //---------------------------------------------------------------------------

  public onClickConfirm(type:number) {
    let self = this;
    if(type < 0) {
      // Cancel
      this.sendDialogResult(null);
    }
    else {
      // OK, Apply
      if(self.TechnicalSetting) {
        var result = {
          close: type == 0 ? false : true, // #2292
          config: self.TechnicalSetting.didGetConfig(),
          indicatorInfos: self.TechnicalSetting.didGetIndicatorInfos()
        };
        
        this.sendDialogResult(result);
      }
    }
  }
}
