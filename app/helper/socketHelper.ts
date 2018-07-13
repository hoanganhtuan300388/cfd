/**
 * 
 * websoket data Helper
 * 
 */
import * as electron from 'electron';
import {EventEmitter} from 'events';
import {RetryContext} from '../util/retryContext';
import {Logger} from '../util/logger';

/**
 * events
 * 
 * connect
 * message
 * close
 * socket-error
 * retry-fail
 */

//-----------------------------------------------------------------------------
// SERVICE : SocketHelper
// ----------------------------------------------------------------------------
export class SocketHelper extends EventEmitter{
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------  
  private socket;
  private path:string;
  private host:string;
  private session:string;
  private context:RetryContext;
  private retried    = false;
  private connected  = false;
  private forceClose = false;
  private sendQueue  = [];

  // private connection;
  // private eventEmitter = new EventEmitter();

  //---------------------------------------------------------------------------
  // Protected constructor
  // --------------------------------------------------------------------------	
  constructor(public socketId:any){
    super();
  }

 	//---------------------------------------------------------------------------
  // member
  //--------------------------------------------------------------------------- 

  /**
   * 
   * @param url 
   */
  public connect(host:string, path:string, jsessionid:string):any{
    var self = this;

    this.path = path;
    this.host = host;
    this.session = jsessionid;
    this.forceClose = false;
    this.connected  = false;

    // Logger.system.info(`[SOCKET] connecting socket[${host}/${path}] jsessionid[${jsessionid}]`);

    // connect
    this.socket = require('engine.io-client')(
      host,
      {
        path: `/${path}`,
        query: {
          jsessionid: jsessionid
        }
      }
    );
    
    // open event handler
    this.socket.on('open', function(){
      self.connected = true;
      self.emit('connect', self.retried );

      if(self.retried){
        this.emit('retry-connect');
      }

      // received data.
      self.socket.on('message', function(data){
        Logger.system.debug( '[SOCKET] recv message :' + data);
        self.emit('message', data );
      });

      // socket closed
      self.socket.on('close', function(){
        self.connected = false;
        if(!self.forceClose){
          self.emit('close' );
          self.retrySocket(null);
        }
      });

      self.clearRetry();
      self.sendDataFromQueue();
    });    

    // socket error
    this.socket.on('error', function(error){
      self.emit('socket-error', error );
      self.retrySocket(error);
    });

    return this;
  }

  private sendDataFromQueue(){
    this.sendQueue.forEach(data=>{
      this.send(data);
    });
    this.sendQueue = [];
  }

  /**
   * 
   * @param data 
   */
  public send(data:any){
    if( this.socket && this.socket.readyState == "open"){
      Logger.system.debug('[SOCKET] send data:' + data);
      this.socket.send(data);
    }else{
      Logger.system.debug('[SOCKET] push send data:' + data);
      this.sendQueue.push(data);
    }    
  }

  public close(){
    this.forceClose = true;
    this.connected  = false;
    if(this.socket){
      this.socket.close();
    }
  }

  private clearRetry(){
    this.context = null;
    this.retried = false;
  }

  /**
   * socketの再接続処理。
   * 
   * @param ele 
   */
  private retrySocket(err){
    // jsessionIdの期限切れor不正
    if(err && err.description == 401){
      this.emit('retry-fail', {errorCode:401} );
      this.clearRetry();
      return;
    }

    // 再接続
    if(!this.context){
      this.context = new RetryContext(this.getErrorCode(err));
      this.retried = true;
      this.emit('retry-start');
    }
    
    if(this.context.isRetryOver()){
      // retry count over
      this.emit('retry-fail', {errorCode:this.context.errorCode} );
      this.clearRetry();
    }else{
      // retry query.
      var timeout = this.context.getNextTimeout();
      setTimeout(()=> {
        this.connect(this.host, this.path, this.session);
      }, timeout);
    }

    // LOG ----
    var retry;
    if(this.context){
      retry = 'socket retry-count: ' + this.context.tryCount();
    }
    if(err){
      Logger.system.error( `[SOCKET] socket error : ${err} ${err.description} id[${this.socketId} ${retry}`);
    }else{
      Logger.system.warn( `[SOCKET] socket close : id[${this.socketId} ${retry}`);
    }
  }  

  /**
   * convert CFD error code.
   * 
   * @param err 
   */
  private getErrorCode(err){
    var code;

    if(err){
      switch(err.message){
        case "xhr poll error":{
          if(err.description == 503){
            // connection error
            code = 'CFDS0102Y';
          }else{
            code = 'CFDS0201Y';
          }
        }
        break;

        case "xhr post error":
        code = 'CFDS0202Y';
        break;

        case "websocket error":
        code = 'CFDS0203Y';
        break;

        case "server error":
        code = 'CFDS0204Y';
        break;
      }
    }else{
      // connection error
      code = 'CFDS0102Y';
    }

    return code;
  }

  public isConnected(){
    return this.connected;
  }
  
}
