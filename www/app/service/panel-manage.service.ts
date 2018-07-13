/**
 *
 * PanelManageService
 *
 */
import { Injectable } from '@angular/core';
import { CommonConst, WindowService, ViewBase, IPanelInfo, IPanelClose,　IPanelFocus, IViewState, IViewData, PanelViewBase } from '../core/common';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Deferred } from "../util/deferred";
import { MessageBox } from '../util/utils';
import { ILayoutInfo } from "../values/Values";
import * as CommonApp from '../../../common/commonApp';
import { setTimeout } from 'timers';

declare var $: any;

const electron = (window as any).electron;
const PANEL_EVENT_CHANNEL = 'panelManage.service-panelEvent:notice';
const PANEL_EVENT_IMPORT  = 'panelManage.service-panelEvent:import';
const PANEL_EVENT_CLOSE   = 'panelManage.service-panelEvent:close';
const IPC_ONFOCUS_NOTICE  = 'panelManage.onfocus.notice';
const IPC_ONBLUR_NOTICE  = 'panelManage.onblur.notice';
const IPC_ONFOCUS_NOTICE_FROM_EXTERNAL  = 'panelManage.onfocus.notice.from.external';

const LAYOUT_BASEIDX = 1;
const MAIN_PANEL_ID  = null;

//-----------------------------------------------------------------------------
// SERVICE : PanelManageService
// ----------------------------------------------------------------------------
@Injectable()
export class PanelManageService {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  // IPanelInfo array
  private _panels:IPanelInfo[][] = [];
  // panel unique id
  private _sequence:number = 0;
  // manage z-index
  private _panelLevel:number = 0;

  // event emitter : open panel
  private _emtPanelOpen = new Deferred<IPanelInfo>();
  // event emitter : close panel
  private _emtPanelClose = new Deferred<IPanelClose>();
  // event emitter : changed virtual screen.
  private _emtChgVirScr = new Deferred<number>();

  // find panel subjects
  private _findPanelSubject = [];

  // open panel stack
  private _openPanelStack = [];
  private _craeting = false;

  // 画面間データ連携
  private _emtChannelEvent = new Deferred<any>();

  // electron window id
  private _windowId = 0;

  // #2880
  // timeoutId for move(d) resolution
  private __devicePixelRatio__;
  private __sizeFlag:boolean = true;

  // event emitter : onfocus
  private _emtOnfocus = new Deferred<IPanelFocus>();

  // #3440: closed or opened: false, opening:true
  private _chartTechSettingIsLoading: boolean = false;

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( //private resourceService:ResourceService,
              //  private changeRef: ChangeDetectorRef,
               private windowService:WindowService ) {
    // create virtualscreen panel.
    for( let i=0; i < CommonConst.MAX_VIRTUALSCREEN; i++){
      this._panels.push([]);
    }

    if(electron){
      // set window id
      if(electron.parameter){
        this._windowId = electron.parameter.windowId;
      }

      // #2880
      // this.didRegisterEventForDomElemResize();
      //

      // 画面間イベント連携
      electron.ipcRenderer.on(PANEL_EVENT_CHANNEL, (event,arg)=>{
        this._emtChannelEvent.next({channel:arg.channel, arg:arg.arg});
      });

      // 画面Close event
      electron.ipcRenderer.on(PANEL_EVENT_CLOSE, (event,arg)=>{
        this._emtPanelClose.next(arg);
        // reset z-index.
        if (arg.uniqueId != null) this.resetPanelLevel(arg.uniqueId);
      });

      // received find panel query
      electron.ipcRenderer.on(CommonApp.IPC_FINDPANEL_QUERY, (event, arg) => {
        var panels = this._panels[this.virtualScreen()].filter( scr=> scr.id == arg.findPanel );
        var result = panels.map(m=>{return {uniqueId:m.uniqueId, param:m.params}});

        var self = electron.remote.getCurrentWindow();
        var webs = electron.remote.webContents.getAllWebContents();

        webs.forEach(web=>{
          if(self.webContents != web){
            web.send(CommonApp.IPC_FINDPANEL_REPLY, {windowId: this._windowId, panels: result});
          }
        })
      })

      // received find panel reply
      electron.ipcRenderer.on(CommonApp.IPC_FINDPANEL_REPLY, (event, arg) => {
        if(this._findPanelSubject){
          let sub = this._findPanelSubject.find(f=>f.windowId == arg.windowId);
          if(sub){
            sub.subject.next(arg);
          }
        }
      })

      // window import
      if(!this.isExternalWindow()){
        electron.ipcRenderer.on(PANEL_EVENT_IMPORT, (event,arg)=>{
          // 外だし画面がクローズされるまで少し待つ。
          setTimeout(()=> {
            this.onImportWindow(arg);
          }, 100);
        });
      }

      // #3144 外画面から、内部のパネルにフォーカスを当てる
      electron.ipcRenderer.on(IPC_ONFOCUS_NOTICE_FROM_EXTERNAL, (event, uniqueId)=>{
        let pinfo = this.parseUniqueId(uniqueId);
        if (this._windowId == pinfo.windowId) {
          // #3512 minimizeされていた場合も強制的にフォーカスする
          const info = this.getPanel(uniqueId);
          this.winRestore(info, uniqueId);
        }
      });

      electron.ipcRenderer.on(IPC_ONFOCUS_NOTICE, (event, arg) => {
        let pinfo = this.parseUniqueId(arg.uniqueId);
        if (this._windowId == pinfo.windowId) {
          let $focuspanel = $("#" + arg.uniqueId + " div.panel");
          $focuspanel.addClass("panel-top");
          let head = $focuspanel.find("title-bar");
          if (head.length) {
            head.focus();
          }
        } else {
          // #3144 内側のパネルのアクティブ画面と、外側のパネルのアクティブ画面は、それぞれ成立する
        }
        this._emtOnfocus.next(arg);
      })

      if (this.isExternalWindow()) {
        // #3144 外だし画面のフォーカスアウト時の処理
        electron.ipcRenderer.on(IPC_ONBLUR_NOTICE, (event, arg) => {
          let pinfo = this.parseUniqueId(arg.uniqueId);
          if (this._windowId == pinfo.windowId) {
            var $dpanel = $("dynamic-html div.panel");
            $dpanel.removeClass("panel-top");
          }
        })
      }

    }
  }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------

  // #3440
  public getChartTechSettingStatus() {
    return (this._chartTechSettingIsLoading);
  }
  public setChartTechSettingStatus(isLoading: boolean) {
    this._chartTechSettingIsLoading = isLoading;
  }
  //

  // #2880
  private didRegisterEventForDomElemResize = () => {
    let self = this;
    try {
      if(window && window.addEventListener) {
        // window.addEventListener('load', () => {
        //   var devicePixelRatio = window.devicePixelRatio || 1;
        //   self.__devicePixelRatio__ = devicePixelRatio;
        // });

        window.addEventListener('resize', () => {
          var devicePixelRatio = window.devicePixelRatio || 1;
          if(self.__devicePixelRatio__ != devicePixelRatio) {
            let __pre_devicePixelRatio__:number = self.__devicePixelRatio__ || 1;
            self.__devicePixelRatio__ = devicePixelRatio;

            let browser = electron.remote.getCurrentWindow();
            try {
              if(browser) {
                let xSize = browser.getSize();
                let sizeOffset:number = 1;
                if(self.__sizeFlag == true) {
                  sizeOffset = -1;
                  self.__sizeFlag = false;
                }
                else {
                  sizeOffset = 1;
                  self.__sizeFlag = true;
                }
                //browser.setSize(Math.round(xSize[0] / __pre_devicePixelRatio__), Math.round(xSize[1] /__pre_devicePixelRatio__));
                browser.setSize(xSize[0], xSize[1] + sizeOffset);
              }
            }
            catch(e) {
              throw e;
            }
          }
        });
      }
    }
    catch(e) {
      console.error(e);
    }
  }
  //

  /**
   * get panels. current virtual screen
   */
  public getCurPanels():any[]{
    return this._panels[this.virtualScreen()];
  }

  /**
   * get panels
   */
  public getPanels(index:number):any[]{
    return this._panels[index];
  }

  public makeUniqueId(winId:number, seq:number){
    return `_window${winId}-${CommonConst.PANEL_ID_PREFIX}${seq}`;
  }

  /**
   * open new screen
   */
  public openPanel( virNo:string, scrId:string, params:any = null ):Observable<{id:string, uniqueId:string}>{//{id:string, uniqueId:string}{
    var subject = new Subject<{id:string, uniqueId:string}>();
    var _createPnl = (panel)=>{
      if(panel){
        this._craeting = true;
        setTimeout(() => {
          this.openPanelEx(panel).subscribe(val=>{
            panel.subject.next(val);
            panel.subject.complete();
          },
          err=>{},
          ()=>{
            this._craeting = false;
            _createPnl(this._openPanelStack.pop());
          });
        }, 1);
      }
    }

    // open panel stack for async
    this._openPanelStack.push( {virNo:virNo, scrId:scrId, params:params, subject:subject} );

    if(!this._craeting){
      _createPnl(this._openPanelStack.pop());
    }

    return subject;
  }

  private openPanelEx(panel:{virNo:string, scrId:string, params:any, subject:any}){
    var subject = new Subject<{id:string, uniqueId:string}>();
    var opt = (panel.params)?panel.params:{};
    var rtn;

    // 最大画面数確認
    this.validPanelCount( panel.virNo, panel.scrId).subscribe(val=>{
      // get default position
      if(opt['left']==undefined && opt['top']==undefined ){
        let pos = this.panelAlignment();
        opt.left = pos.left;
        opt.top = pos.top;
      }

      // レイアウト復元による外だし画面オープン
      if(opt && opt.layout && opt.layout.external){
        rtn = this.openPanelExternal(panel.virNo, panel.scrId, opt);
      }else{
        // 内部画面オープン
        rtn = this.openPanelInner(panel.virNo, panel.scrId, opt);
      }

      subject.next(rtn);
      // subject.complete();
    },
    err=>{},
    ()=>{
      subject.complete();
    });

    return subject;
  }

  /**
   * Internal panel open
   */
  private openPanelInner(virNo:string, scrId:string, opt:any){
    var info:IPanelInfo = {
      id:         scrId,
      virtualId:  parseInt(virNo),
      component:  CommonConst.PANELLIST[scrId]['selector'],
      title:      CommonConst.PANELLIST[scrId]['title'],
      subTitle:   CommonConst.PANELLIST[scrId]['title'],
      save:       CommonConst.PANELLIST[scrId]['save'],
      uniqueId:   this.makeUniqueId(this._windowId, this._sequence),
      showscreen: true,
      zIndex:     0,
      params:     opt,
    };

    this._panels[virNo].push( info );

    this._sequence++;

    console.log(`open panel : [${info.title}] ${info.component}` + ' params : ' + JSON.stringify(info.params));

    // fire event. open panel
    this._emtPanelOpen.next(info);

    return {id:scrId, uniqueId:info.uniqueId};
  }

  /**
   * External panel open
   */
  private openPanelExternal(virNo:string, scrId:string, opt:any){
    let info = CommonConst.PANELLIST[scrId];
    let pos = opt.layout.position;
    let adjust = {} as any;
    let uniqueId = null;

    if(pos){
      // from saved layout
      if( pos.width == null){
        pos.width = info.width;
      }
      if( pos.height == null){
        pos.height = info.height;
      }
    }else{
      // from export panel. set default position
      if (electron) {
        const remote = electron.remote;
        let window = remote.getCurrentWindow();
        let position = window.getPosition();
        adjust = this.getLeftTopPosition({left:position[0], top:position[1]});
      }
      pos={x:adjust.left, y:adjust.top, width:info.width, height:info.height };
    }

    // craete new browser
    let win = this.exportWindow(scrId, pos.x, pos.y, pos.width, pos.height, opt, uniqueId);

    return {id:scrId, uniqueId:uniqueId};
  }

  /**
   * 左上位置を取得する。
   */
  private getLeftTopPosition( pos:{left:number, top:number}){
    let displays = electron.screen.getAllDisplays();

    for( let i=0; i < displays.length; i++ ){
      let target = displays[i];
      let bound = target.bounds;

      if( (bound.x <= pos.left && (bound.x + bound.width) >= pos.left ) &&
          (bound.y <= pos.top  && (bound.y + bound.height) >= pos.top )) {

        pos.left = target.workArea.x;
        pos.top  = target.workArea.y;

        return pos;
      }
    }

    return {left:0, top:0};
  }

  /**
   * パネルを最小化する
   *
   * @param info
   */
  private winMinimize(info:IPanelInfo){
    var $panel = $("#" + info.uniqueId + " div.panel");

    // animate panel
    $panel.removeClass('gws-show gws-hide');
    $panel.addClass('gws-hide');

    setTimeout(()=>{
      document.getElementById(info.uniqueId).style.display="none";
    },300);

    info.showscreen = false;
    info.zIndex = 0;

    this.resetPanelLevel();
  }

  /**
   * パネルのZ-indexを再設定する。
   */
  public resetPanelLevel(uniqueId:string = null){
    // 全体パネルからTop削除
    var $dpanel = $("dynamic-html div.panel");
    $dpanel.removeClass("panel-top");

    // タスクバーのボタンからTop削除
    if (uniqueId != null)  {
      var $taskBar = $(".task-bar .button-group .button");
      $taskBar.removeClass("task-bar-top");
      $taskBar.removeClass(uniqueId);
      var $taskBarMenu = $(".task-bar .dropdown-menu " + " ." + uniqueId + " i.svg-icons");
      $taskBarMenu.removeClass(uniqueId);
      $taskBarMenu.find("i.svg-icons").removeClass("icon-current-mark");
    } else {
      $(".task-bar .button-group .button").removeClass("task-bar-top");
      $(".task-bar .dropdown-menu i.svg-icons").removeClass("icon-current-mark");
    }

    // 次のTopパネルを検索してTop追加
    var maxzindex = 0;
    var maxuniqueId;
    var panels = this._panels[this.virtualScreen()];

    panels.forEach( (scr)=>{
      if (scr.zIndex>maxzindex){
        maxzindex = scr.zIndex;
        maxuniqueId = scr.uniqueId;
      }
    });

    $("#" + maxuniqueId + " div.panel").addClass("panel-top");

    // タスクバーのボタンにTopを設定
    setTimeout(()=>{
      $(".task-bar .button-group" + " ." + maxuniqueId + ".button").addClass("task-bar-top");
      $(".task-bar .dropdown-menu " + " ." + maxuniqueId + " i.svg-icons").addClass("icon-current-mark");
    }, 50);

    // 次のTopパネルにFocus
    this._panelLevel = maxzindex;
    let panelInfo:IPanelInfo = this.getPanel(maxuniqueId);
    if (panelInfo) {
      this.fireWinFocus(maxuniqueId, {id:panelInfo.id, uniqueId:maxuniqueId, panelParams:panelInfo.params});
    }
  }

  /**
   * 最小化されたパネルを元の位置に戻す
   * 
   * @param info 戻す画面情報
   * @argument uniqueId 戻す画面が外だしとなっている可能性がある場合、必須
   */
  public winRestore(info:IPanelInfo, uniqueId?:string){
    if(info && info.showscreen == false){
      var $panel = $("#" + info.uniqueId + " div.panel");

      // animate panel
      $panel.removeClass('gws-show gws-hide');
      $panel.addClass('gws-show');

      document.getElementById(info.uniqueId).style.display="block";

      info.showscreen = true;

      info.instance.onPanelRestored();
    }

    if (info) {
      var panelFocus:IPanelFocus = {
        id : info.id,
        uniqueId : info.uniqueId,
        panelParams : info.params
      }
      this.panelFocus(info.uniqueId, panelFocus);
    } else {
      this.winFocus(uniqueId);
    }
  }

  /**
   * パネルに「Focus」を入れる又は「最小化」する
   *
   * @param uniqueId
   */
  public behavePanelTouch(uniqueId:string){
    var info = this.getPanel( uniqueId );

    // set focus
    if( info.showscreen && info.zIndex < this._panelLevel ){
      this.panelFocus(uniqueId);
      return;
    }

    // minimize panel
    if( info.showscreen ){
      this.winMinimize( info );
      info.instance.onPanelMinimized();
      return;
    }

    // restore panel
    this.winRestore( info, uniqueId );
  }

  /**
   *
   */
  public virtualScreen(){
    // return this.resourceService.config.common.virtualScreen;
    return '0';
  }

  /**
   * close panel
   */
  public closePanel( option:IPanelClose ){
    var panels = this._panels[this.virtualScreen()];

    // fire event. close panel
    this.fireClosePanel(option);

    // remove panel.
    for( var i=0; i < panels.length; i++){
      if( panels[i].uniqueId == option.uniqueId ){
        let id = panels[i].id;
        panels[i]=null;
        panels.splice( i, 1);

        return;
      }
    }
  }

  public fireClosePanel(option:IPanelClose){
    if(electron){
      // send another windows
      var wins = this.windowService.getOpenWindows();
      wins.forEach(win=>{
        win.browserWindow.send(PANEL_EVENT_CLOSE, option);
      })
    }
  }

  /**
   * 外部パネルがフォーカスされた際に呼び出す
   */
  public fireWinFocus(uniqueId:string, panelFocus?:IPanelFocus) {
    let wins = this.windowService.getOpenWindows();
    wins.forEach(win => {
      try {
        win.browserWindow.send(IPC_ONFOCUS_NOTICE, panelFocus);
      }
      catch(e){
        // console.log(e);
      }
    });
  }

  /**
   * 外部パネルのフォーカスが外れた際に呼び出す
   */
  public fireWinBlur(panelFocus?:IPanelFocus) {
    let wins = this.windowService.getOpenWindows();
    wins.forEach(win => {
      win.browserWindow.send(IPC_ONBLUR_NOTICE, panelFocus);
    });
  }

  /**
   * close all panels
   */
  public closeAllPanels() {
    // close inner panel
    for ( let v=0; v < this._panels.length; v++) {
      var panels = this._panels[v.toString()];
      let panelLength = panels.length;
      for( let i=0; i < panelLength; i++){
        let uniqueId = panels[0].uniqueId;
        panels[0]=null;
        panels.splice(0, 1);
        this.resetPanelLevel(uniqueId);
        this.fireClosePanel({id:undefined, uniqueId:uniqueId, reason:{closeReason:'panelClosed', panelParams:undefined}});
      }
    }

    // close external panel
    if(electron){
      var self = electron.remote.getCurrentWindow();
      var wins = this.windowService.getOpenWindows();

      wins.forEach(win=>{
        if(win.browserWindow != self){
          win.browserWindow.close();
        }
      })
    }
  }

  /**
   * 特定画面の情報を返す
   *
   * @param uniqueId 特定画面の識別ID
   */
  public getPanel( uniqueId:string ):IPanelInfo{
    var panels = this._panels[this.virtualScreen()];

    return  panels.find( scr=> scr.uniqueId == uniqueId );
  }

  /**
   * 画面IDに該当する画面リストを返す
   *
   * @param panelId 画面ID
   * @return uniqueIdのリストを返す
   */
  public findPanel( panelId:string ):Observable<{uniqueId?:string,param?:any}[]>{
    var panels = this._panels[this.virtualScreen()].filter( scr=> scr.id == panelId );
    var wins   = this.windowService.getOpenWindows();
    var result = panels.map(m=>{return {uniqueId:m.uniqueId, param:m.params}});
    var subject = new Subject<{uniqueId?:string,param?:any}[]>();

    if(electron){
      var self = electron.remote.getCurrentWindow();
      var sdi, mdi;

      wins = wins.filter(w=>w.browserWindow != self);
      sdi =  wins.filter(w=>w.panelId != null);
      mdi =  wins.filter(w=>w.panelId == null);

      this._findPanelSubject =[];

      // get sdi style browsers
      sdi.forEach(win=>{
        if(win.panelId == panelId){
          let unique = this.makeUniqueId(win.windowId, 0);
          let winfo  = this.windowService.findWindow(win.windowId);
          let param;

          if(winfo && winfo.option){
            param = winfo.option.params;
          }

          result.push({uniqueId:unique, param:param});
        }
      });

      // query mdi style browsers
      if( mdi.length ){
        var cnt = mdi.length;

        mdi.forEach(win=>{
          let data = {windowId: win.windowId, subject: new Subject<any>()};

          win.browserWindow.send(CommonApp.IPC_FINDPANEL_QUERY, {findPanel:panelId});

          // wait reply
          data.subject.subscribe(val=>{
            result = result.concat(val.panels);
            if( --cnt <= 0){
              subject.next(result);
              subject.complete();
            }
          });
          this._findPanelSubject.push(data);
        });
      }else{
        setTimeout(() => {
          subject.next(result);
          subject.complete();
        }, 0);
      }
    }

    return subject;
  }

  /**
   * 外だし画面にフォーカスする
   * @param uniqueId
   */
  public winFocus(uniqueId: string) {
    let pinfo = this.parseUniqueId(uniqueId);
    let wins = this.windowService.getOpenWindows();
    wins.forEach(win => {
      if (win.windowId == pinfo.windowId) {
        win.browserWindow.focus();
      }
    })
  }

  /**
   * set panel focus
   *
   * @param uniqueId
   * @param panelFocus
   * @param fromExternal 外画面から、内部のパネルにフォーカスを当てる場合は真 デフォルトは偽
   */
  public panelFocus( uniqueId:string, panelFocus?:IPanelFocus, fromExternal:boolean=false ):boolean{

    let pinfo = this.parseUniqueId(uniqueId);
    let wins = this.windowService.getOpenWindows();

    // 仮想画面の区分
    let info = this.getPanel(uniqueId);

    if (info) {
      // ------- 内部画面 -------
      // 内部画面の重なり順
      var zindex = info.zIndex;
      if (zindex != this._panelLevel || this._panelLevel == 0) {
        this._panelLevel++;
        info.zIndex = this._panelLevel;
      }
      if (!$("#" + uniqueId + " div.panel").hasClass("panel-top")) {
        let head = $("#" + uniqueId + " div.panel").find("title-bar");
        if (head.length) {
          setTimeout(() => {
            head.focus();
          }, 50);
        }
      }
      // 全体パネルからTop削除
      var $dpanel = $("dynamic-html div.panel");
      $dpanel.removeClass("panel-top");

      // タスクバーのボタンからTop削除
      $(".task-bar .button-group .button").removeClass("task-bar-top");
      $(".task-bar .dropdown-menu i.svg-icons").removeClass("icon-current-mark");


      // Focusを貰ったパネルにTop追加
      $("#" + uniqueId + " div.panel")
        .css('z-index', this._panelLevel)
        .addClass("panel-top");

      // タスクバーのボタンにTopを設定
      setTimeout(() => {
        // Focusを貰ったタスクバーのボタンにTop追加
        $(".task-bar .button-group" + " ." + uniqueId + ".button").addClass("task-bar-top");
        $(".task-bar .dropdown-menu " + " ." + uniqueId + " i.svg-icons").addClass("icon-current-mark");
      }, 50);

      if (panelFocus) {
        wins.forEach(win => {
          if (win.windowId != pinfo.windowId) {
            win.browserWindow.send(IPC_ONFOCUS_NOTICE, panelFocus);
          } else {
            this._emtOnfocus.next(panelFocus);
          }
        });
      }

      return true;
    }else{
      // ------- 外だし画面 -------
      if (fromExternal) {
        // #3144 外画面から、内部のパネルにフォーカスを当てる
        wins.forEach(win => {
          win.browserWindow.send(IPC_ONFOCUS_NOTICE_FROM_EXTERNAL, uniqueId);
        });
      }

    }
    return false;
  }

  // open warn dialog
  private openDialog() {
    // let dialogRef = this.dialog.open(NoticDialogComponent);
    // dialogRef.afterClosed().subscribe(result => {
    //  // this.selectedOption = result;
    // });
  }

  /**
   * 全画面を最小化する。
   *
   * minimize : true:最小化する。　false:元に戻す
   */
  public minimizeAll( minimize:boolean ){
    var panels = this._panels[this.virtualScreen()];

    panels.forEach( (info)=>{
      if( minimize ){
        // 全画面を最小化する。
        if( info.showscreen )
        {
          this.winMinimize(info);
        }
      }else{
        // 最小化された全画面を元に戻す。
        if( !info.showscreen )
        {
          this.winRestore(info);
        }
      }
    });
  }

  //同一画面を斜めに整列
  public panelAlignment() {
    var offset = 0;
    var panels = this.getCurPanels();

    for(let i=0; i< panels.length; i++) {
      var pnl = panels[i].instance as PanelViewBase;

      if( pnl ){
        var pos = pnl.getPosition();

        if( pos.left == offset && pos.top == offset ){
          offset+=20;
          i=0;
        }
      }
    }

    return {left:offset, top:offset};
  }

   /**
   * 全画面を集合する。
   *
   * panelset : true:集合する。
   */
  public setPanelAll(){
    var offset = 0;
    var panels = this.getCurPanels();

    panels.forEach( (panel)=>{
      // 最小化された全画面を元に戻す。
      this.winRestore(panel);

      let left = offset;
      let top = offset;
      //panel.tranlate3d(left,top);
      panel.instance.element.nativeElement.children[0].style.transform = 'translate3d(${(left)}px, ${(top)}px, 0)';
      offset += 20;
    });
  }

  /**
   * 全パネルに変更イベントを転送
   *
   * @param state
   */
  public broadcastViewState( state:IViewState, sender:ViewBase ){
    this._panels.forEach( group=>{
      group.forEach( panel=>{
        if( panel.instance && panel.instance != sender ){
          panel.instance.onChangeViewState(state, null, false);
        }
      });
    });
  }

  /**
   * 現在仮想画面のパネルに変更データーを転送
   *
   * @param state
   */
  public broadcastViewData( data:IViewData, sender:ViewBase ){
    var panels = this.getCurPanels();

    panels.forEach( panel=>{
      if( panel.instance && panel.instance != sender ){
        panel.instance.onChangeViewData(data, null, false);
      }
    });
  }

  /**
   * change virtual screen event.
   *
   * @param vir : virtual screen number
   */
  public chgVirScreen(vir){
    this._emtChgVirScr.next(vir);
  }

  public onChangeVirtualScreen(){
    return this._emtChgVirScr;
  }

  /**
   * open panel event
   */
  public onOpenPanel(){
    return this._emtPanelOpen;
  }

  /**
   * close panel event
   */
  public onClosePanel(){
    return this._emtPanelClose;
  }

  /**
   * 外だし画面を内部画面に移動。
   */
  public onImportWindow(arg:any){
    var lay = arg.option as ILayoutInfo;

    // init external position
    if(lay){
      lay.external = false;

      if(lay.position){
        lay.position.x = undefined;
        lay.position.y = undefined;
      }
    }

    this.openPanelFromLayout(lay);
  }

  /**
   *  外にポップアップされた画面をMDI内部に移動させる。
   *  import window
   */
  public importWindow(panelId:string, params:any){
    if(electron){
      // send another windows
      var wins = this.windowService.getOpenWindows();
      wins.forEach(win=>{
        win.browserWindow.send(PANEL_EVENT_IMPORT,{pageId:panelId, option:params});
      })
    }
  }

  /**
   *  MDI内部画面を外にポップアップさせる。
   *  export window
   */
  public exportWindow(scrId:string, x:number, y:number, width:number, height:number, params:any, uniqueId:string ){
    let win = this.windowService.exportWindow( scrId, x, y, width, height, params );
    // center position.
    if(win){
      if (uniqueId == null) uniqueId = this.makeUniqueId(win.id, 0);

      // #3144 レイアウト保存された場合の初期処理で画面ポップアップする場合と、
      // 内部画面のパネルから画面ポップアップする場合で、以下の処理の差分があったため、処理を共通化。
      // ※もともとpanelViewBaseのexportWindow()で定義されていた。close,focusのイベント取得と通知を行う。
      win.on("close", (event,arg)=>{
        this.fireClosePanel({id:scrId, uniqueId:uniqueId, reason:{closeReason:'panelClosed', panelParams:params}});
      });
      this.closePanel({id:scrId, uniqueId:uniqueId, reason:{closeReason:'movedOutSide', panelParams:params}});
      win.on("focus", (event,arg)=>{
        let uniqueId = this.makeUniqueId(win.id, 0);
        this.fireWinFocus(uniqueId, {id:scrId, uniqueId:uniqueId, panelParams:params});
      });
      win.on("blur", (event,arg)=>{
        let uniqueId = this.makeUniqueId(win.id, 0);
        this.fireWinBlur({id:scrId, uniqueId:uniqueId, panelParams:params});
      });
      setTimeout(() =>{
        this.fireWinFocus(uniqueId, {id:scrId, uniqueId:uniqueId, panelParams:params});
      }, 50);
    }
  }

  /**
   * 保存する画面レイアウトの情報取得
   */
  public getLayoutInfo():Observable<any>{
    var layout = {};
    // var layout  = [];
    var subject = new Subject<any>();
    var panel_idx = LAYOUT_BASEIDX;

    // 内部画面リスト
    var panels = this._panels[0];

    panels.forEach(panel => {
      if(panel && panel.save && panel.instance) {
        var view = (panel.instance as PanelViewBase);
        layout['windows_'+(panel_idx++)] = view.getLayoutInfo();
      }
    });

    // 外だし画面リスト
    if(electron){
      var count = 0;
      var webs;

      // reset
      electron.ipcRenderer.sendSync(CommonApp.IPC_LAYOUTINFO_CLEAR);

      // send another windows
      var wins = this.windowService.getOpenWindows();
      wins.forEach(win=>{
        if(win.panelId){
          let pnlInfo = CommonConst.PANELLIST[win.panelId];

          // layout保存対象画面
          if(pnlInfo && pnlInfo.save && win.loaded ){
            win.browserWindow.send(CommonApp.IPC_LAYOUTINFO_QUERY);
            count++;
          }
        }
      })

      if(count <= 0){
        // retrun only inner panels
        setTimeout(()=>{
          subject.next(layout);
        }, 100);
      }else{
        // return with external panels
        var checkCount = 0;
        var saveComplete = ()=>{
          setTimeout(()=>{
            let rtn = electron.ipcRenderer.sendSync(CommonApp.IPC_LAYOUTINFO_GET);
            if(rtn && rtn.length >= count){
              rtn.forEach(el=>{
                layout['windows_'+(panel_idx++)] = el;
              })

              subject.next(layout);
            }else{
              if( checkCount < 10 ){
                // one moer check
                console.log('one moer check saveComplete.');
                saveComplete();
                checkCount++;
              }else{
                // 取得待機を強制終了する。(最大5秒)
                console.warn('one moer check saveComplete.');
                subject.next(layout);
              }
            }
          }, 500);
        };

        saveComplete();
      }
    }

    // return layouts;
    return subject;
  }

  /**
   * レイアウト復元
   */
  public loadLayout(layout:any){
    this.closeAllPanels();

    if(layout){
      Object.keys(layout).forEach(el=>{
        this.openPanelFromLayout(layout[el]);
      })
    }
  }

  public openPanelFromLayout(layout:ILayoutInfo){
    let param = {layout:layout};

    // set panel position
    if(layout.position){
      if(layout.external == false){
        param['left']   = layout.position.x;
        param['top']    = layout.position.y;
      }
      param['width']  = layout.position.width;
      param['height'] = layout.position.height;
    }

    this.openPanel('0', layout.windowId, param);
  }

  /**
   *
   */
  public onChannelEvent(){
    return this._emtChannelEvent;
  }

  /**
   *
   * @param channel
   * @param arg
   */
  public fireChannelEvent(channel:string, arg:any){
    this._emtChannelEvent.next({channel:channel, arg:arg});

    if(electron){
      var self = electron.remote.getCurrentWindow();
      var webs = electron.remote.webContents.getAllWebContents();

      webs.forEach(web=>{
        if(self.webContents != web){
          web.send( PANEL_EVENT_CHANNEL, {channel:channel, arg:arg});
        }
      })
    }
  }

  /**
   * 外だしウィンドウなのかチェックする。
   */
  public isExternalWindow(){
    var win = window as any;
    var param = win.electron?win.electron.parameter?win.electron.parameter:null:null;

    return param?param.panelId?true:false:false;
  }

  /**
   * 最大画面数確認
   */
  private validPanelCount( virNo:string, scrId:string):Observable<any>{
    // 内部画面
    var info   = CommonConst.PANELLIST[scrId];
    var subject = new Subject<any>();

    this.findPanel(scrId).subscribe(panels=>{
      // 最大画面数を超えた。
      if( info.maxCount <= panels.length ){
        if(info.maxCount > 1){
          // 最大画面数 2 以上
          var title = info.alias?info.alias:info.title;
          var msg = {
            title:    `${title}画面を表示できません`,
            message:  `${title}画面の最大表示数は${info.maxCount}枚です。`
          };

          MessageBox.info(msg, ()=>{
            subject.complete();
          });
        }else{
          // 最大画面数 == 1
          let pinfo = this.parseUniqueId(panels[0].uniqueId);

          if( pinfo.windowId == this._windowId ){
            // 内部画面の場合。
            this.winRestore( this.getPanel( pinfo.uniqueId ), panels[0].uniqueId );
          }else{
            // 外だし画面の場合。
            let w = this.windowService.findWindow(pinfo.windowId);
            if(w.browserWindow.isMinimized()) w.browserWindow.restore();
            w.browserWindow.focus();
          }
          subject.complete();
        }
      }else{
        subject.next();
        subject.complete();
      }
    })

    return subject;
  }

  private parseUniqueId(uniqueId:string){
    let sep = uniqueId.split('-');
    let winId, seq;

    if(sep.length == 2){
      winId = sep[0].replace('_window', '');
      seq   = sep[0].replace(CommonConst.PANEL_ID_PREFIX, '');
    }

    return {windowId: winId, sequence:seq, uniqueId: uniqueId};
  }

  public onfocus() {
    return this._emtOnfocus;
  }
}
