/**
 * load mockup file
 * 
 * @param url 
 */
import * as fs from 'fs';
import * as path from 'path';
import * as url  from 'url';
import * as electron from 'electron';
import { Subject } from 'rxjs/Subject';

const PREFIX_APPID = "com.click-sec.HatchukunCFD";
const PATH_COMPANY = "CLICK-SEC";
const PATH_PRODUCT = "HatchukunCFD";
const PATH_LOCAL   = "user";
const PATH_LOGS    = "logs";

export class FileUtil{
  static _appId = undefined;

  constructor(){
  }

  /**
   * 
   * @param file 
   */
  static loadJSONSync( file:string ){
    // var rootdir = electron.app.getAppPath();
    var path = `${__dirname}/../app/assets/json/${file}`;
    var result;

    // read file.
    try{
      var data = fs.readFileSync(path);
      var str  = data.toString('utf8');

      result = JSON.parse(str);
    }catch(e){
      return null;
    }

    return result;
  }

  /**
   * 注意：RanderProcessでは非同期ができない。
   */
  static loadJSON( file:string ){
    // var rootdir = electron.app.getAppPath();
    var path = `${__dirname}/../app/assets/json/${file}`;
    var subj = new Subject<any>();

    // read file.
    fs.readFile(path, (err, data)=>{
      if( err ){
        subj.error(err);
      }else{
        try{
          var str = data.toString('utf8');
          var json = JSON.parse(str);
          subj.next(json);
        }catch(e){
          subj.error(e);
        }
      }
    })

    return subj;
  }

  /**
   * 
   * @param file 
   */
  public static parse(file){
    var val = path.parse(file);
    return val;
  }

  /**
   * file:// style path.
   */
  public static getRootDir(){
    var dir = path.resolve(__dirname);
    var idx = dir.lastIndexOf(path.sep);

    dir = dir.substr(0, idx);
    
    return dir;
  }

  /**
   * installed path.
   */
  public static getAppDir(){
    let root = electron.app.getPath('exe')
    
    if (process.platform === 'darwin') {
      root = path.resolve(root + '/../..');
    }else{
      let ps = FileUtil.parse(root);
      root = ps.dir;
    }

    return root;
  }

  /**
   * 
   */
  public static dirSeperator(){
    return path.sep;
  }

  /**
   * 
   * @param dir 
   */
  static existsSync(dir:string){
    return fs.existsSync(dir);
  }

  /**
   * ユーザー 保存 path.
   * 
   * WIN -> C:\Users\【ユーザー名】\AppData\Roaming
   * MAC -> /Users/【ユーザー名】/Library/Application Support
   */
  static createLocalDir(){
    try { 
      // create {APPDATA} root dir.
      let company = FileUtil.getCompanyPath();
      if( !fs.existsSync(company) ){
        fs.mkdirSync(company); 
      }

      let product = FileUtil.getProductPath();
      if( !fs.existsSync(product) ){
        fs.mkdirSync(product); 
      }
    }catch(e) { 
      console.log('create dir error.', e); 
    }
  }

  static createDir(path:string){
    try { 
      // create dir.
      if( !fs.existsSync(path) ){
        fs.mkdirSync(path); 
      }
    }
    catch(e) { 
      console.log('create dir error.', e); 
    }
  }    

  /**
   * company path.
   */
  static getCompanyPath(){
    return `${electron.app.getPath('appData')}${path.sep}${PATH_COMPANY}`;
  }

  /**
   * product path.
   */
  static getProductPath(){
    let prod = `${PATH_PRODUCT}_${process.env.NODE_ENV.split(':')[0]}`;
    return `${FileUtil.getCompanyPath()}${path.sep}${prod}`;
  }  

  /**
   * user path.
   */
  static getUserPath(){
    return `${FileUtil.getProductPath()}${path.sep}${PATH_LOCAL}`;
  } 

  /**
   * log path.
   */
  static getLogPath(){
    return `${FileUtil.getProductPath()}${path.sep}${PATH_LOGS}`;
  }

  /**
   * appId.
   */
  static getAppId(){
    let appid;

    if( FileUtil._appId != undefined ){
      appid = FileUtil._appId;
    }else{
      let mode = process.env.NODE_ENV;
      mode = mode.replace('prod', 'real');
      mode = mode.replace(':', '_');
      
      appid = FileUtil._appId = `${PREFIX_APPID}_${mode}`;
    }

    return appid;
  }
}