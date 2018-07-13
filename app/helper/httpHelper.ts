/**
 * 
 * HTTPs Helper
 * 
 */
import * as electron from 'electron';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {Logger} from '../util/logger';
import {ERROR_CODE} from '../../common/businessApi'

var xml2json = require('xml2js').parseString;
var querystring = require('querystring');

//-----------------------------------------------------------------------------
// SERVICE : HttpHelper
// ----------------------------------------------------------------------------
export class HttpHelper{
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------  
  private _subject = new Subject();
  private chunk:Buffer = new Buffer('');

  //---------------------------------------------------------------------------
  // Protected constructor
  // --------------------------------------------------------------------------	
  constructor(){   
    // cache clear
    electron.session.defaultSession.clearCache(() => {});    
  }

 	//---------------------------------------------------------------------------
  // member
  //--------------------------------------------------------------------------- 

  /**
   * HTTP get
   */
  public get(url:string): Observable<any> {
    var self = this;

    Logger.system.debug('[GET] ' + url);

    var req = electron.net.request( {
      url:url,
      redirect:'manual'
    } );
  
    req.on('error', (err) => {
      try{
        let msg = {error:ERROR_CODE.NETWORK, statusMessage:err.message};
        Logger.system.debug(`[RES-ERR] query msg (${url})\nrecv msg : ${msg}`);
        self._subject.error(msg);
      }catch(e){
        Logger.system.error(`[RES-ERR] http get error. ${e}`);
      }
    });

    req.on('redirect', function (statusCode:number, method:string, redirectUrl:string, responseHeaders:any) {
      try{
        req.abort();

        self._subject.error({error:ERROR_CODE.HTTP, statusCode:statusCode, location:responseHeaders.location[0]});  
      }catch(e){
        Logger.system.error('http redirect error', e);
      }
    });
    
    req.on('response', (response) => {
      try{
        if( response && response.statusCode ){
          if( this.isValidHttpStatusCode(response.statusCode)){
            // received data body
            response.on('data', (chunk) => {
              self.chunk = Buffer.concat([self.chunk, chunk]);
            })
          
            // no more data in response
            response.on('end', () => {
              try{
                let buf = self.chunk.toString('utf-8');
                Logger.system.debug(`[RES] query msg (${url}) status(${response.statusCode})\nrecv msg : ${buf}`);

                self._subject.next(JSON.parse(buf));
                self._subject.complete();
              }catch(e){
                Logger.system.error('http json parse error', e);
                self._subject.error({error:ERROR_CODE.UNKNOWN, statusMessage:'unknown error'});
              }
            })
          }else if(response.statusCode == 503) {
            Logger.system.error('http status 503 error');
            self._subject.error({error:ERROR_CODE.NETWORK, statusMessage:'http status 503.'});  
          }else{
            self._subject.error({error:ERROR_CODE.HTTP, statusCode:response.statusCode, statusMessage:response.statusMessage});  
          }
        }else{
          self._subject.error({error:ERROR_CODE.UNKNOWN, statusMessage:'unknown error'});
        }
      }catch(e){
        Logger.system.error('http response error', e);
      }
    })

    req.end();

    return this._subject;
  }

  /**
   * HTTP Post
   * 
   * @param url 
   * @param data 
   */
  public post_redirect(url:string, data:{}): Observable<any> {
    var self = this;
    var post_data = querystring.stringify(data);

    Logger.system.debug(`[POST] ${url}`);

    var req = electron.net.request( {
      url:url,
      method: 'POST',
      redirect:'manual',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(post_data)
      }
    });
   
    req.on('error', (err) => {
      try{
        self._subject.error({error:ERROR_CODE.NETWORK, statusMessage:err.message});
      }catch(e){
        Logger.system.error('http post error', e);
      }
    });

    req.on('redirect', function (statusCode:number, method:string, redirectUrl:string, responseHeaders:any) {
      try{
        req.abort();
        Logger.system.debug(`[REQ] redirect url${redirectUrl}`);
        self._subject.next(responseHeaders);
        self._subject.complete();
      }catch(e){
        Logger.system.error('http post error', e);
      }
    });
    
    req.on('response', (response) => {
      try{
        if( response && response.statusCode ){
          if( this.isValidHttpStatusCode(response.statusCode)){
            // received data body
            response.on('data', (chunk) => {
              self.chunk = Buffer.concat([self.chunk, chunk]);
            })
          
            // no more data in response
            response.on('end', () => {
              // convert xml.
              try{
                var buf = self.chunk.toString('utf-8');
                Logger.system.debug(`[RES] query msg (${url}) status(${response.statusCode})\nrecv msg : ${buf}`);
                xml2json(buf, (err, result)=>{
                  self._subject.error(result);
                });
              }catch(e){
                Logger.system.error(`[RES] parse error (${e})`);
                self._subject.error({});
              }
            })
          }else if(response.statusCode == 503) {
            Logger.system.error('http status 503 error');
            self._subject.error({error:ERROR_CODE.NETWORK, statusMessage:'http status 503.'});  
          }else{
            self._subject.next({error:ERROR_CODE.HTTP, statusCode:response.statusCode, statusMessage:response.statusMessage});
            self._subject.complete();
          }
        }else{
          self._subject.error({error:ERROR_CODE.UNKNOWN, statusMessage:'unknown error'});
        }
      }catch(e){
        Logger.system.error('http post error', e);
      }
    })

    // post the data
    req.write(post_data);

    req.end();

    return this._subject;
  }

  public post(url:string, data:{}|string, method:string ): Observable<any> {
    var self = this;
    var str = JSON.stringify(data);
    var post_data = new Buffer(str);

    Logger.system.debug(`[${method}] ${url}\tpost data : ${str}`);
    
    var req = electron.net.request( {
      url:url,
      method: method,
      redirect:'manual',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': post_data.byteLength
      }
    });
   
    req.on('error', (err) => {
      try{
        self._subject.error({error:ERROR_CODE.NETWORK, statusMessage:err.message});
      }catch(e){
        Logger.system.error('http post error', e);
      }
    });

    req.on('redirect', function (statusCode:number, method:string, redirectUrl:string, responseHeaders:any) {
      try{
        req.abort();
        self._subject.next(responseHeaders);
        self._subject.complete();
      }catch(e){
        Logger.system.error('http post error', e);
      }
    });
    
    req.on('response', (response) => {
      try{
        if( response && response.statusCode ){
          if( this.isValidHttpStatusCode(response.statusCode)){
            // received data body
            response.on('data', (chunk) => {
              self.chunk = Buffer.concat([self.chunk, chunk]);
            })
          
            // no more data in response
            response.on('end', () => {
              let buf = self.chunk.toString('utf-8');
              Logger.system.debug(`[RES] query msg (${url}) status(${response.statusCode})\nrecv msg : ${buf}`);
              try{
                self._subject.next(JSON.parse(buf));
                self._subject.complete();
              }catch(e){
                Logger.system.error(`[RES] parse error (${e})`);
                self._subject.error({error:ERROR_CODE.UNKNOWN, statusMessage:'unknown error'});
              }
            })
          }else if(response.statusCode == 503) {
            Logger.system.error('http status 503 error');
            self._subject.error({error:ERROR_CODE.NETWORK, statusMessage:'http status 503.'});  
          }else{  // #3498 405, 502追加
            self._subject.error({error:ERROR_CODE.HTTP, statusCode:response.statusCode, statusMessage:response.statusMessage});  
          }
        }else{
          self._subject.error({error:ERROR_CODE.UNKNOWN, statusMessage:'unknown error'});
        }
      }catch(e){
        Logger.system.error('http post error', e);
      }
    })

    // post the data
    req.write(post_data);

    req.end();

    return this._subject;
  }  

  /**
   * #3444 
   */
  private isValidHttpStatusCode(code:number){
    // APサーバ切断時の挙動
    if( code == 200 || code == 302 || code == 400 || code == 500 ){
      return true;
    }

    return false;
  }
}