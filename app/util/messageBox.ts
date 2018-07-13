
declare var appModule;

/**
 * MessageBox
 */
export class MessageBox{
  static isPopuped = false;

  static show(title:string, text:string, parent:any, popupSkip:boolean, callback:Function ){        
      // popupSkipがTRUEの場合、
      // すでにモーダルがポップアップされたいたらSKIPする。
      if(popupSkip && MessageBox.isPopuped){
          return;
      }

      var electron = ElectronHelper.electron();
      var option = {};
      
      option['type'] = 'warning';
      option['title'] = title;
      option['message'] = text;

      if(electron){
          MessageBox.isPopuped = true;
          // var win = ElectronHelper.currentWindow();
          electron.dialog.showMessageBox(parent, option, (response, checkboxChecked)=>{
              MessageBox.isPopuped = false;
              if(callback){
                  callback();
              }
          });
      }
  }
}

class ElectronHelper{
    static electron(){
        var electron;
        var target;
        
        try{
            // for rander process
            electron = (window as any).electron;
            target = electron.remote
        }catch(err){
            // for main process
            electron = require('electron');
            target = electron;
        }

        return electron;
    }

    static currentWindow(){
        var electron;
        var win;

        try{
            // for rander process
            electron = (window as any).electron;
            win = electron.remote.getCurrentWindow();
        }catch(err){
            win = appModule.getCurrentWindow();
        }
        return win;
    }
}
