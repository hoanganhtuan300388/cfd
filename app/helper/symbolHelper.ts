/**
 * 
 * Symbol Helper
 * 
 */
import * as electron from 'electron';
 
import {SocketHelper} from './socketHelper';
import {BusinessHelper} from './businessHelper';
import * as commonApp from '../../common/commonApp';
import {Logger} from '../util/logger';

interface ISubscribe{code:string, subscriber:any[]};

//-----------------------------------------------------------------------------
// SERVICE : SymbolHelper
// ----------------------------------------------------------------------------
export class SymbolHelper{
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------  
  private socket:SocketHelper;
  private symbols:ISubscribe[]= [];

  //---------------------------------------------------------------------------
  // Protected constructor
  // --------------------------------------------------------------------------	
  constructor(){
    
  }

 	//---------------------------------------------------------------------------
  // member
  //--------------------------------------------------------------------------- 
  public init(socket:SocketHelper){
    this.socket = socket;

    this.listen();

    // price
    this.socket.on('message', (data)=>{
      this.onMessage(data);
    })    
  }

  private listen(){
    // reset listener
    electron.ipcMain.removeAllListeners(commonApp.IPC_SYMBOLE_OPEN);
    electron.ipcMain.removeAllListeners(commonApp.IPC_SYMBOLE_CLOSE);
    
    // listen open real tick
    electron.ipcMain.on(commonApp.IPC_SYMBOLE_OPEN, (event, arg) => {
      this.openTick( event.sender, arg );
    })

    // listen close real tick
    electron.ipcMain.on(commonApp.IPC_SYMBOLE_CLOSE, (event, arg) => {
      this.closeTick( event.sender, arg );
    })
  }

  private sendSubscribeSymbols( ){
    var req = {"subscribe": this.getSubscribeSymbols()};
  
    var str = JSON.stringify(req);
          
    this.socket.send(str);
  }

  private getSubscribeSymbols(){
    return this.symbols.map((v)=>{return v.code});
  }

  private openTick( sender:any, code:string ){
    Logger.system.debug('open tick ' + code );

    var sym = this.symbols.find( (ele)=>ele.code == code );

    if( sym ){
      // add subscriber
      sym.subscriber.push(sender);
    }else{
      // need subscribe symbol.
      var info = {code:code, subscriber:[]};
      info.subscriber.push(sender);

      this.symbols.push(info);
      
      this.sendSubscribeSymbols();
    }

    // popupされたWindowが閉じられたら該当Windowを全てクリアする。
    sender.on('destroyed',()=>{
      this.closeTickByDestroyWindow(sender);
    });    
  }

  private closeTick( sender:any, code:string ){
    Logger.system.debug('close tick ' + code );

    for( var i=0; i<this.symbols.length; i++ ){
      var sym = this.symbols[i];

      if( sym.code == code ){
        // remove subscriber.
        for( var j=0; j<sym.subscriber.length; j++){
          var subs = sym.subscriber[j];
          if( subs == sender ){
            sym.subscriber.splice(j,1);
          }
        }

        // remove symbol code.
        if( sym.subscriber.length <= 0){
          this.symbols.splice(i,1);

          // send new subscribe symbol code.
          this.sendSubscribeSymbols();
          return;
        }
      }
    }
  }

  private closeTickByDestroyWindow(sender:any){
    var needUpdate = false;

    for( var i=0; i<this.symbols.length; i++ ){
      var sym = this.symbols[i];

      for( var j=0; j<sym.subscriber.length; j++){
        var subs = sym.subscriber[j];
        if( subs == sender ){
          sym.subscriber.splice(j,1);
        }
      }

      // remove symbol code.
      if( sym.subscriber.length <= 0){
        this.symbols.splice(i,1);

        needUpdate = true;
      }      
    }

    // send new subscribe symbol code.
    if( needUpdate ){
      this.sendSubscribeSymbols();
    }
  }

  // received tick data
  private onMessage(val:any){
    var data = JSON.parse(val);
    var group = [];

    // 銘柄別のグループ
    var getGroup = (code:string)=>{
      let grp = group.find(g=>g.code == code);
      if(!grp){
        grp = {code:code, list:[]};
        group.push(grp);
      }
      return grp;
    };

    // group-by symbole code
    if(data && data[0] == 'price' && Array.isArray(data[1])){
      data[1].forEach((symbol)=>{
        var grp = getGroup(symbol.cfdProductCode);
        grp.list.push(symbol);
      });
    }

    // tickデータを画面側に送信
    group.forEach((grp)=>{
      var symbol = this.symbols.find(sym=>sym.code == grp.code);
      if(symbol&&symbol.subscriber){
        symbol.subscriber.forEach((sender)=>{
          let dat = ['price', grp.list];

          sender.send( commonApp.IPC_SYMBOLE_DATA, dat);
        });
      }
    });
  }

}