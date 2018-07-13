/**
 *
 * ログイン
 *
 */
import { Component, ElementRef, ChangeDetectorRef } from '@angular/core';
import { PanelManageService, ResourceService,
         PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips } from '../../../core/common';
import { ModalViewBase } from '../../../core/modalViewBase';
import { MessageBox } from '../../../util/utils';
import { Messages} from '../../../../../common/message';
import * as commonApp from '../../../../../common/commonApp';

const electron = (window as any).electron;
const STEP_DOWNLOAD = 1;
const STEP_LOGIN    = 2;

declare var $:any;

//-----------------------------------------------------------------------------
// COMPONENT : Scr03010200Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03010200',
  templateUrl: './scr-03010200.component.html',
  styleUrls: ['./scr-03010200.component.scss']
})
export class Scr03010200Component extends ModalViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  public user_id = '';
  public user_pwd = '';
  public isSave = false;
  public version = '';
  public isLoading:boolean = false;
  public isDemo:boolean = false;

  public message = "";
  private step = STEP_DOWNLOAD;

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public element: ElementRef,
               public resource: ResourceService,
               public changeRef:ChangeDetectorRef) {
    super( '03010200', screenMng, element, changeRef);

    this.isDemo = this.resource.environment.demoTrade;

    if (electron && electron.ipcRenderer && electron.ipcRenderer.on) {
      // login process event
      electron.ipcRenderer.on( commonApp.IPC_LOGINHELP_NOTICE, (event, arg) => {
        var state = arg.state;

        if( state == 'ERROR' ){
          MessageBox.warning({title:'ログイン', message: arg.message});

          this.isLoading = false;
          this.changeRef.detectChanges();
        }
      })

      // auto updater event.
      electron.ipcRenderer.on( commonApp.IPC_AUTOUPDATE_NOTICE, (event, arg) => {
        var state = arg.state;
         
        if(state == 'ok'){
          this.readyLogin();
        }else if(state = 'notice'){
          this.message = arg.message;

          this.updateView();
        }
      })
    }
  }

  /**
   *
   */
  ngAfterViewInit(){
    super.ngAfterViewInit();

    this.user_id = this.params.userId;
    this.user_pwd = this.params.password;
    this.isSave = this.params.checkFlg;
    this.version = this.params.version;
    this.isDemo = this.params.demoTrade;
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  public onBtnClick(button:string){
    var result;
    
    if( button == 'LOGIN'){
      // ユーザーIDは9桁の半角数字で入力してください。（ログイン名は6～42桁の半角英数字で入力してください）
      if(this.user_id.length <= 0 ){
        MessageBox.warning({title:'ログインエラー', message: Messages.ERR_0018});
        return;
      }

      // パスワードは6～10桁の半角英数字を入力してください
      if(this.user_pwd.length < 6 ){
        MessageBox.warning({title:'ログインエラー', message: Messages.ERR_0019});
        return;
      }
      
      this.isLoading = true;      
      result = {button:button, user:this.user_id, pwd:this.user_pwd, saveFlag:this.isSave};

    }else if( button == 'CANCEL'){
      result = {button:button};
    }
    this.updateView();

    this.sendDialogResult(result);    
  }

  // open web-browser
  private openUrl(url:string){
    const electron = (window as any).electron;
    if(electron){
      const shell = electron.shell;

      shell.openExternal(url);
    }
  }

  // 口座開設
  public gotoRegAccount(){
    this.openUrl(this.resource.environment.clientConfig.kouzaOpenURL);
  }
  
  // 利用規約
  public gotoCfdShop(){
    this.openUrl(this.resource.environment.clientConfig.regCfdShop);
  }

  public checkInput(type){
    if (type == "username") {
      // 不要
      // this.user_id = this.user_id.replace(/[^0-9a-z_.@-]+/ig,'');
      $(this.element.nativeElement).find(".input-username").val(this.user_id);
    } else {
      this.user_pwd = this.user_pwd.replace(/[^0-9a-z]+/ig,'');
      $(this.element.nativeElement).find(".input-password").val(this.user_pwd);
    }
  }

  private readyLogin(){
    this.step = STEP_LOGIN;

		setTimeout(()=>{
      if ($ && $.material) {
        $.material.init();
      }
    }, 10);

    this.updateView(); 
  }

  public displayLogin(){
    return this.step == STEP_LOGIN;
  }

  public onEnterLogin($event) {
    event.preventDefault();
    this.onBtnClick('LOGIN');
  }
}
