import { Component, Input, ElementRef, ChangeDetectorRef } from '@angular/core';
import { PanelManageService } from '../../service/panel-manage.service';
import { ComponentViewBase, PanelViewBase } from '../../core/common';
import { ResourceService } from '../../service/resource.service';

@Component({
  selector: 'window-controller',
  templateUrl: './window-controller.component.html',
  styleUrls: ['./window-controller.component.scss']
})

export class WindowControllerComponent extends ComponentViewBase {

  constructor(public panelMng: PanelManageService,
              public element: ElementRef,
              public changeRef:ChangeDetectorRef) {
    super(panelMng, element, changeRef);
  }

  public _frame:PanelViewBase;
  public _hideMin:boolean = false;
  public _hideMax:boolean = false;
  public _fixedWidth:boolean = false;
  public _hideExport:boolean = false;
  public _hideClose:boolean = false;
  public _disableExport: boolean = false; // #2925

  @Input('frame')
  set frame(target: any) {
    this._frame = target;
  }

  @Input('hide-min')
  set hideMin(hide: boolean) {
    this._hideMin = hide;
  }

  @Input('hide-max')
  set hideMax(hide: boolean) {
    this._hideMax = hide;
  }

  @Input('fixed-width')
  set fixedWidth(fixed: boolean) {
    this._fixedWidth = fixed;
  }

  @Input('hide-export')
  set hideExport(hide: boolean) {
    this._hideExport = hide;
  }

  @Input('hide-close')
  set hideClose(hide: boolean) {
    this._hideClose = hide;
  }

  // #2925
  @Input('disable-export')
  set disableExport(disable: boolean) {
    this._disableExport = disable;
  }
  //

  ngOnInit() {
    super.ngOnInit();
  }

  public inoutWindow(){
    if( this._frame ){
      this._frame.inoutWindow();
    }
  }
  public minisize(){
    if( this._frame ){
      this._frame.minisize();
    }
  }
  public maximize(){
    if( this._frame ){
      this._frame.maximize(this._fixedWidth);
    }
  }

  public close(){
    if( this._frame ){
      this._frame.close();
    }
  }

}
