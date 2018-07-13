/**
 * 
 * MessageBox
 * 
 * https://electron.atom.io/docs/api/dialog/
 * 
 */
const electron = (window as any).electron;

//-----------------------------------------------------------------------------
// MessageBox
// ----------------------------------------------------------------------------
export class MessageBox{

  // show-box
  static showBox(option:any, callback?:any){
    let win = electron.remote.getCurrentWindow();

    if(electron){
      electron.remote.dialog.showMessageBox(win, option, (response, checkboxChecked)=>{
        if(callback){
          callback(response,checkboxChecked);
        }
      });
    }
  }

  /**
   * question
   * 
   * @param option 
   * @param callback 
   */
  static question(option:any, callback?:any){

    option['type'] = 'info';
    // electronのバグ？ 実際にMacとWinボタンの表示順が逆。
    option['buttons'] = option.buttons?option.buttons:['キャンセル','OK'];
    option['cancelId'] = option.cancelId?option.cancelId:0; 
    option['defaultId'] = option.defaultId?option.defaultId:1; 
    option['noLink'] = true;
    
    this.showBox(option, callback);
  }

  /**
   * info
   * 
   * @param option 
   * @param callback 
   */
  static info(option:any, callback?:any){
    option['type'] = 'info';
    option['buttons'] = option.buttons?option.buttons:['OK'];
    option['cancelId'] = option.cancelId?option.cancelId:0; 

    this.showBox(option, callback);
  }

  /**
   * error
   * 
   * @param option 
   * @param callback 
   */
  static error(option:any, callback?:any){
    option['type'] = 'error';
    option['buttons'] = option.buttons?option.buttons:['OK'];
    
    this.showBox(option, callback);
  }  

  /**
   * warning
   * 
   * @param option 
   * @param callback 
   */
  static warning(option:any, callback?:any){
    option['type'] = 'warning';
    option['buttons'] = option.buttons?option.buttons:['OK'];

    this.showBox(option, callback);
  }

  static notify(title:string,body:string,icon?){
    let image = electron.remote.nativeImage.createFromPath(icon);
    let ipc  = electron.remote.require('./main');
    let appId = ipc.FileUtil.getAppId();
    electron.remote.app.setAppUserModelId(appId);
    let notify = new electron.remote.Notification({
        title: title,
        body: body,
        icon: image
      });
    return notify;
  }
}