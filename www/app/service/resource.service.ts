/**
 * 
 * Resource Service
 * 
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { IConfigSetting, IConfigComm, IConfigAlert, IConfigOrderSettings, 
         IConfigOrderProductItem,IConfigDisplaySettings } from '../core/configinterface';
import { IPC_RESOURCE_QUERY_ENVIRONMENT, IPC_RESOURCE_QUERY_SPEEDORDER,
         IPC_RESOURCE_QUERY_CLIENTCFG } from '../../../common/commonApp';
import { IEnvironment } from '../../../common/interface';
import {LocalStorage} from '../util/utils';

import * as BusinessConst from '../const/businessConst';
import * as commonApp from "../../../common/commonApp";

const electron = (window as any).electron;

//-----------------------------------------------------------------------------
// SERVICE : Resource Service
// ----------------------------------------------------------------------------
@Injectable()
export class ResourceService {
  // 設定
  private _config:{
    common:IConfigComm,
    setting:IConfigSetting
  }={common:{},setting:{}};

  // 環境
  public environment:IEnvironment={};

  // 設定情報更新アラート
  private _changeConfigEvent = new Subject<any>();

  private rateListTabTypeSelected = {tabType:-1,watchType:0};
  private infomationSelected = {informationListForAllIndx:null,informationListForClientIndx:null};
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------	
  constructor(){
    this.initEnvironment();

    this.initConfig();

    // listen update setting event from another module
    if(electron){
      electron.ipcRenderer.on( commonApp.IPC_RESOURCE_UPDATE_SETTING, (event, arg) => {
        this._config.setting = arg;
        this._changeConfigEvent.next(this._config.setting);
      });
      electron.ipcRenderer.on( commonApp.IPC_RESOURCE_UPDATE_ALERT, (event, arg) => {
        this._config.setting.alert = arg;
      });
      electron.ipcRenderer.on( commonApp.IPC_RESOURCE_UPDATE_SPEEDORDER, (event, arg) => {
        this.environment.confirmHideSpeedOrderAgreement = arg;        
      });
      
  }
  }

  get config(){
    return this._config;
  }

  public onChangeConfig():Observable<IConfigSetting>{
    return this._changeConfigEvent;
  }

  //---------------------------------------------------------------------------
  // member
  //--------------------------------------------------------------------------- 
  /**
   * 設定情報更新イベントを発生させる。
   */
  public fireUpdateConfig(){
    this._changeConfigEvent.next(this._config.setting);

    // send update setting event to another module
    if(electron){
      var self = electron.remote.getCurrentWindow();
      var webs = electron.remote.webContents.getAllWebContents();

      webs.forEach(web=>{
        if(self.webContents != web){
          web.send( commonApp.IPC_RESOURCE_UPDATE_SETTING, this._config.setting);
        }
      })
    }
  }

  public fireUpdateAlertConfig(){
    // send update setting event to another module
    if(electron){
      var self = electron.remote.getCurrentWindow();
      var webs = electron.remote.webContents.getAllWebContents();

      webs.forEach(web=>{
        if(self.webContents != web){
          web.send( commonApp.IPC_RESOURCE_UPDATE_ALERT, this._config.setting.alert);
        }
      })
    }
  }

  public fireUpdateSpeedOrderAgreement(){
    // send update setting event to another module
    if(electron){
      var self = electron.remote.getCurrentWindow();
      var webs = electron.remote.webContents.getAllWebContents();

      webs.forEach(web=>{
        if(self.webContents != web){
          web.send( commonApp.IPC_RESOURCE_UPDATE_SPEEDORDER, this.environment.confirmHideSpeedOrderAgreement);
        }
      });
      electron.ipcRenderer.sendSync(IPC_RESOURCE_QUERY_SPEEDORDER, this.environment.confirmHideSpeedOrderAgreement);
    }
  }  

  public config_order(){
    return this._config.setting.order.orderSettings;
  }

  public config_orderProduct(code:string){
    var info = this._config.setting.orderProduct[code];

    return info?info:this.defaultOrderProduct();
  }

  public config_display(){
    return this._config.setting.display.displaySettings;
  }

  /**
   * スピード注文同意事項
   */
  get confirmHideSpeedOrderAgreement(){
    return this.environment.confirmHideSpeedOrderAgreement === true;
  }
  set confirmHideSpeedOrderAgreement(value:boolean){
    this.environment.confirmHideSpeedOrderAgreement = value;
    LocalStorage.setUserValue('confirmHideSpeedOrderAgreement', value);
  }

  /**
   * 自動画面レイアウト保存
   */
  get confirmHideAutoLayoutSave(){
    return this.environment.confirmHideAutoLayoutSave === true;
  }
  set confirmHideAutoLayoutSave(value:boolean){
    this.environment.confirmHideAutoLayoutSave = value;
    LocalStorage.setUserValue('confirmHideAutoLayoutSave', value);
  }

  /**
   * ウォッチリストから削除する際、モーダル表示可否（false:表示, true：非表示）
   */
  get confirmHideDeleteWatch(){
    return this.environment.confirmHideDeleteWatch === true;
  }
  set confirmHideDeleteWatch(value:boolean){
    this.environment.confirmHideDeleteWatch = value;
    LocalStorage.setUserValue('confirmHideDeleteWatch', value);
  }

  /**
   * 初期化設定
   */
  private initEnvironment(){
    // init environment
    if(electron){
      this.environment = electron.ipcRenderer.sendSync(IPC_RESOURCE_QUERY_ENVIRONMENT);

      // 
      this.environment.clientConfig = electron.ipcRenderer.sendSync(IPC_RESOURCE_QUERY_CLIENTCFG);

      // ウォッチリストから削除する際、モーダル表示可否（false:表示, true：非表示）
      this.environment.confirmHideDeleteWatch = LocalStorage.getUserValue('confirmHideDeleteWatch');
    }
  }

  /**
   * 初期化設定
   */
  public initConfig() {
    // 内部共通
    this._config.common = {
      virtualScreen:'0',    // 画面レイアウト切り替える
      // sdiNumber:'0',     //仮想画面番号
      fontSize:'1',         // 文字サイズ
      theme:'1',            // 画面テーマ
      background:'3',       // 背景イメージ
      taskBarGroup:'1',     // task-bar group button 0:false, 1:true
    };
    
    // ツール設定初期化
    this._config.setting.orderProduct = {};
    this._config.setting.order = {orderSettings:{}};
    this._config.setting.sound = {soundSettings:{}};
    this._config.setting.display = {displaySettings:{}};
    this._config.setting.chartDisplay = {chartSettings:{}};
    this._config.setting.chartColor = {chartColorSettings:{}};
    this._config.setting.chartTech = {favItem:{},display:{},parameters:{}};
  }

  /**
   * 初期画面レイアウト
   */
  public defaultLayout(){
    if(electron){
      var ipc  = electron.remote.require('./main');

      return ipc.FileUtil.loadJSONSync('defaultLayout.json');
    }

    return null;
  }

  /**
   * デフォルト：注文設定
   */
  public defaultOrderProduct():IConfigOrderProductItem{
    return {
      initOrderQuantity:'1',			      // 取引数量（注文画面）
      initAllowSlippage:true,           // 許容スリッページ（on：チェック、off：解除）（注文画面）
      initAllowSlippageValue:'0',       // 許容スリッページ値（注文画面）
      initTrailValue:'50',              // トレール幅（注文画面）
      initSpeedOrderQuantity:'1',       // 取引数量（スピード注文画面）
      speedOrderAllowSlippage:true,     // 許容スリッページ（on：チェック、off：解除）（スピード注文画面）
      speedOrderAllowSlippageValue:'0'  // 許容スリッページ値（スピード注文画面）
    };
  }

  /**
   * デフォルト：サウンド設定
   */
  public defaultSoundSetting() {
    // #2537
    try {
      var ipc  = electron.remote.require('./main');
      var appModule = ipc.didGetAppModule();
      return appModule.business.cache.defaultSoundSetting();
    }
    catch(e) {
      console.error(e);
    }
    //  return {
    //   executionSound:'on',			                                  // 約定音（on：チェック、off：解除）
    //   executionSoundFolder:'',                                    // 約定音格納フォルダ
    //   executionSoundFile:'ベル01.mp3',                             // 約定音ファイル名
    //   alertSound:'on',                                            // アラート音（on：チェック、off：解除）
    //   alertSoundFolder:'',                                        // アラート音格納フォルダ
    //   alertSoundFile:'お知らせ01.mp3'                              // アラート音ファイル名          
    // };
  }

  /**
   * デフォルト：チャート色設定
   */
  public defaultChartColorSetting(){
    // #2537
    try {
      var ipc  = electron.remote.require('./main');
      var appModule = ipc.didGetAppModule();
      return appModule.business.cache.defaultChartColorSetting();
    }
    catch(e) {
      console.error(e);
    }
    
    // return {
    //   gridColor:'#535466',                                        // グリッド色
    //   positiveLineFillColor:'#e02424',                            // 陽線　塗りつぶし色
    //   //positiveLineFrameColor:'#f00',                            // 陽線　枠線色
    //   hiddenLineFillColor:'#13a5c2',                              // 陰線　塗りつぶし色
    //   //hiddenLineFrameColor:'#f00',                              // 陰線　枠線色
    //   sameColor:false                                             // 塗りつぶし色と枠線色は同色にする（on：チェック、off：解除）
    // }
  }

  /**
   * デフォルト：チャートテクニカル設定：#2537
   */
  public defaultChartTechnicalSetting() {
    try {
      var ipc  = electron.remote.require('./main');
      var appModule = ipc.didGetAppModule();
      return appModule.business.cache.defaultChartTechnicalSetting();
    }
    catch(e) {

    }
  }

  public setRateListTabTypeSelected(tab:any){
    this.rateListTabTypeSelected = tab;
  }

  public getRateListTabTypeSelected():any{
    return this.rateListTabTypeSelected;
  }

  public setInfomationSelected(info:any){
    this.infomationSelected = info;
  }

  public getInfomationSelected(){
    return this.infomationSelected;
  }

}