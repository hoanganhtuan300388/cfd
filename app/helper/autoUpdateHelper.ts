/**
 * 
 * autoUpdateHelper
 * 
 */
// import * as electron from 'electron';
import {WindowHelper} from '../helper/windowHelper';
import {autoUpdater} from 'electron-updater';
import {EventEmitter} from 'events';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {Logger} from '../util/logger';

// VERSION UPDATE
const version = require('../../package.json').version;
const platform = process.platform;

//-----------------------------------------------------------------------------
// SERVICE : AutoUpdateHelper
// ----------------------------------------------------------------------------
export class AutoUpdateHelper extends EventEmitter {
  private subject = new Subject<any>();
  private modal;

  // --------------------------------------------------------------------------
  //  constructor & property
  // --------------------------------------------------------------------------	
  constructor(){
    super()

    this.listen();
    
    // autoUpdater.logger = require("electron-log");
  }

  /**
   * 
   */
  public checkUpdate(url:string){
    let env  = process.env.NODE_ENV.split(':')[0];
    let path = `${url}?v=${version}&p=${platform}&e=${env=='prod'?'real':env}`;

    Logger.system.info(`[VER-UPDATE] check new version(${path})`);

    autoUpdater.setFeedURL({
      provider: 'generic',
      url: path
    });

    autoUpdater.checkForUpdates();

    return this.subject;
  }

  /**
   * 
   */
  private listen(){
    var self = this;

    autoUpdater.on('update-available', function () {
      Logger.system.info(`[VER-UPDATE] detected a new version.`);

      self.emit('notice', 'detected a new version.' );
    })

    autoUpdater.on('checking-for-update', function () {
      Logger.system.info(`[VER-UPDATE] checking for update`);
    })

    autoUpdater.on('download-progress', function (transfer) {
      /*
        transfer = {
          bytesPerSecond:number,
          percent:number,
          transferred:number,
          total:number,
          delta:number
        }
      */
      Logger.system.debug(`[VER-UPDATE] download-progress(${transfer.percent})`);

      self.emit('notice', `最新バージョンへ更新中... (${parseInt(transfer.percent)}%)` );
    })

    autoUpdater.on('error', function (error) {
      Logger.system.info(`[VER-UPDATE] module update error(${error})`);

      // self.closeModal();
      self.subject.next('ok');      
    })
    
    autoUpdater.on('update-downloaded', function (event) {
      Logger.system.info(`[VER-UPDATE] version download complete`);

      self.emit('notice', `installing a new version` );

      autoUpdater.quitAndInstall(false, true);
    })

    autoUpdater.on('update-not-available', function () {
      Logger.system.info(`[VER-UPDATE] not found new version`);
      self.subject.next('ok');
    })  
  }

  /**
   * 
   */
  public close(){
    autoUpdater.removeAllListeners();
  }
}