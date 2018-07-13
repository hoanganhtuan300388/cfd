/**
 * 
 * AppModule
 * 
 */
import * as electron from 'electron';

import {BusinessHelper} from './helper/businessHelper';
import {WindowHelper} from './helper/windowHelper';
import {LoginHelper} from './helper/loginHelper';
import {StorageHelper} from './helper/storageHelper';

import {IEnvironment} from '../common/interface';
import {IPC_RESOURCE_QUERY_ENVIRONMENT, PREFIX_USER_AGENT, IPC_RESOURCE_QUERY_SPEEDORDER} from '../common/commonApp';
import {BusinessApi} from '../common/businessApi';
import {AppMenu} from '../common/menu';
import {Logger} from './util/logger';
import {CommonConfig} from '../common/commonConfig';
import {MessageBox} from './util/messageBox';
import {Messages} from './../common/message';

const packageInfo = require('../package.json');

const filter = {
  urls: ['*://*.*/*']
}

//-----------------------------------------------------------------------------
// SERVICE : WindowHelper
// ----------------------------------------------------------------------------
export class AppModule{
  private _mainWindow;
  private environment:IEnvironment = {};

  // 再起動中フラグ
  private _restart  = false;

  public business = new BusinessHelper();
  public login = new LoginHelper();

  //---------------------------------------------------------------------------
  //  constructor & property
  // --------------------------------------------------------------------------	
  constructor(){
    this.traceSystemLog();

    this.init();
  }

  get mainWindow(){
    return this._mainWindow;
  }
  set mainWindow(val){
    this._mainWindow = val;
  }  

 	//---------------------------------------------------------------------------
  // member
  //--------------------------------------------------------------------------- 
  private traceSystemLog(){
    var ver = electron.app.getVersion();
    
    Logger.system.info(`app current version(${packageInfo.version})`);
    Logger.system.info(`AppModule platform[${process.platform}]`);
    Logger.system.info(`AppModule mode[${process.env.NODE_ENV}]`);
  }

  /**
   * init
   */
  public init(){

    this.initListen();
    this.initMenu();
    this.initEnvironmnet();
    
    // check server status.
    this.checkServerStatus();

    // run application
    this.runApp();
  }

  /**
   * electron event listener
   */
  private initListen(){
    // Handle the error
    process.on('uncaughtException', (error)=>{
      Logger.system.error(`uncaughtException.\n${error.stack}`);

      MessageBox.show(Messages.STR_0003, Messages.ERR_0021, null, false, ()=>{        
        setTimeout(()=>this.quiteApp(), 100);
      });
    });

    // response environment query.
    electron.ipcMain.on(IPC_RESOURCE_QUERY_ENVIRONMENT, (event, arg) => {
      event.returnValue = this.environment;
    })

    electron.ipcMain.on(IPC_RESOURCE_QUERY_SPEEDORDER, (event, arg) => {
      this.environment.confirmHideSpeedOrderAgreement = arg;
      event.returnValue = this.environment.confirmHideSpeedOrderAgreement;
    })    

    // set user-Agent
    electron.session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
      details.requestHeaders['User-Agent'] = PREFIX_USER_AGENT + process.platform;
      callback({cancel: false, requestHeaders: details.requestHeaders})
    })

    // if window all closed. 
    electron.app.on('window-all-closed', () => {
      this.quiteApp();
    })    
  }

  /**
   * Init Environmnet
   */
  private initEnvironmnet(){
    this.environment.debug = true;
    this.environment.version = packageInfo.version;

    if(process.env.NODE_ENV.indexOf("demo") >= 0 ){         // デモ用
      this.environment.demoTrade = true;
    }else{
      this.environment.demoTrade = false;
    }
  }

  /**
   * Init Environmnet
   */
  private initUser(){
    this.environment.confirmHideAutoLayoutSave = StorageHelper.getUserValue('confirmHideAutoLayoutSave');
    this.environment.confirmHideSpeedOrderAgreement = StorageHelper.getUserValue('confirmHideSpeedOrderAgreement');
  }

  /**
   * Init Menu
   */
  private initMenu(){
    if (process.platform === 'darwin') {
      // これがないとMACでのコピペが出来ない。
      electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(AppMenu));
    }    
  }

  // clear
  private clear(){
    if(this.business){
      this.business.clear();
    }
    this.business = new BusinessHelper();

    // 強制終了
    setTimeout(()=>{
      let wins = WindowHelper.getInstance().getWindows();
      let cpy = wins.map(w=>w);

      cpy.forEach(win=>{
        // ログイン画面は残す
        if( win.panelId != "03010200" ){
          win.browserWindow.destroy();
        }
      })
    }, 100);
  }

  /**
   * 
   */
  private checkServerStatus(){
    // check server status.
    this.business.getClientConfig().subscribe(
      val=>{},
      err=>{
        // client-config.json error
        setTimeout(()=>this.quiteApp(), 100);
      }
    );    
  }

  /**
   * system errorによる再起動
   */
  public restart(){
    this._restart = true;

    this.clear();

    this.runApp();    
  }

  /**
   * start app
   */
  public runApp(){
    this.business.init( );
    
    // for login dialog
    var param  = {
      userId:     '', 
      password:   '', 
      checkFlg:   StorageHelper.getRootValue('saveUserId'), 
      version:    packageInfo.version, 
      demoTrade:  this.environment.demoTrade
    };
    
    if(param.checkFlg){
      param.userId = StorageHelper.getRootValue('loginUserId');
    }

    // try login
    this.login.approach(param).subscribe(
      val=>{
        // session id & jsession id
        this.environment.session = val;

        // save local value
        StorageHelper.setRootValue('saveUserId', this.login.saveUserId);
        StorageHelper.setRootValue('loginUserId', val.userId);

        // connect web socket
        this.business.connect(val.jsessionId).subscribe(val=>{},
          err=>{
            Logger.system.warn('business connection fail', err);
          },
          // complete
          ()=>{
            if(this.business.readyStatus){
              // run application
              this.readyMainProcess();

              // 初期データロード完了
              this.login.modal.close();
              this.login.modal = null;
            }
        });
      },
      err=>{
        // close application.
        this.quiteApp();
      }
    );
  }

  /**
   * ログイン成功後、メイン起動
   */
  private readyMainProcess(){
    // ローカル保存場所準備
    StorageHelper.initUser(this.environment.session.userId);

    // ユーザー初期環境設定
    this.initUser();

    // create main window
    this.openMainWindow();
  }

  /**
   * open main window.
   */
  private openMainWindow(){
    var helper = WindowHelper.getInstance();

    this.mainWindow = helper.openWindow(null, null, null, 1280,768);

    this.mainWindow.on('closed', () => {
      this.mainWindow  = null;
      
      Logger.system.info(`main window closed.`);

      // system errorによる再起動ではない場合は、アプリ終了。
      if(!this._restart){
        this.quiteApp();
      }
      this._restart = false;
    })
  }

  public quiteApp(){
    // if(this.login.checker)
    //   this.login.checker.close();
    electron.app.quit();
  }
}