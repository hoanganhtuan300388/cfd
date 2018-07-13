import { Component, OnInit, HostListener, ChangeDetectorRef, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { PanelManageService } from '../../service/panel-manage.service';
import { ComponentViewBase, ViewBase, IViewState, PanelViewBase,
         BusinessService, Tooltips } from '../../core/common';
import { ResourceService } from '../../service/resource.service';
import { WindowService } from '../../service/window.service';
import { defaultLayout } from '../../const/businessConst';
import { MessageBox } from '../../util/utils';
import { Messages} from '../../../../common/message';
import { WithLinkDialogComponent } from '../with-link-dialog/with-link-dialog.component';

import { DialogService } from "ng2-bootstrap-modal";
import { SpeedOrderConfirmComponent } from '../../component/speed-order-confirm/speed-order-confirm.component';

const TITLE_PLATINUM_CHART = 'デモ取引ではご利用いただけません';
const TXT_PLATINUM_CHART = 'プラチナチャートCFDはデモ取引ではご利用いただけません。';
const LINK_PLATINUM_CHART = 'プラチナチャートCFDにつきましては、こちらをご覧ください。';


@Component({
  selector: 'menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.scss']
})

export class MenuBarComponent extends ComponentViewBase {
  @Input('frame')
  public frameWindow:PanelViewBase;
  private $activeMenu;
  public isDemo:boolean = false;

   //画面初期化イベント
  //  @Output() initView = new EventEmitter<any>();

  // private menu: IMenuConfig;
  // private subScribed: boolean = false;
  // private sdiDisable1: boolean = false;
  // private sdiDisable2: boolean = false;
  // private layout;

  // public pass: string = "";
  // public TOOLTIP_KASO: string ="";
  // public TOOLTIP_WINDOW: string ="";
  // public TOOLTIP_SAVE: string ="";
  // public TOOLTIP_NOT_INPUT: string ="";

  // public mypanelMenuList: any = [];

  constructor(public panelMng: PanelManageService,
              public resource: ResourceService,
              public element: ElementRef,
              private business: BusinessService,
              private dialogService: DialogService,
              public changeRef:ChangeDetectorRef,
              private windowService: WindowService) {
    super(panelMng, element, changeRef);

    this.isDemo = this.resource.environment.demoTrade;

    // tooltips内容作成
    // this.TOOLTIP_KASO = Tooltips.MENU_BAR_KASO;
    // this.TOOLTIP_WINDOW = Tooltips.MENU_BAR_WINDOW;
    // this.TOOLTIP_SAVE = Tooltips.MENU_BAR_SAVE;
    // this.TOOLTIP_NOT_INPUT = Tooltips.MENU_BAR_NOT_INPUT;
  }

  ngOnInit() {
    super.ngOnInit();
  }

  /**
   * fade in and fade out dropdown background
   *
   * @param show
   */
  public showDropMenu($event, show) {
    // disactivate selected menu
    if (this.$activeMenu != null &&
        ($event.target.className == 'dropdown-toggle' ||
         $event.target.className == 'dropdown') &&
        this.$activeMenu != $($event.target)) {
      this.$activeMenu.removeClass('active');
      this.$activeMenu = null;
    }

    if (show) {
      // activate selected menu
      if ($event.target.className == 'dropdown-toggle') {
        this.$activeMenu = $($event.target);
        this.$activeMenu.addClass('active');
      }
    }
  }

  /**
   * open screen
   *
   * @param scrId
   */
  public openScreen(scrId) {
    this.panelMng.openPanel('0', scrId);
  }

  /**
   * open speed-order-confirm dialog
   */
  public openSpeedOrderConfirm() {
    let disposable ;
    if (this.resource.confirmHideSpeedOrderAgreement == false) {
      if(this.resource.environment.demoTrade){
        disposable = this.dialogService.addDialog(SpeedOrderConfirmComponent);
      }else{
        disposable = this.dialogService.addDialog(SpeedOrderConfirmComponent);
      }
    } else {
      this.openScreen('03020104');
    }
  }

  /**
   * レイアウト保存
   */
  public layoutSave(){
    var opt = {
      title:'レイアウトの保存',
      message:'レイアウトを保存しますか？'
    };

    MessageBox.question(opt, (response, checkboxChecked)=>{
      if(response == 1){
        this.panelMng.getLayoutInfo().subscribe(val=>{
          var layout = [{layoutid_1:[val]}];
          this.business.setLayout(layout).subscribe(
            val=>{
              if(val.status != "0"){
                MessageBox.info({title:'レイアウト保存エラー', message:Messages.ERR_0001+'[CFDS3201T]'});
              }
            },
            err=>{
              MessageBox.info({title:'レイアウト保存エラー', message:Messages.ERR_0002+'[CFDS3202C]'});
            }
          )
        })
      }
    });
  }

  /**
   * レイアウト読み込む
   */
  public layoutLoad(){
    var opt = {
      title:'レイアウトの読み込み',
      message:'レイアウトを読み込みますか？'
    };

    MessageBox.question(opt, (response, checkboxChecked)=>{
      if(response == 1){
        this.business.getLayout().subscribe(val=>{
          if(val.status == '0'){
            let layout = val.result[0]['layoutid_1'];

            this.panelMng.loadLayout(layout[0]);
          }
        });
      }
    })
  }

  /**
   * 初期レイアウトに戻る
   */
  public layoutRestore(){
    var opt = {
      title:'初期レイアウトに戻す',
      message:'初期レイアウトに戻しますか？'
    };

    MessageBox.question(opt, (response, checkboxChecked)=>{
      if(response == 1){
        var layout = this.resource.defaultLayout();

        if(layout){
          this.panelMng.loadLayout(layout[0]['layoutid_1'][0]);
        }
      }
    });
  }

  // open web-browser
  public openUrl(link:string){
    let url: string = '';
    if(this.resource.environment.demoTrade) { // demo
      if(link == 'platinumChartCfdURL') {
        let params = {title:TITLE_PLATINUM_CHART,message:TXT_PLATINUM_CHART,link:LINK_PLATINUM_CHART};
        this.dialogService.addDialog(WithLinkDialogComponent, { params: params }).subscribe(
          (val) => {
            if (val == "openlink") {
              const electron = (window as any).electron;
              if(electron){
                const shell = electron.shell;

                shell.openExternal(this.resource.environment.clientConfig['platinumChartCfdInfoURL']);
              }
              return  ;
            }
        });
        return  ;
      }
    }

    url = this.resource.environment.clientConfig[link];
    let needSession = (link == 'cashManagementURL' || link == 'QAURL' || link == 'kouzaOpenURL'  || link == 'platinumChartCfdURL');
    if( (!this.resource.environment.demoTrade)&& needSession ) {
      let idx = url.indexOf('&');
      if(idx >= 0){
        url += '&sessionId=' + this.resource.environment.session.sessionId;
      }else{
        url += '?sessionId=' + this.resource.environment.session.sessionId;
      }
    }
    const electron = (window as any).electron;
    if(electron){
      const shell = electron.shell;
      //postでオープンしたいと、下記ソースを参照して
      // let win = new electron.remote.BrowserWindow();
      // let buf = "sessionId=" + this.resource.environment.session.sessionId;
      // win.loadURL(url,{postData:[{type: 'rawData',bytes: Buffer.from(buf)}]});
      shell.openExternal(url);
    }
  }

  public showVersionInfo(event: any) {
    let message = "はっちゅう君CFD\n Ver " + this.resource.environment.version + "\n© GMO CLICK Securities, Inc."
    MessageBox.info({title:'バージョン情報', message:message});
  }

  // public getLinkURL(input: string): string {
  //   let result: string = '';

  //   console.log(input);
  //   result = this.resource.environment.clientConfig[input];
  //   console.log(result);
  //   if(input == 'cashManagementURL' || input == 'QAURL') {
  //     result += '&sessionId=' + this.resource.environment.session.sessionId;
  //   }

  //   return result;
  // }

  // public openExplanation(){
  //   let dropdownInfo = $(this.element.nativeElement).find(".dropdown-info").detach();
  //   setTimeout(() => {
  //     $(this.element.nativeElement).find(".dropdown-for-info").append(dropdownInfo);
  //   }, 5);
  // }

  // /**
  //  * open screen
  //  *
  //  * @param scrId
  //  */
  // //最適化作業
  // public openScreen_1(scrId, subId:number=0 ) {
  //   console.log("subId: ", subId);
  //   this.panelMng.openPanel(this.resource.config.common.virtualScreen, scrId, {subid:subId});
  // }

  // /**
  //  * @param e
  //  */
  // public openNewWindow(e: Event) {
  //   // let self = this;
  //   // var name = self.resource.config.common.virtualScreen;
  //   // if(name == "1"){
  //   //   self.sdiDisable1 = true;
  //   // }else{
  //   //   self.sdiDisable2 = true;
  //   // }

  //   // // save after window open
  //   // let def: Deferred<any> = new Deferred<any>();
  //   // let subscription = def.asObservable().subscribe(
  //   //   val => {
  //   //     try {
  //   //       self.saveLayoutAsync().subscribe(val=>{
  //   //         // $("#virtualScreen1").addClass('active');
  //   //         self.resource.config.common.virtualScreen = "0";
  //   //       });
  //   //     }
  //   //     catch(e) {
  //   //       console.error(e);
  //   //     } finally {
  //   //       subscription.unsubscribe();
  //   //     }
  //   //   }
  //   // );

  //   // if (!self.subScribed) {
  //   //   self.subScribed = true;
  //   //   var mySubScription = self.windowService.openWindow(name, def).subscribe(
  //   //     windowInfo => {
  //   //       if(windowInfo["name"]=="1"){
  //   //         self.sdiDisable1 = false;
  //   //       }else{
  //   //         self.sdiDisable2 = false;
  //   //       }
  //   //       // reset parent window after child window closed
  //   //       this.initView.emit();
  //   //       console.log('restore ' + windowInfo["name"]);
  //   //     });
  //   // } else {
  //   //   self.windowService.openWindow(name, def);
  //   // }

  //   // self.chgVirScreen(0);
  // }

  // /**
  //  * @param e
  //  */
  // public closeWindow(e: Event) {
  //   // // 自動保存ONの場合は、保存処理後に閉じる
  //   // if (this.resource.config_old.common.tbAutoSave == '1') {
  //   //   let subscription = this.saveLayoutAsync().subscribe(
  //   //     val => {
  //   //       try {
  //   //         window.close();
  //   //       }
  //   //       catch(e) {
  //   //         console.error(e);
  //   //       } finally {
  //   //         subscription.unsubscribe();
  //   //       }
  //   //     }
  //   //   );
  //   // } else {
  //   //   window.close();
  //   // }
  // }

  // /**
  //  * close all child windows
  //  */
  // public closeAllChildWindows() {
  //   // // 自動保存ONの場合は、保存処理後に閉じる
  //   // if (this.resource.config_old.common.tbAutoSave == '1') {
  //   //   let subscription = this.saveLayoutAsync().subscribe(
  //   //     val => {
  //   //       try {
  //   //         this.windowService.closeAllWindows();
  //   //       }
  //   //       catch(e) {
  //   //         console.error(e);
  //   //       } finally {
  //   //         subscription.unsubscribe();
  //   //       }
  //   //     }
  //   //   );
  //   // } else {
  //   //   this.windowService.closeAllWindows();
  //   // }
  // }

  // /**
  //  *
  //  */
  // private toggleMenuStyle() {
  //   // this.menu.menuBar = !this.menu.menuBar;
  //   // this.resource.config.common.menuBar  = !this.resource.config.common.menuBar;
  // }


  // public chgVirScreen(vir:number){
  //   this.panelMng.chgVirScreen(vir);
  // }

  // /**
  //  * view stateの変更イベントを受信
  //  */
  // public onChangeViewState( data:IViewState, sender:ViewBase, byChild:boolean ){
  //   // 一般設定からの設定取得
  //   if (this.resource.config.mypanel.tbMypanelName1 !== '') {
  //     this.mypanelMenuList[0] = this.resource.config.mypanel.tbMypanelName1;
  //   } else {
  //     this.mypanelMenuList[0] = 'マイパネル１';
  //   }
  //   if (this.resource.config.mypanel.tbMypanelName2 !== '') {
  //     this.mypanelMenuList[1] = this.resource.config.mypanel.tbMypanelName2;
  //   } else {
  //     this.mypanelMenuList[1] = 'マイパネル２';
  //   }
  //   if (this.resource.config.mypanel.tbMypanelName3 !== '') {
  //     this.mypanelMenuList[2] = this.resource.config.mypanel.tbMypanelName3;
  //   } else {
  //     this.mypanelMenuList[2] = 'マイパネル３';
  //   }
  // }

  // /**
  //  *
  //  */
  // public saveLayout(){
  //   // this.saveLayoutAsync().subscribe(val=>{
  //   //   console.log( `save-layout result : ${val.responseStatus}` );
  //   // })
  // }

  // public inputPass(e: any){
  //   this.sharedData.SetPassword(this.pass);
  // }

  // /**
  //  * レイアウトを保存する（非同期処理）
  //  * @return Observable
  //  */
  // private saveLayoutAsync(): Observable<any> {
  //   let self = this;
  //   var layouts = self.panelMng.getLayoutInfos();
  //   var req : values.IReqSaveLayout={layout1:layouts[0],layout2:layouts[1],layout3:layouts[2]};
  //   var ret = self.business.saveLayout(req);

  //   //
  //   // added by choi sunwoo at 2017.07.12 for #1041
  //   //
  //   var chartLayouts = self.panelMng.getChartLayoutInfos();
  //   if(chartLayouts !== undefined && chartLayouts != null) {
  //     let nCount = chartLayouts.length;
  //     var reqChartSaveLayout = {};

  //     for(var ii = 0; ii < nCount; ii++) {
  //       let chartLayout = chartLayouts[ii];
  //       if(chartLayout && chartLayout.layoutNo) {
  //         let windows = chartLayout.windows;
  //         if(windows) {
  //           let nCountWindow = windows.length;
  //           if(nCountWindow !== undefined && nCountWindow != null) {
  //             let subTypeCode:string = 'A';
  //             let nSubTypeCode:number = subTypeCode.charCodeAt(0);

  //             for(var jj = 0; jj < nCountWindow; jj++) {
  //               let key = "layout" + chartLayout.layoutNo + String.fromCharCode(nSubTypeCode + jj);
  //               let window = windows[jj];
  //               reqChartSaveLayout[key] = window;
  //             }
  //           }
  //         }

  //       }
  //     } // end for

  //     // ret = self.business.saveChartLayout(reqChartSaveLayout);
  //   }

  //   return ret;

  // }

}
