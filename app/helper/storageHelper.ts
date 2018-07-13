/**
 * 
 * StorageHelper
 * 
 */
import * as electron from 'electron';
import * as commonApp from '../../common/commonApp';
import {LocalStorage} from '../util/localStorage';
import {Logger} from '../util/logger';

//-----------------------------------------------------------------------------
// COMPONENT : StorageHelper
// ----------------------------------------------------------------------------
export class StorageHelper{
  static storage:LocalStorage;

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  protected constructor(){

  }

  static init(){
    Logger.system.info('ready StorageHelper');
    
    // get root value
    electron.ipcMain.on(commonApp.IPC_LOCAL_STORAGE_ROOT_GET, (event, arg) => {
      event.returnValue = StorageHelper.getRootValue(arg.key);
    });
    // set root value
    electron.ipcMain.on(commonApp.IPC_LOCAL_STORAGE_ROOT_SET, (event, arg) => {
      event.returnValue = StorageHelper.setRootValue(arg.key, arg.value);
    });
    // get user value
    electron.ipcMain.on(commonApp.IPC_LOCAL_STORAGE_USER_GET, (event, arg) => {
      event.returnValue = StorageHelper.getUserValue(arg.key);
    });
    // set user value
    electron.ipcMain.on(commonApp.IPC_LOCAL_STORAGE_USER_SET, (event, arg) => {
      event.returnValue = StorageHelper.setUserValue(arg.key, arg.value);
    });    
  }

 	//---------------------------------------------------------------------------
  // member
  //--------------------------------------------------------------------------- 
  static getStorage():LocalStorage{
    if( StorageHelper.storage == null ){
      StorageHelper.storage = new LocalStorage();
      StorageHelper.storage.initRoot();
      StorageHelper.init();
    }
    return StorageHelper.storage;
  }  

  static initUser(user){
    var inst = this.getStorage();
    inst.initUser(user);
  }

  static getRootValue(key:string){
    var inst = this.getStorage();
    return inst.getRootValue(key);
  }

  static setRootValue(key:string, value:any){
    var inst = this.getStorage();
    return inst.setRootValue(key, value);
  }
  
  static getUserValue(key:string){
    var inst = this.getStorage();
    return inst.getUserValue(key);
  }

  static setUserValue(key:string, value:any){
    var inst = this.getStorage();
    return inst.setUserValue(key, value);
  }  
}