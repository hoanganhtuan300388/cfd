import { Component, OnInit, ElementRef } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";

import { CommonConst, ViewBase } from '../../core/common';
import { ResourceService} from "../../service/resource.service";
import { PanelManageService } from '../../service/panel-manage.service';

declare var $:any;

// @Component({
//   selector: 'theme-dialog',
//   templateUrl: './theme-dialog.component.html',
//   styleUrls: ['./theme-dialog.component.scss']
// })
export class ThemeDialog extends DialogComponent<any,any> {
  constructor(
    protected dialogService: DialogService,
    protected resource: ResourceService,
    protected panelMng: PanelManageService,
    protected element: ElementRef) {
    super(dialogService);
  }

  ngAfterViewInit(){
    if($){
      if ($.material) {
        $.material.init();
      }
      let body = $('.modal.fade');
      let target = this.element.nativeElement.children[0];
      if (target) {
        let left = Math.floor((body.width() - target.clientWidth) / 2);
        let top = Math.floor((body.height() - target.clientHeight) / 2);
        target.style.transform = `translate3d(${(left)}px, ${(top)}px, 0)`;
      }
    }
  }

}
