import { Component, OnInit, ElementRef, Input, ViewChild } from '@angular/core';
import { ThemeDialog } from "../../component/theme-dialog/theme-dialog.component";
import { PanelManageService, ResourceService } from '../../core/common';
import { DialogService } from "ng2-bootstrap-modal";

import { ConfigChartTechnicalComponent } from '../../component/config-chart-technical/config-chart-technical.component';

@Component({
  selector: 'chart-config',
  templateUrl: './chart-config.component.html',
  styleUrls: ['./chart-config.component.scss']
})
export class ChartConfigComponent extends ThemeDialog implements OnInit {
  public config='';
  
  @ViewChild('TechnicalSetting') TechnicalSetting:ConfigChartTechnicalComponent;

  constructor(
    protected dialogService: DialogService,
    protected resource: ResourceService,
    protected panelMng: PanelManageService,
    protected element: ElementRef
  ) {
    super(dialogService, resource, panelMng, element);
    console.log("ChartConfigComponent");
  }

  ngOnInit() {
  }

  //---------------------------------------------------------------------------
  // event handler
  //---------------------------------------------------------------------------

  public onClickConfirm(type:number) {
    let self = this;
    if(type < 0) {
      // Cancel
      this.close();
    }
    else {
      // OK, Apply
      if(self.TechnicalSetting) {
        this.result = {
          config: self.TechnicalSetting.didGetConfig(),
          indicatorInfos: self.TechnicalSetting.didGetIndicatorInfos()
        }
      }

      this.close();
    }
  }
}
