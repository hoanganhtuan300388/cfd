/**
 * 
 * Window Service
 * 
 */
import { Injectable }  from '@angular/core';
import { Observable }  from 'rxjs/Observable';
import { Subject }     from 'rxjs/Subject';
import { CommonConst } from '../core/common';
import { ResourceService } from './resource.service';
import { Deferred } from "../util/deferred";
import { IWindowInfo, IWindowOption} from "../../../common/interface";

const electron = (window as any).electron;

//-----------------------------------------------------------------------------
// SERVICE : Window Service
// ----------------------------------------------------------------------------
@Injectable()
export class WindowService {
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------	
  constructor(private resource:ResourceService) {
    // this.listening();
  }

  //---------------------------------------------------------------------------
  // member
  //--------------------------------------------------------------------------- 

  /**
   * MDI内部画面を外にポップアップさせる。
   * 
   * @param panelId 
   */
  public exportWindow( scrId:string, x:number, y:number, width:number, height:number, param?:any ){
    if( !electron )
      return null;

    var helper = electron.remote.require('./main');
    var opt:IWindowOption = {params:param};

    if( helper ){
      var win = helper.WindowHelper.getInstance();
      return win.exportWindow( scrId, x, y, width, height, opt );
    }else {
      console.error('windows.service::exportWindow failed.');
    }

    return null;
  }

  /**
   * 外にポップアップされた画面をMDI内部に移動させる。
   * 
   * @param panelId 
   */
  public importWindow( panelId:string ){

  }

  /**
   *  get opend windows list.
   */
  public getOpenWindows():IWindowInfo[]{
    if( !electron )
    return;

    var hlp  = electron.remote.require('./main');
    var whp  = hlp.WindowHelper.getInstance();
    var wins = whp.getWindows();

    return wins;
  }

  public findWindow( id:number ):IWindowInfo{
    if( !electron )
    return;

    var hlp  = electron.remote.require('./main');
    var whp  = hlp.WindowHelper.getInstance();
    var inf  = whp.findWindow(id);

    return inf;
  }
 
  /**
   * open new url in new browser.
   * 
   * @param href 
   */
  public openBrowser(href:string){
    if(electron){
      const shell = electron.shell;
      shell.openExternal(href);
    }
  }
  
  /**
   * open file select window.
   * 
   * @param type
   */
  public openSelectFile(type:string, defaultDir?:string){
    let deferred = new Deferred<any>();

    if (electron){
      const remote = electron.remote;
      var parent = remote.getCurrentWindow();
      var helper = remote.require('./main');
      
      remote.dialog.showOpenDialog(parent, {
        defaultPath: defaultDir,
        filters: [{ name: "type", extensions: [type] }]},
        (fileNames) => {
          if(fileNames){
            var file = fileNames[0];
            var path = helper.FileUtil.parse(file);
            path.file = fileNames[0];
            deferred.next(path);
          }else{
            deferred.next(null);
          }
      });
    }
    return deferred;
  }
}
