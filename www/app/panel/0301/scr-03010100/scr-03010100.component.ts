import { Component, OnInit, ElementRef, HostListener, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import "rxjs/add/observable/zip";
import { PanelManageService } from '../../../service/panel-manage.service';
import { CommonConst, IPanelInfo } from '../../../core/common';
import { DialogService } from "ng2-bootstrap-modal";
import { ResourceService } from '../../../service/resource.service';
import { BusinessService } from '../../../service/business.service';
import { MenuBarComponent } from '../../../component/menu-bar/menu-bar.component';
import { MenuBarPowerAmountComponent } from '../../../component/menu-bar-amount/menu-bar-amount.component';
import { TaskBarComponent } from '../../../component/task-bar/task-bar.component';

import { MessageBox } from '../../../util/utils';
import { Messages} from '../../../../../common/message';
import { CommonConfig} from '../../../../../common/commonConfig';
import * as commonApp from '../../../../../common/commonApp'

declare var _ :any;
declare var $:any;
declare var __utils__;

const electron = (window as any).electron;

@Component({
  selector: 'scr-03010100',
  templateUrl: './scr-03010100.component.html',
  styleUrls: ['./scr-03010100.component.css']
})
export class Scr03010100Component {
  @ViewChild('menuBar') menuBar: MenuBarComponent;
  @ViewChild('menuBarAmount') menuBarAmount: MenuBarPowerAmountComponent;
  @ViewChild('taskBar') taskBar: TaskBarComponent;

  panels:any[] = [[]];
  active:any[] = [true];

  private fromLogout = false;
  private enableCloseWindow = false;
  private alertList: Array<any> = [];
  private appIcon;
  // subscribed list
  private notifySubscribe = [];
  private isClosing: boolean = false;

  public agreement:string; // 同意事項有無  0：未同意事項なし、1：未同意事項あり

  // show flag connect retry
  public displayConnectRetry = false;

  constructor(
    private element: ElementRef,
    private panelMng:PanelManageService,
    private dialogService:DialogService,
    private business:BusinessService,
    private changeRef: ChangeDetectorRef,
    public resource:ResourceService) {    // 最適化作業

    // subscribe changed virtual screen event
    panelMng.onChangeVirtualScreen().subscribe((vir)=>{
      this.chgVirScreen(vir);
    });

    this.notifySubscribe.push(panelMng.onChannelEvent().subscribe(val=>{
      if(val.channel == 'alertAddModify') {
        this.getAlertList();
      }
    }));

    this.appIcon = this.getAppIcon();

    this.getAlertList();

    this.listenNotifyer();

    this.getUserInfo();
  }

  ngAfterViewInit(){
    this.initBrowserMinMax();

    // subscribe open panel event
    this.panelMng.onOpenPanel().subscribe((info)=>{
      this.UpdatePanel();
    });

    // subscribe close panel event
    this.panelMng.onClosePanel().subscribe((info)=>{
      this.UpdatePanel();
    });

    // pre-close window event
    if(electron){
      electron.remote.getCurrentWindow().on('close',(e)=>{
        if( false == this.enableCloseWindow){
          if(this.isSaveLayout()){
            this.saveLayout();
          }else{
            this.showSaveLayout().subscribe(val=>{
              this.closeWindow();
            });
          }
        }
      });

      // break close window.
      var self = this;
      window.onbeforeunload = (e) => {
        if(!self.enableCloseWindow){
          e.returnValue = true;//this.enableCloseWindow;
        }
      }
    }

    // load layout
    this.loadLayout();

    // force stop scroll
    let $cont = $(".container");
    $cont.on("scroll", ()=>{
      $cont.scrollTop(0);
    });

    let $mid = $(this.element.nativeElement).find('mdi-area');
    $mid.on("scroll", ()=>{
      $mid.scrollTop(0);
      $mid.scrollLeft(0);
    }); 
  }

  ngOnDestroy(){
    this.unsubscribeAlertList();

    this.notifySubscribe.forEach(s=>{
      s.unsubscribe();
    }) 
  }

  /**
   * レイアウト保存可否（on：チェック、off：解除）
   */
  private isSaveLayout(){
    var save = this.resource.config.setting.display.displaySettings.saveLayout;

    return save == 'on';
  }

  /**
   *
   */
  private getLayout(){
    var sub = new Subject<any>();

    this.panelMng.getLayoutInfo().subscribe(val=>{
      sub.next([{layoutid_1:[val]}]);
    });

    return sub;
  }

  /**
   * #3218 同意事項有無フラグ取得
   */
  private getUserInfo(){
    let _self=this;
    this.business.getUserInfo().subscribe(val => {
      this.agreement = val.result.agreement;
      if(this.agreement == "1"){
        let url = this.resource.environment.clientConfig.reportKindSelectURL;
        let idx = url.indexOf('&');

        if(idx >= 0){
          url += '&sessionId=' + this.resource.environment.session.sessionId;
        }else{
          url += '?sessionId=' + this.resource.environment.session.sessionId;
        }
        this.openUrl(url);
      }
    });
  }

  private openUrl(url:string){
    const electron = (window as any).electron;
    if(electron){
      const shell = electron.shell;

      shell.openExternal(url);
    }
  }

  /**
   *
   */
  private showSaveLayout(){
    var sub = new Subject<any>();
    var cur = this.getLayout();
    var svr = this.business.getLayout();

    Observable.zip(cur,svr).subscribe(val=>{
      if(_.isEqual(val[0], val[1].result)){
        // 保存レイアウトと同じ。
        sub.next(null);
      }else{
        // サーバーに保存された情報があれば、
        if(val[1].result[0]){ 
          // ローカルに「今後このメッセージを表示しない」のチェックが保存されていない.
          if(this.resource.confirmHideAutoLayoutSave == false){
            this.showMessage(val[0]);
          }else{
            sub.next(null);
          }
        }
      }
    });

    return sub;
  }

  /**
   *
   */
  private showMessage(layout:any){
    var msg = {
      title:'レイアウト保存',
      message:'レイアウトを保存しますか？',
      checkboxLabel: "今後、このメッセージを表示しない",
      buttons:['保存しないで終了','保存して終了'],
      cancelId:2,   // xボタン用のID
    };

    MessageBox.question(msg,(response, checkboxChecked)=>{
      this.resource.confirmHideAutoLayoutSave = checkboxChecked;
      if(response==1){  // OK
        this.sendLayout(layout);
      }else if(response == 0) { // cancel
        this.closeWindow();
      }
      this.isClosing = false;
    });
  }

  /**
   *
   */
  private closeWindow(){
    var closeFunc = ()=>{
      this.enableCloseWindow = true;
      if(electron){
        if(this.fromLogout){
          // restart
          electron.remote.app.relaunch();
          electron.remote.app.exit(0);
        }else{
          electron.remote.getCurrentWindow().close();
        }
      }
    };

    this.business.logout().subscribe(
      val=>{
        closeFunc();
      },
      err=>{
        closeFunc();
      }
    );
  }

  /**
   *
   */
  private saveLayout(){
    this.getLayout().subscribe(val=>{
      this.sendLayout(val);
    })
  }

  /**
   *
   */
  private sendLayout(layout:any){
    this.business.setLayout(layout).subscribe(
      val=>{
        if(val.status != "0"){
          MessageBox.info({title:'レイアウト保存エラー', message:Messages.ERR_0001+'[CFDS3201T]'},(r,c)=>{
            this.closeWindow();
          });
        }else{
          this.closeWindow();
        }
      },
      err=>{
        MessageBox.info({title:'レイアウト保存エラー', message:Messages.ERR_0002+'[CFDS3202C]'},(r,c)=>{
          this.closeWindow();
        });
      }
    )
  }

  /**
   * 初期情報を取得して画面を初期化する
   */
  // public initView = (event:any) => {
  // }

  public isExternalWindow(){
    return true;
  }

  /**
   * MENU-BARからのCALL
   * 画面をminimize
   */
  public inoutWindow(){
  }

  /**
   * MENU-BARからのCALL
   * 画面をmaximize
   */
  public minisize(){
    this.minimize();
  }

  /**
   * MENU-BARからのCALL
   */
  public close(){
    if(!this.isClosing) {
      this.isClosing = true;
      var electron = (window as any).electron;

      if( electron ){
        electron.remote.getCurrentWindow().close();
      }
    }
  }

  /**
   * MENU-BARからのCALL
   */
  public maximize(){
    var electron = (window as any).electron;

    if( electron ){
      var cur = electron.remote.getCurrentWindow();

      if( cur ){
        if( cur.isMaximized()){
          cur.unmaximize();
        }else{
          cur.maximize();
        }
      }
    }
  }

  public minimize(){
    var electron = (window as any).electron;

    if( electron ){
      electron.remote.getCurrentWindow().minimize();
    }
  }

  public UpdatePanel(){
    var idx = parseInt(this.resource.config.common.virtualScreen);
    var pnl = this.panelMng.getPanels(idx);
    var arr = new Array<IPanelInfo>();

    pnl.forEach((p)=>{
      arr.push( p );
    });

    this.panels[idx] = arr;
    this.changeRef.detectChanges();
  }

  public chgVirScreen(vir){
    this.active[0] = vir == 0;
    // this.active[1] = vir == 1;
    // this.active[2] = vir == 2;

    this.UpdatePanel();
  }

  private getAlertList(){
    let alert = this.resource.config.setting.alert;
    if (this.alertList.length > 0) {
      this.unsubscribeAlertList();
    }
    if (alert) {
      for (let key in alert) {
        if (alert[key].validFlag == "1") {
          let subscribeTick = this.business.symbols.tick(this.resource.config.setting.alert[key].product).subscribe(val=>{
            let item = this.resource.config.setting.alert[key];
            if(item){
              if (item.validFlag == "1") {
                if (item.signal == "1") {
                  if (Number(val.bid) >= Number(item.basicRate)) {
                    this.alert(key);
                  }
                } else {
                  if (Number(val.bid) <= Number(item.basicRate)) {
                    this.alert(key);
                  }
                }
              }
            }
          });
          this.alertList.push({product:this.resource.config.setting.alert[key].product,subscribeTick:subscribeTick});
        }
      }
    }
  }

  private unsubscribeAlertList(){
    this.alertList.forEach(element => {
      if (element.subscribeTick) {
        element.subscribeTick.unsubscribe();
      }
    });
    this.alertList.length = 0;
  }

  private alert(key){
    let msg = this.business.symbols.getSymbolInfo(this.resource.config.setting.alert[key].product).meigaraSeiKanji + "\n" + this.resource.config.setting.alert[key].basicRate + "にヒットしました。";
    MessageBox.info({
      title:"アラート",
      message: msg
    });
    this.resource.config.setting.alert[key].validFlag = "0";
    let alert = [{"008":[this.resource.config.setting.alert]}];
    this.business.setAlert(alert).subscribe(
      val=>{
        if(val.status == "0"){
          this.panelMng.fireChannelEvent('unselectAlert', {});
          this.getAlertList();
        }
      },
      err=>{
        console.log(err);
      }
    )
    let sound = this.resource.config.setting.sound.soundSettings;
    if (sound.alertSound == "on") {
      try {
        let dirSeperator = "\\";
        if(electron){
          var ipc  = electron.remote.require('./main');
          dirSeperator =  ipc.FileUtil.dirSeperator();
        }
        let file = sound.alertSoundFolder + dirSeperator + sound.alertSoundFile;
        let audio = new Audio(file);
        audio.play();
      } catch (error) {
        //play default sound
        console.log(error);
      }
    }
  }

  private loadLayout(){
    this.business.getLayout().subscribe(val=>{
      let layout;
      if(val.result && val.result.length){
        layout = val.result;
      }else{
        layout = this.resource.defaultLayout();
      }
      this.panelMng.loadLayout(layout[0]['layoutid_1'][0]);
      this.openRemind(Object.keys(layout[0]['layoutid_1'][0]).length);
    })
  }

  private getAppIcon(){
    let icon;
    
    if(electron){
      let sep = "\\";
      let ipc = electron.remote.require('./main');
      let localDir =  ipc.FileUtil.getRootDir();

      sep = ipc.FileUtil.dirSeperator();
      // icon = `file://${localDir}/${CommonConfig.appIcon.png}`;
      icon = `${localDir}\\${CommonConfig.appIcon.ico}`;

      return icon;
    }

    return null;
  }

  private listenNotifyer(){
    // added if to avoide erro 'Cannot read property 'event' of null'
    if (this.business.notifyer !== null && this.business.notifyer.event != null) {
      this.business.notifyer.event().subscribe(val => {
        switch (val[1].eventType) {
          case commonApp.NoticeType.EXECUTION:
          case commonApp.NoticeType.LOSSCUT_RATE_SETTLE:
          case commonApp.NoticeType.SPEED_EXECUTION:
            let sound = this.resource.config.setting.sound.soundSettings;
            if (sound.executionSound == "on") {
              try {
                let dirSeperator = "\\";
                if(electron){
                  var ipc  = electron.remote.require('./main');
                  dirSeperator =  ipc.FileUtil.dirSeperator();
                }
                let file = sound.executionSoundFolder + dirSeperator + sound.executionSoundFile;
                let audio = new Audio(file);
                audio.play();
              } catch (error) {
                //play default sound
                console.log(error);
              }
            }
            break;
          case commonApp.NoticeType.NOTIFY_EXECUTION:
          case commonApp.NoticeType.NOTIFY_ORDER_INVALIDAION:
          case commonApp.NoticeType.NOTIFY_SPEED_EXPIRE:
          case commonApp.NoticeType.NOTIFY_EXPIRE:
            if (this.resource.config.setting.display.displaySettings.desktopNotify == "on") {
              let times = val[1].eventMessage.eventDate.split(" ")[3].split(":");
              let title = times[0] + ":" + times[1];
              let opt = { body: val[1].eventMessage.eventMessage, icon:'' };
              let body = val[1].eventMessage.eventMessage;
              if(electron){
                var ipc  = electron.remote.require('./main');
                let icon = null;
                if(ipc.FileUtil.dirSeperator() == "\\"){
                  icon = this.appIcon;
                }
                // let notification = new Notification(title, opt);
                let notify = MessageBox.notify(title,body,icon);
                notify.on("click",() => {
                  var self = electron.remote.getCurrentWindow();
                  if(self.isMinimized()) self.restore();
                  self.focus();
                  this.panelMng.openPanel( this.panelMng.virtualScreen(), '03010400');
                })
                notify.show();
              }
            }
            break;
          default:
            break;
        }
      })
    }
    
    // notice socket retry
    if(electron){
      electron.ipcRenderer.on(commonApp.IPC_CONNECTION_RETRY, (event,arg)=>{
        let sockets = arg.sockets;
        if(sockets){
          this.displayConnectRetry = false;
          for( var i=0; i < sockets.length; i++){
            let socket = sockets[i];
            if(socket.isConnected == false ){
              this.displayConnectRetry = true;
            }
          }
          this.changeRef.detectChanges();
        }
      });
    }
  }

  
  /**
   * set external window min & max size
   */
  private initBrowserMinMax(){
    if(electron){
      let win = electron.remote.getCurrentWindow();

      win.setMinimumSize(CommonConst.PANEL_SIZE_MIN, CommonConst.PANEL_SIZE_MIN);
      win.setMaximumSize(CommonConst.PANEL_SIZE_MAX, CommonConst.PANEL_SIZE_MAX);
    }
  }

  /**
   * お知らせ画面をオープンする
   */
  private openRemind(length:number){
    if(electron){
      let win = electron.remote.getCurrentWindow();
      let size = win.getSize();
      let left = (size[0] - 600)/2;
      let top = (size[1] - 512 - 24 - 72)/2;
      setTimeout(() => {
        this.panelMng.findPanel("03030400").subscribe(pnl => {
          if (pnl && pnl.length > 0) {
            this.panelMng.closePanel({id:"03030400",uniqueId:pnl[0].uniqueId,reason:{closeReason:"panelClosed",panelParams:""}});
          }
          this.panelMng.openPanel("0","03030400",{top:top,left:left}).subscribe(val => {
            this.panelMng.panelFocus(val.uniqueId);
          })
        })
      }, 250*(length+1));
    }
  }

  public closeLogout(){
    this.fromLogout = true;
    this.close();
  }
}
