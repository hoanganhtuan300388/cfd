/**
 * 
 * RetryContext
 * 
 */
const MAX_RETRY_TIME = 120000 ;   // 2分
// const MAX_RETRY_TIME = 1000 ;   // 2分

//-----------------------------------------------------------------------------
// RetryContext
// ----------------------------------------------------------------------------
export class RetryContext{
  private totalRetryTime = 0;
  private nextSapn = 0;
  private timeSpan = [()=>this.rand(), 4000, 8000, 16000];

  //---------------------------------------------------------------------------
  //  constructor
  // --------------------------------------------------------------------------	
  constructor( public errorCode?:string ){
  }

 	//---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------   
  public tryCount(){
    return this.nextSapn;
  }

  public isRetryOver(){
    return this.totalRetryTime > MAX_RETRY_TIME;
  }

  public getNextTimeout(){
    var next = Math.min(this.nextSapn++, this.timeSpan.length-1);
    var tm;

    tm = this.timeSpan[next];
    if(typeof tm == 'function'){
      tm = tm();
    }

    this.totalRetryTime += tm;

    return tm;
  }

  /**
   * 1000sec ~ 3000secのランダム
   */
  private rand(){
    var r = (Math.floor(Math.random()*10) + 1)%4;

    r = r==0?3:r;
    
    return r * 1000;
  }
}