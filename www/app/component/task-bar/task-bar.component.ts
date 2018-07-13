import { Component, Input,OnInit,ViewChild,ElementRef,ChangeDetectorRef } from '@angular/core';
import { PanelViewBase, PanelManageService, CommonConst, Tooltips,
         IViewState, ViewBase, IPanelInfo, IPanelFocus } from "../../core/common";
import { ResourceService } from '../../service/resource.service';
import { BusinessService } from '../../service/business.service';
import { ContextMenuService, ContextMenuComponent } from 'ngx-contextmenu';

import { AwakeContextMenu } from '../../util/commonUtil';

import * as $ from "jquery"

@Component({
  selector: 'task-bar',
  templateUrl: './task-bar.component.html',
  styleUrls: ['./task-bar.component.css']
})
export class TaskBarComponent {

  private PANEL_ORDER = CommonConst.PANEL_ID_ORDER;
  private PANEL_SPEEDORDER = CommonConst.PANEL_ID_SPEEDORDER;

  private groupOrderList = [];  // 注文グループリスト
  public cfdStatus:boolean = false; // // CFD口座開設済フラグ  true：開設済み、false：未開設

  private isTask:boolean = false;
  uniqueId:string;
  showscreen:boolean;

  public TOOLTIP_HIDE:string = "";
  public TOOLTIP_DISPLAY:string = "";

  public taskBtnFlg:string;
  public _frame:any;
  public closePanel:any;

  @Input('frame')
  set frame(target: any) {
    this._frame = target;
  }

  // contextMenu
  @ViewChild('contextMenuComponent') public contextMenuComponent: ContextMenuComponent;

  constructor(private panelMng:PanelManageService,
              public resource:ResourceService,
              public contextMenu:ContextMenuService,
              public element:ElementRef,
              public business: BusinessService,
              public changeRef:ChangeDetectorRef) {
    this.TOOLTIP_HIDE = Tooltips.TASK_BAR_HIDE;
    this.TOOLTIP_DISPLAY = Tooltips.TASK_BAR_DISPLAY;

    this.groupOrderList = [
    '03020100', // title:'新規注文', alias:'注文'},
    '03020101', // title:'注文変更'},
    '03020102', // title:'注文取消'},
    '03020103', // title:'決済注文'},
    // '03020104', // title:'スピード注文'},
    // '03020200' // title:'ロスカットレート変更'},
    ];

    this.getUserInfo();
  }

  // get screen list.
  private panels():any[]{
    return this.panelMng.getCurPanels();
  }

  public isGroupBtn(): boolean{
    return this.resource.config.common.taskBarGroup == '1';
  }

  private samePanelCnt(scrId: string, subId:string): number {
    var panelInfo = this.groupPanel();
    var groupPanels: any[] = [];

    groupPanels = panelInfo.filter((item)=>item.id === scrId && item.subId === subId);

    return groupPanels[0].groupUniqueIds.length;
  }

  private getSubid( info: any ):string{
    if( info ){
      var pnl = info.instance as PanelViewBase;
      if( pnl && pnl.params && pnl.params.subid){
        return pnl.params.subid;
      }  
    }

    return "";
  }

  private groupPanel(): any[] {
    var panelInfo = this.panelMng.getCurPanels();
    var groupPanels: any[] = [];

    let orerPanels = panelInfo.filter((item)=>{
      return (this.groupOrderList.indexOf(item.id) >= 0)
    });

    if(orerPanels.length) {
      let orders = {};
      orders[CommonConst.PANEL_ID_ORDER] = orerPanels[0];
      var groupUniqueIds = [];
      var groupSubTitle = [];
      orerPanels.forEach((item)=>{
        groupUniqueIds.push(item.uniqueId);
        groupSubTitle.push(item.subTitle);        
      });

      orders[CommonConst.PANEL_ID_ORDER].groupUniqueIds = groupUniqueIds;
      orders[CommonConst.PANEL_ID_ORDER].groupSubTitle = groupSubTitle;
      groupPanels.push(orders[CommonConst.PANEL_ID_ORDER]);
    }

    let others = panelInfo.filter((item)=>{
      return (this.groupOrderList.indexOf(item.id) < 0)
    });

    
    if(others.length) {
      let uniques = [];
      others.forEach((item)=>{
        let bIS = false;
        for(let ii = 0; ii < uniques.length; ii++) {
          if(item.id == uniques[ii].id) {
            bIS = true;
            break;
          }          
        }
        if(!bIS)
          uniques.push(item);
      });
      
      uniques.forEach((item)=>{
        let other = {};
        other[item.id] = item;
        let groupUniqueIds = [];
        let groupSubTitle = [];        
        others.forEach(element => {
          if(item.id == element.id) {
            groupUniqueIds.push(element.uniqueId);
            groupSubTitle.push(element.subTitle);
          }
        });
        other[item.id].groupUniqueIds = groupUniqueIds;
        other[item.id].groupSubTitle = groupSubTitle;
        groupPanels.push(other[item.id]); 
      });
    }

    // original
    // var panelInfo = this.panelMng.getCurPanels();
    // var groupPanels: any[] = [];

    // var tmpPanel = {};
    // panelInfo.forEach((items)=>{
    //   var subid = this.getSubid(items );
    //   var tmpid = this.getSubid(tmpPanel[items.id] );
    //   if (!tmpPanel[items.id] || tmpid != subid) {
    //     let key = items.id + '-' + subid
    //     tmpPanel[key] = items;
    //   }
    // });

    // // panelInfo = [];
    // for (var key in tmpPanel) {
    //   var sampanel = panelInfo.filter((item)=>{
    //     var subid = this.getSubid(item);
    //     var tmpid = this.getSubid(tmpPanel[key]);
    //     return item.id === key.split('-')[0] && subid === tmpid;
    //   });

    //   var groupUniqueIds = [];
    //   var groupSubTitle = [];
    //   if (sampanel) {
    //     for (let i=0; i<sampanel.length; i++) {
    //       groupUniqueIds.push(sampanel[i].uniqueId);
    //       groupSubTitle.push(sampanel[i].subTitle);          
    //     }
    //   }
    //   tmpPanel[key].groupUniqueIds = groupUniqueIds;
    //   tmpPanel[key].groupSubTitle = groupSubTitle;
    //   tmpPanel[key].subId = this.getSubid(tmpPanel[key]);

    //   groupPanels.push(tmpPanel[key]);
    // }    

    return groupPanels;
  }

  //taskbar focus and show.
  private winFocus(uniqueId:string){
    var info = this.panelMng.getPanel( uniqueId );
    var panelFocus:IPanelFocus = {
      id : info.id,
      uniqueId : uniqueId,
      panelParams : info.params
    }
    if(info.showscreen)
      this.panelMng.panelFocus(uniqueId, panelFocus);
    else
      this.panelMng.behavePanelTouch( uniqueId );
  }

  public winMinimize(){
    this.panelMng.minimizeAll( true );
  }

  public winRestore(){
    this.panelMng.minimizeAll( false );
  }

  private getUniqueIds(scrId: string) : string {
    var panelInfo = this.groupPanel();
    var groupPanels: any[] = [];
    groupPanels = panelInfo.filter((item)=>item.id === scrId);

    var ret = "";
    for (let i=0; i<groupPanels[0].groupUniqueIds.length; i++) {
      ret += groupPanels[0].groupUniqueIds[i];
      ret += " ";
    }

    return ret;
  }

  private taskGroupViewOnOff(panelId:string):boolean {
    var viewFlg = false;
    if (panelId === this.PANEL_ORDER || panelId === this.PANEL_SPEEDORDER) {
      viewFlg = true;
    }
    return viewFlg;
  }

  /**
   * 
   */
  public isTaskBarKbn() {
    $('.footer').css('z-index','1111');
    $('.panel-notice').css('z-index','1111');
    $('.panel-notice-head').css('z-index','1111');
  }

  public getGroupTitle(scr: any):string {
    let idx = this.groupOrderList.indexOf(scr.id);
    if(scr.id == CommonConst.PANEL_ID_LOSSCUTCHANGE) {
      return CommonConst.PANELLIST[scr.id].title;
    }    
    else if(idx < 0 ) {  // 注文グループリストじゃない場合
      return scr.title;
    }
    else {  // 注文グループリストの場合
      return '注文';
      // return CommonConst.PANELLIST[scr.id].title;
    }    
  }

  public getGroupPanelTitle(uniqueId: string): string {
    let iPanelInfo: IPanelInfo = this.panelMng.getPanel(uniqueId);

    return iPanelInfo.title + ' ' + iPanelInfo.subTitle;
  }

  public getOnePanelTitle(title: string, subTitle:string): string {
    if(title == subTitle)
      return title;
    else
      return title + ' ' + subTitle;
  }

  // open web-browser
  public openUrl(link:string){
    let url: string = '';

    url = this.resource.environment.clientConfig[link];
    if(!this.resource.environment.demoTrade) {
      url += '&sessionId=' + this.resource.environment.session.sessionId;
    }
    const electron = (window as any).electron;
    if(electron){
      const shell = electron.shell;

      shell.openExternal(url);
    }
  }

  private getUserInfo(){
    let _self=this;
    this.business.getUserInfo().subscribe(val => {
      this.cfdStatus = val.result.cfdStatus;
    });
  }  

  public showContextMenu($event:MouseEvent, type:string, panelList:any){
    if(type == "btn"){
      this.taskBtnFlg = "閉じる";
    }else{
      this.taskBtnFlg = "すべて閉じる";
    }

    this.contextMenu.show.next({
      contextMenu: this.contextMenuComponent,
      event: $event,
      item: panelList
    });
    $event.preventDefault();
    $event.stopPropagation();

    // AwakeContextMenu(null, rightClose);
    AwakeContextMenu(null, this.element.nativeElement);

     var $par = $($event.currentTarget).parent().parent().parent();
      setTimeout(()=> {
        $par.removeClass("open");
        $par.addClass("open");
      }, 100);
  }

  onClickContextItem(panelList:any){
    if (Array.isArray(panelList)) {
      panelList.forEach(panel => {
        this.panelMng.getPanel(panel).instance.close();
      });
    } else {
      this.panelMng.getPanel(panelList).instance.close();
    }

  }
  public btnGroupClicked($event){
    //this.contextMenu.close.next($event);
    let taskListOpen = $(this.element.nativeElement).find(".task-bar-list .open");
    if(taskListOpen){
      $(".ngx-contextmenu").hide();
    }else{
      $(".ngx-contextmenu").show();
    }

  }

  public logOut(){
    if( this._frame ){
      this._frame.closeLogout();
    }
  }
}