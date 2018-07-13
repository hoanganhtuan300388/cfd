/**
 * 
 * Login処理 クラス
 * 
 */
import * as electron from 'electron';
import {WindowHelper} from '../helper/windowHelper';
import {HttpHelper} from '../helper/httpHelper';
import {BusinessApi, ERROR_CODE} from '../../common/businessApi';
import {AutoUpdateHelper} from '../helper/autoUpdateHelper';
import {StorageHelper} from './storageHelper';

import {Observable } from 'rxjs/Observable';
import {Subject } from 'rxjs/Subject';
import {ISessionValue } from '../../common/interface'
import {CommonConfig} from '../../common/commonConfig';
import {Messages} from '../../common/message';
import {MessageBox} from '../util/messageBox';
import {Logger} from '../util/logger';

import * as commonApp from '../../common/commonApp';
import * as URL from 'url';
// var url = require("url");

//-----------------------------------------------------------------------------
// SERVICE : LoginHelper
// ----------------------------------------------------------------------------
export class LoginHelper{
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------  
  private _subject;
  private _isDemo = false;
  public modal = null;
  public saveUserId:false;

  //---------------------------------------------------------------------------
  //  constructor
  // --------------------------------------------------------------------------	
  constructor(){
    this._isDemo = (process.env.NODE_ENV.indexOf("demo") >= 0);
  }

 	//---------------------------------------------------------------------------
  // member
  //--------------------------------------------------------------------------- 
  public approach(param:any):Observable<ISessionValue>{

    this._subject = new Subject<ISessionValue>();
    
    this.showModal(param);

    return this._subject;
  }

  private loginCancel(){
    if( this.modal ){
      this.modal.close();
    }

    if(this._subject){
      this._subject.error(null);
    }

  }
  /**
   * 
   */
  private showModal(param:any){
    var helper = WindowHelper.getInstance();

    Logger.system.debug( `[LOGIN] login dialog count. ${helper.AppCounter}`);
    
    // #3137 ログイン画面起動カウント（Lodding中のアニメーション）
    StorageHelper.setRootValue('appRunCount', ++helper.AppCounter);

    this.modal = helper.openWindow('03010200', null, null, 480, 400, {params:param,
     callback:(result)=>{
      // result login dialog
      if( result.button == 'LOGIN'){
        this.login(result.user, result.pwd);

        // save user id & pwd
        this.saveUserId = result.saveFlag;

      } else if( result.button == 'CANCEL'){
        Logger.system.info( `[LOGIN] login dialog cancel.`);
        this.loginCancel();
      }
    }});

    // ready login dialog event
    this.modal.webContents.once('did-finish-load', () => {
      this.readyLoginDlg();
    })

    // close dialog event
    this.modal.once('closed', () => {
      this.modal  = null;
    })
  }

  /**
   * auto updater
   */
  private autoUpdate(){
    var updater = new AutoUpdateHelper();

    Logger.system.info( `[LOGIN] run auto Updater.`);
    
    var data = {state:'notice', message:'check for a new version.'};
    this.sendNoticeToDlg(data);

    updater.on('notice', (msg)=>{
      var data = {state:'notice', message:msg};

      this.sendNoticeToDlg(data);
    });

    // download event.
    // updater.on('download-progress', (transfer)=>{
    //   var data = {state:'progress', transfer:transfer};

    //   this.sendNoticeToDlg(data);
    // });

    // versin check
    updater.checkUpdate(CommonConfig.service.vUpdateUrl).subscribe(val=>{
      Logger.system.info( `[LOGIN] finished auto Updater.`);

      // set next step for login
      this.sendNoticeToDlg({state:'ok'});
    })
  }

  private sendNoticeToDlg( data:any ){
    if(this.modal && this.modal.webContents){
      this.modal.webContents.send(commonApp.IPC_AUTOUPDATE_NOTICE, data);
    }    
  }

  private readyLoginDlg(){
    // check duplicated app.
    if(this.isInvalidInstance()){
      MessageBox.show(Messages.STR_0003, Messages.ERR_0020, this.modal, true, ()=>{        
        Logger.system.warn( `[LOGIN] duplicated app.`);
        setTimeout(()=>{this.loginCancel()}, 0); 
      });
    }else{
      // run auto updater
      this.autoUpdate();
    }
  }

  /**
   * check duplicated app.
   */
  private isInvalidInstance(){
    return electron.app.makeSingleInstance((c,w) => {});
  }

  /**
   * LOGIN
   */
  public login(user:string, pwd:string){
    var req = new HttpHelper();
    var jsessionId;
    var sessionId;
    let data = {LoginForm:'Login', j_username:user, j_password:pwd, s:'05', p:'06'};

    Logger.system.info( `[LOGIN] start login. (${CommonConfig.service.loginUrl})`);

    //--------------
    // 1. ログインサーバー get sessionId
    req.post_redirect(CommonConfig.service.loginUrl, data).subscribe((val)=>{
      sessionId = this.findSessionId(val['set-cookie']);
      Logger.system.debug( `[LOGIN] get session id. (${sessionId})`);

      if( sessionId || this._isDemo ){
        let url_fst = val.location[0];

        //--------------
        // 2. リダイレクト先 ① get jsessionid
        var req_fst = new HttpHelper();

        Logger.system.debug( `[LOGIN] first redirect url. (${url_fst})`);

        req_fst.post(url_fst, null, 'POST').subscribe(res=>{
          if(res){
            let url_snd:string = res.location[0];
            let page = url_snd.split(';');

            if( page[1] != null ){
              var str = page[1];
              var qry = this.QueryString(str);
            
              jsessionId = qry['jsessionid'];

              Logger.system.debug( `[LOGIN] get jsessionid. (${jsessionId})`);
              
              //--------------
              // 3. リダイレクト先 ② ログイン完了処理
              var req_snd = new HttpHelper();
              let sevr = URL.parse(CommonConfig.service.webApiUrl);
              let host = `${sevr.protocol}//${sevr.host}${url_snd}`;

              Logger.system.debug( `[LOGIN] second redirect url. (${host})`);

              req_snd.post(host, {jsessionid:jsessionId}, 'POST').subscribe(
                val=>{
                  if(val && val.status == "0"){
                    this.onLogin( user, sessionId, jsessionId, null );
                  }else{
                    this.onLogin( user, null, null, {state:'ERROR', message: Messages.ERR_0017} );  
                  }
                },
                err=>{
                  this.onLogin( user, null, null, {state:'ERROR', message: Messages.ERR_0017} );
                }
              );
            }else{
              // failed
              this.onLogin( user, null, null, {state:'ERROR', message: Messages.ERR_0017} );
            }
          }
        });
      }else{
        // failed
        this.onLogin( user, null, null, {state:'ERROR', message: Messages.ERR_0017} );
      }
    },
    // error
    (err)=>{
      var data={state:'ERROR', message:''};
      if(err && err.loginResponse && err.loginResponse.message){
        data.message = err.loginResponse.message[0];
      }else if(err && err.error == ERROR_CODE.NETWORK){
        data.message = Messages.ERR_0002;
      }else{
        data.message = Messages.ERR_0017;
      }
      this.onLogin( user, null, null, data );
    });

  }

  /**
   * onLogin結果
   * 
   * @param sessionId 
   * @param jsessionId 
   */
  public onLogin( user:string, sessionId:string, jsessionId:string, error:any ){
    if( (this._isDemo || sessionId) && jsessionId ){
      // success login.
      Logger.system.info('success login');
      this._subject.next( {userId:user, sessionId:sessionId, jsessionId:jsessionId} );
    }else{
      // failed login.
      Logger.system.warn('failed login');

      this.sendMessage(error);
    }
  }

  /**
   * send message to login dialog
   */
  public sendMessage(msg){
    this.modal.webContents.send(commonApp.IPC_LOGINHELP_NOTICE, msg);
  }

  /**
   * find SessionId
   * 
   * @param arr 
   */
  private findSessionId(arr){
    if( arr ){
      for( var i=0; i < arr.length; i++ ){
        var qry = this.QueryString(arr[i]);
        if( qry['sessionId'] ){
          var sessionId = qry['sessionId'];
          let idx = sessionId.indexOf(';');
          if( idx ){
            sessionId = sessionId.substr(0, idx);
          }
          return sessionId;
        }
      }
    }

    return null;
  }

  /**
   * parsing QueryString
   * 
   * @param query 
   */
  private QueryString(query:string){
    var query_string = {};
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
      if (typeof query_string[pair[0]] === "undefined") {
        query_string[pair[0]] = decodeURIComponent(pair[1]);
      } else if (typeof query_string[pair[0]] === "string") {
        var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
        query_string[pair[0]] = arr;
      } else {
        query_string[pair[0]].push(decodeURIComponent(pair[1]));
      }
    } 
    return query_string;      
  } 
  
}