/**
 * 
 * LOG クラス
 * 
 */
import {LogConfig} from '../../common/logConfig';
import {FileUtil} from './fileUtil';
import * as LogLib from 'electron-log';

declare interface IElectronLog {
  // transports: ITransports;
  error(...params: any[]): void;
  warn(...params: any[]): void;
  info(...params: any[]): void;
  // verbose(...params: any[]): void;
  debug(...params: any[]): void;
  // silly(...params: any[]): void;
  // log(...params: any[]): void;
}

//-----------------------------------------------------------------------------
// SERVICE : Logger
// ----------------------------------------------------------------------------
export class Logger{
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------  
  private _system;
  private _event;
  private _access;
  private _config;

  static _instance;

  //---------------------------------------------------------------------------
  // Protected constructor
  // --------------------------------------------------------------------------	
  protected constructor(){
    this.init();
  }

 	//---------------------------------------------------------------------------
  // member
  //--------------------------------------------------------------------------- 
  private init(){
    this.createLogDir();

    this._config = LogConfig;
    
    this._system = this.getLogger('system');
    // this._access = this.getLogger('access');
    // this._event  = this.getLogger('event');
  }

  private createLogDir(){
    FileUtil.createLocalDir();
    FileUtil.createDir(FileUtil.getLogPath());
  }

  private getLogger(target:string){
    let log = LogLib;
    let cfg = this._config[target];

    log.transports.file.level = cfg.level;
    log.transports.console.level = cfg.level;

    // Date: {y},{m},{d},{h},{i},{s},{ms} 
    log.transports.file.format = cfg.format;
    
    // Set approximate maximum log size in bytes. When it exceeds,
    // the archived log will be saved as the log.old.log file
    log.transports.file.maxSize = cfg.maxSize;
    
    // Write to this file, must be set before first logging
    log.transports.file.file = `${FileUtil.getLogPath()}${FileUtil.dirSeperator()}${cfg.filename}`;
    
    // fs.createWriteStream options, must be set before first logging
    // you can find more information at
    // https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options
    log.transports.file.streamConfig = { flags: cfg.streamFlag };
    
    // set existed file stream
    // log.transports.file.stream = fs.createWriteStream('log.txt');
    return log;
  }

  static getInstance():Logger{
    let inst = Logger._instance;

    if(inst == null){
      inst = new Logger();
      Logger._instance = inst;
    }

    return inst;
  }

  static get system():IElectronLog{
    let log = Logger.getInstance();
    return log._system;
  }
  // static get event(){
  //   let log = Logger.getInstance();
  //   return log._event;
  // }
  // static get access(){
  //   let log = Logger.getInstance();
  //   return log._access;
  // }
}
