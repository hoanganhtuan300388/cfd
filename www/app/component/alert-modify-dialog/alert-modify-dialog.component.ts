import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ThemeDialog } from "../../component/theme-dialog/theme-dialog.component";
import { ResourceService, BusinessService, PanelManageService } from '../../core/common';
import { DialogService } from "ng2-bootstrap-modal";
import { WithLinkDialogComponent } from '../with-link-dialog/with-link-dialog.component';
import { ContextMenuService, ContextMenuComponent } from 'ngx-contextmenu';
import { AwakeContextMenu } from '../../util/commonUtil';

@Component({
  selector: 'alert-modify-dialog',
  templateUrl: './alert-modify-dialog.component.html',
  styleUrls: ['./alert-modify-dialog.component.scss']
})
export class AlertModifyDialogComponent extends ThemeDialog {
  public params:any;
  public alertInfo:any;
  public isShow:boolean = false;
  public contextItems = [];
  @ViewChild('contextMenuComponent') public contextMenuComponent: ContextMenuComponent;
  constructor(
    protected dialogService: DialogService,
    protected resource: ResourceService,
    protected panelMng: PanelManageService,
    protected element: ElementRef,
    public contextMenu:ContextMenuService) {

    super(dialogService, resource, panelMng, element);
  }

  ngOnInit() {
    this.alertInfo = this.params;
    if (!this.alertInfo.key) {
      let setting = this.resource.config.setting.alert;
      if (setting && Object.keys(setting).length == 10) {
        let params = {title:"アラート",message:"アラートの登録可能件数は最大10件です。",link:"アラート設定の編集はこちらから"};
        this.dialogService.addDialog(WithLinkDialogComponent, { params: params }).subscribe(
          (val) => {
            if (val == "openlink") {
              this.panelMng.findPanel('03010500').subscribe(pnl=>{
                if (pnl && pnl.length > 0) {
                  this.panelMng.fireChannelEvent('showAlertList', {});
                  this.panelMng.panelFocus(pnl[0].uniqueId);
                } else {
                  let param = {
                    layout:{
                        external:this.panelMng.isExternalWindow(),
                    }
                  }
                  this.panelMng.openPanel(this.panelMng.virtualScreen(), '03010500', param);
                }
              });
            }
          }
        );
        this.close();
      } else {
        this.isShow = true;
      }
    } else {
      this.isShow = true;
    }
  }

  onConfirm(result){
    // #2455
    if(result) {
      this.result = result;
    }
    //
    this.close();
  }

  public showContextMenu($event:MouseEvent){
    this.contextItems = [
      { title: '閉じる',  event: this.close }
    ];
    // this.updateView();
    this.contextMenu.show.next({
      contextMenu: this.contextMenuComponent,
      event: $event,
      item: this.contextItems
    });
    
    $event.preventDefault();
    $event.stopPropagation();

    AwakeContextMenu($event, this.element.nativeElement);
  }

  onClickContextItem(item) {
    item.event.call(this);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event:MouseEvent) {
    if(event.button == 0) {
      let contextMenu = $('.ngx-contextmenu');
      if (contextMenu) {
        $(contextMenu).addClass('invisible')
      } 
    }
  }
}
