import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { CommonConst, PanelManageService, ResourceService, WindowService } from '../../../core/common';

// import { PanelManageService } from '../../../service/panel-manage.service';
//import { ConfirmComponent } from '../../../core/confirmModal';
// import { ConfirmComponent } from '../../../component/confirm/confirm.component';
// import { DialogService } from "ng2-bootstrap-modal";
// import { ResourceService } from '../../../service/resource.service';
import { BusinessService } from '../../../service/business.service';
// import { MenuBarComponent } from '../../../component/menu-bar/menu-bar.component';
// import * as values from '../../../values/values';

declare var $ :any;

@Component({
  selector: 'scr-03010101',
  templateUrl: './scr-03010101.component.html',
  styleUrls: ['./scr-03010101.component.css']
})
export class Scr03010101Component {
  private _content;

  constructor( private resource:ResourceService,
               private business:BusinessService,
               private windowService:WindowService ) {    // 最適化作業

    this.init();
  }

  /**
   *
   */
  private init(){
    var win = window as any;

    if( win.electron && win.electron.parameter){
      this.content = CommonConst.PANELLIST[win.electron.parameter.panelId].selector;

      // hide scroll bar
      $('body').css('overflow','hidden');
    }
  }

  /**
   *
   */
  set content(str:string){
    let electron = (window as any).electron;
    let windowId = '';
    let id = '';

    if(electron.parameter){
      windowId = `_window${electron.parameter.windowId}-`;
    }

    id = windowId + CommonConst.PANEL_ID_PREFIX+0;

    this._content = `<${str} id='${id}'></${str}>`;
  }
  get content(){
    return this._content;
  }
}
