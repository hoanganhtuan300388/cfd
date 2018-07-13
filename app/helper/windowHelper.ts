/**
 * 
 * Window Helper
 * 
 */
import * as electron from 'electron';
import * as path from 'path';
import * as url  from 'url';

import {FileUtil} from '../util/fileUtil';
import {CommonConfig} from '../../common/commonConfig';
import {IWindowInfo, IWindowOption} from '../../common/interface';
import {StorageHelper} from './storageHelper';

import * as CommonApp from '../../common/commonApp';

//-----------------------------------------------------------------------------
// SERVICE : WindowHelper
// ----------------------------------------------------------------------------
export class WindowHelper{
  static instance;

  private datas = [];
  private layouts = [];

  // open windows list
  private windows:IWindowInfo[] = [];
  private appIcon;

  public  AppCounter = 0;
  
  //---------------------------------------------------------------------------
  // Protected constructor
  // --------------------------------------------------------------------------	
  protected constructor(){
    this.relayLayoutInfo();
    this.appIcon = this.getAppIcon();
  }  

 	//---------------------------------------------------------------------------
  // member
  //--------------------------------------------------------------------------- 
  public static getInstance():WindowHelper{
    if( WindowHelper.instance == null ){
      WindowHelper.instance = new WindowHelper();
      WindowHelper.instance.init();
    }

    return WindowHelper.instance;
  }  

  private getAppIcon(){
    let icon  = `${FileUtil.getRootDir()}\\${CommonConfig.appIcon.ico}`;
    let image = electron.nativeImage.createFromPath(icon);

    return image;
  }

  /**
   * レイアウト保存関連メッセージ中継
   */
  private relayLayoutInfo(){
    electron.ipcMain.on(CommonApp.IPC_LAYOUTINFO_CLEAR, (event, arg) => {
      this.layouts=[];
      event.returnValue = true;
    })
    electron.ipcMain.on(CommonApp.IPC_LAYOUTINFO_SET, (event, arg) => {
      this.layouts.push(arg);
      event.returnValue = true;
    })
    electron.ipcMain.on(CommonApp.IPC_LAYOUTINFO_GET, (event, arg) => {
      event.returnValue = this.layouts;
    }) 
  }

  /**
   * init
   * 
   */
  protected init(){
    // #3137 ログイン画面起動カウント（Lodding中のアニメーション）
    this.AppCounter = StorageHelper.getRootValue('appRunCount');
    if( this.AppCounter == null ){
      this.AppCounter = 0;
    }else{
      this.AppCounter = Math.min(this.AppCounter, 1000000 );
    }
  }  

  /**
   * push window parameter
   */
  public push(data:any){
    this.datas.push(data);
  }

  /**
   * pop window parameter
   */
  public pop(winId:number){
    var dat;

    for(var i=0; i<this.datas.length; i++){
      dat = this.datas[i];

      if(dat.windowId == winId){
        this.datas.splice(i,1);
        return dat;
      }
    }

    return null;
  }

  public registWindow(param:IWindowInfo){
    this.windows.push( param );
  }

  public findWindow( id:number ):IWindowInfo{
    return this.windows.find((w)=>w.windowId==id);
  }

  public removeWindow( win:any ){
    for( var i=0; i<this.windows.length; i++){
      if( this.windows[i].browserWindow == win ){
        this.windows.splice(i, 1);
        break;
      }
    }
  }

  public onLoadedWindow( win:any ){
    var target = this.windows.find((w)=>w.browserWindow==win);

    target.loaded = true;
  }

  public getWindows(){
    // var wins = this.windows.filter((w)=>w.loaded==true);
    // return wins;
    return this.windows;
  }

  /**
   * openWindow
   * 
   * @param elementName 
   * @param width 
   * @param height 
   */
  public openWindow (elementName, left, top, width, height, option?:IWindowOption):Electron.BrowserWindow{
    return this.exportWindow( elementName, left, top, width, height, option );
  }  

  /**
   * 外だしウィンドウを生成する。
   * 
   * @param elementName 
   * @param width 
   * @param height 
   */
  public exportWindow (elementName, left, top, width, height, option?:IWindowOption):Electron.BrowserWindow{
    var isCenter = (left == undefined || top == undefined )?true:false;
    var pos  = {left:left, top:top};
    var preload;
    var fileName;

    if(isCenter == false && !this.adjustMonitorPosition(pos)){
      // 対象モニターが見つからなかったら中央に表示
      isCenter = true;
      pos.left = null;
      pos.top  = null;
    }
    
    preload  = path.join(__dirname, './preload.js');
    fileName = path.join(__dirname, '../www/index.html');
    fileName = url.format({pathname: fileName, protocol: 'file:', slashes: true });
    
    // Create the browser window.
    var winParam:any = {
      x: pos.left,
      y: pos.top,
      center: true,
      width: width,
      height: height,
      frame:false,
      darkTheme:true,
      backgroundColor: '#2d2d42',
      useContentSize:true,
      icon: this.appIcon,
      webPreferences:{
        preload: preload,
        webSecurity: false
      }
    };

    var parentWindow:any;
    if(option && option.modal == true) {
      parentWindow = option.parentWindow;
      winParam.parent = parentWindow;
      winParam.modal  = true;
    }

    var win = new electron.BrowserWindow(winParam);
    var param:IWindowInfo = {panelId:elementName, windowId:win.id, browserWindow:win, loaded:false, option:option};

    this.push(param);
    this.registWindow( param );

    win.loadURL(fileName);      

    // Open the DevTools.
    if( process.env.NODE_ENV == "dev" ){
      win.webContents.openDevTools();
    }

    win.webContents.setLayoutZoomLevelLimits(1,1);

    // Emitted when the window is open.
    win.webContents.on('did-finish-load', () => {
      // don't use zoom
      win.webContents.setZoomFactor(1);
      win.webContents.setVisualZoomLevelLimits(1, 1);
      win.webContents.setLayoutZoomLevelLimits(0, 0);

      this.onLoadedWindow(win);
    })
    // Emitted when the window is closed.
    win.on('closed', () => {
      this.removeWindow(win);
      win = null;
    })

    return win;
  }  

  /**
   * 引接モニターを探す。
   */
  private getSideMoniter(displays, target){        
    var result = {left:null, top:null, right:null, bottom:null};
    var otherMonitor = displays.filter(d=>d!=target);

    for(let j=0; j < otherMonitor.length; j++){
      let omt = otherMonitor[j];

      // 左モニター
      if( omt.bounds.x + omt.bounds.width == target.bounds.x ){
        result.left = omt;
      }
      // 右モニター
      if( omt.bounds.x == target.bounds.x + target.bounds.width ){
        result.right = omt;
      }
      // 上モニター
      if( omt.bounds.y + omt.bounds.height == target.bounds.y ){
        result.top = omt;
      }
      // 下モニター
      if( omt.bounds.y == target.bounds.y + target.bounds.height ){
        result.bottom = omt;
      }      
    }

    return result;
  }

  /**
   * マルチモニターの各scaleFactorを計算・画面位置を補正する。
   */
  private adjustMonitorPosition( pos:{left:number, top:number}){
    let displays = electron.screen.getAllDisplays();
    
    for( let i=0; i < displays.length; i++ ){
      let target = displays[i];
      let bound = target.workArea;

      // 表示されるモニターを検索
      if(pos.left >= bound.x && pos.left <= bound.x + bound.width && 
        pos.top >= bound.y && pos.top <= bound.y + bound.height ){
        
        let sideMonitor = this.getSideMoniter(displays, target);
        let origin={x:0, y:0};

        let hgt = sideMonitor.left?sideMonitor.left.bounds.height:sideMonitor.right?sideMonitor.right.bounds.height:-1;
        if((hgt > 0 && target.bounds.height + target.bounds.y != hgt) || target.scaleFactor == 1){
          origin.y = target.bounds.y;
        }
        let wdt = sideMonitor.top?sideMonitor.top.bounds.width:sideMonitor.bottom?sideMonitor.bottom.bounds.width:-1;
        if(wdt > 0 && target.bounds.width + target.bounds.x != wdt){
          origin.x = target.bounds.x;
        }

        // 左右モニター
        if(target.bounds.x > 0){
          if( sideMonitor.left ){
            origin.x = sideMonitor.left.bounds.x + sideMonitor.left.bounds.width;
          }
          pos.left = origin.x + Math.ceil((pos.left-target.bounds.x)*target.scaleFactor);
        }else if(target.bounds.x < 0){
          if( sideMonitor.right ){
            origin.x = sideMonitor.right.bounds.x;
          }
          pos.left = origin.x + Math.ceil((pos.left - origin.x)*target.scaleFactor);
        }
        
        // 上下モニター
        if(target.bounds.y > 0){
          if( sideMonitor.top ){
            origin.y = sideMonitor.top.bounds.y + sideMonitor.top.bounds.height;
          }
          pos.top = origin.y + Math.ceil((pos.top-target.bounds.y)*target.scaleFactor);
        }else if(target.bounds.y < 0){
          if( sideMonitor.bottom ){
            origin.y = sideMonitor.bottom.bounds.y;
          }
          pos.top = origin.y + Math.ceil((pos.top - origin.y)*target.scaleFactor);
        }
        return true;
      }
    }

    return false;
  }
}

/**
 * Dialog callback
 * 
 * @param id 
 * @param result 
 */
export function applyCallback(id:number,result:any){
  var helper = WindowHelper.getInstance();

  var info = helper.findWindow(id);

  if( info && info.option && info.option.callback ){
    info.option.callback.apply( null, [result] );
  }
}