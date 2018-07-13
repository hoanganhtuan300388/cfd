/**
 *
 * Business Helper
 *
 */
import { Component, Input,Output, ElementRef, ChangeDetectorRef ,EventEmitter, ViewChild} from '@angular/core';
import { PanelViewBase, ComponentViewBase, PanelManageService } from "../../core/common";
import { ContextMenuService, ContextMenuComponent } from 'ngx-contextmenu';
import { AwakeContextMenu } from '../../util/commonUtil';
import { WindowControllerComponent } from '../window-controller/window-controller.component';
import { Title } from '@angular/platform-browser/src/browser/title';
// import { ResourceService } from '../../service/resource.service';

//-----------------------------------------------------------------------------
// Component : TitleBarComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'title-bar',
  templateUrl: './title-bar.component.html',
  styleUrls: ['./title-bar.component.css']
})
export class TitleBarComponent extends ComponentViewBase {
  private _title:string;

  public _frame:PanelViewBase;
  public _hideMin:boolean = false;
  public _hideMax:boolean = false;
  public _fixedWidth:boolean = false;
  public _titleShow:boolean = false;
  public _hideExport:boolean = false;
  public _hideClose:boolean = false;
  private _add:string;
  public contextItems = [];

  public _disableExport:boolean = false; // #2925

  // contextMenu
  @ViewChild('contextMenuComponent') public contextMenuComponent: ContextMenuComponent;
  @ViewChild('windowController') public windowController: WindowControllerComponent;

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(public panelMng:PanelManageService,
              public element: ElementRef,
              public changeRef:ChangeDetectorRef,
              public contextMenu:ContextMenuService) {
    super(panelMng, element, changeRef);
  }

  ngAfterViewInit() {
    this.addTitleBarContent();
  }
  @Output()
  changed = new EventEmitter();

  @Input('title')
  set title(target: any) {
    this._title = target;
  }
  get title() {
    return this._title;
  }

  @Input('frame')
  set frame(target: any) {
    this._frame = target;
  }

  @Input('add')
  set add(target: any) {
    this._add = target;
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

  @Input('title-show')
  set titleShow(hide: boolean) {
    this._titleShow = hide;
  }

 	//---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  get dragTarget(){
    if( this._frame && this._frame.element )
      return this._frame.element.nativeElement.children[0];

    return null;
  }

  public isShowButtons(){
    if( this.isExternalWindow() && !this.isWin32()){
      return false;
    }

    return true;
  }

  public isWin32(){
    if( this._frame ){
      return this._frame.isWin32();
    }

    return false;
  }

  public isExternalWindow(){
    if( this._frame ){
      return this._frame.isExternalWindow();
    }

    return false;
  }
  // public mouseOver(){
  // 	event["titleMouse"] = true;
  // 	this.changed.emit(event);
  // }
  // public mouseOut(){
  // 	event["titleMouse"] = false;
  // 	this.changed.emit(event);
  // }
  /**
   * タイトルバーに追加要素があれば追加する
   */
  private addTitleBarContent() {
    if( this._frame ){
      let $titleBarAreaLeft = $(this._frame.element.nativeElement).find('#title-bar-add-area');
      let $titleBarAreaRight = $(this._frame.element.nativeElement).find('#title-bar-add-area-right');
      let $titleBarContent = $(this._frame.element.nativeElement).find('#' + this._add);

      if ($titleBarAreaLeft && $titleBarContent) {
        let $leftItem = $titleBarContent.find('#title-bar-add-content-left');
        if ($leftItem) {
          $titleBarAreaLeft.append($leftItem);
        }

        let $rightItem = $titleBarContent.find('#title-bar-add-content-right');
        if ($rightItem) {
          $titleBarAreaRight.append($rightItem);
        }

      }
    }
  }

  public showContextMenu($event:MouseEvent){
    if(!this.isExternalWindow()){
      this.contextItems = [
        { title: '別ウィンドウで開く', visible: !this._hideExport, enabled: !this._disableExport, event: this.windowController.inoutWindow },
        { title: '元のサイズに戻す', visible: !this._hideMax, enabled: this._frame.isMaximized(), event: this.windowController.maximize },
        { title: '最小化', visible: !this._hideMin, enabled: true, event: this.windowController.minisize },
        { title: '最大化', visible: !this._hideMax, enabled: !this._frame.isMaximized(), event: this.windowController.maximize },
        { title: '閉じる', visible: !this._hideClose, enabled: true, event: this.windowController.close }
      ];
      this.updateView();
      this.contextMenu.show.next({
        contextMenu: this.contextMenuComponent,
        event: $event,
        item: this.contextItems
      });
      
      $event.preventDefault();
      $event.stopPropagation();

      AwakeContextMenu($event, this.element.nativeElement);
    }
  }

  onClickContextItem(item) {
    item.event.call(this);
  }

  // #2925
  public didSetDisableExport = (isDisable:boolean) => {
    let self = this;
    self._disableExport = isDisable;
  }
  //
}
