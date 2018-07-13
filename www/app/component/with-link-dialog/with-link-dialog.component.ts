import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ThemeDialog } from "../../component/theme-dialog/theme-dialog.component";
import { ResourceService, BusinessService, PanelManageService } from '../../core/common';
import { DialogService } from "ng2-bootstrap-modal";
import { ContextMenuService, ContextMenuComponent } from 'ngx-contextmenu';
import { AwakeContextMenu } from '../../util/commonUtil';

@Component({
  selector: 'with-link-dialog',
  templateUrl: './with-link-dialog.component.html',
  styleUrls: ['./with-link-dialog.component.scss']
})
export class WithLinkDialogComponent extends ThemeDialog {
  public params:any;
  public link:string;
  public message:string;
  public title:string;
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
    this.message = this.params.message;
    this.link = this.params.link;
    this.title = this.params.title;
  }

  public openLink(){
    this.result = "openlink";
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
