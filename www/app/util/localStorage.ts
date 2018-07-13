/**
 * 
 * local storage
 * 
 * 
 */
import * as commonApp from "../../../common/commonApp";

const electron = (window as any).electron;

//-----------------------------------------------------------------------------
// LocalStorage
// ----------------------------------------------------------------------------
export class LocalStorage{
  static instance:LocalStorage;
  
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  protected constructor(){
    this.init();
  }

  //---------------------------------------------------------------------------
  // member
  // --------------------------------------------------------------------------
  static getInstance():LocalStorage{
    if( LocalStorage.instance == null ){
      LocalStorage.instance = new LocalStorage();
      LocalStorage.instance.init();
    }
    return LocalStorage.instance;
  } 

  private init(){

  }

  /**
   * get root value
   * 
   * @param key 
   */
  static getRootValue(key:string){
    if(electron){
      return electron.ipcRenderer.sendSync(commonApp.IPC_LOCAL_STORAGE_ROOT_GET, {key:key});
    }
    return null;
  }

  /**
   * set root value
   * 
   * @param key 
   * @param value 
   */
  static setRootValue(key:string, value:any){
    if(electron){
      return electron.ipcRenderer.sendSync(commonApp.IPC_LOCAL_STORAGE_ROOT_SET, {key:key, value:value});
    }
    return null;
  }
  
  /**
   * get user value
   * 
   * @param key 
   */
  static getUserValue(key:string){
    if(electron){
      return electron.ipcRenderer.sendSync(commonApp.IPC_LOCAL_STORAGE_USER_GET, {key:key});
    }
    return null;
  }

  /**
   * set user value
   * 
   * @param key 
   * @param value 
   */
  static setUserValue(key:string, value:any){
    if(electron){
      return electron.ipcRenderer.sendSync(commonApp.IPC_LOCAL_STORAGE_USER_SET, {key:key, value:value});
    }
    return null;
  }    
}