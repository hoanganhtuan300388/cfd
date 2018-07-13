import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { PartialObserver } from 'rxjs/Observer';

import { EventEmitter } from 'events';

export class Deferred<T> extends Subject<T> {
  private _refCount=0;

  public event = new EventEmitter();

  constructor(private managed?:boolean) {
    super();
  }

  public subscribe(observerOrNext?: PartialObserver<T> | ((value: T) => void), error?: (error: any) => void, complete?: () => void){
    this._refCount++;

    if( this._refCount == 1 ){
      this.event.emit('subscribe');
    }

    var subscription = super.subscribe( arguments[0], error, complete) as any;

    if(this.managed){
      subscription.unsubscribeOrg = subscription.unsubscribe;
      subscription.unsubscribe = ()=>{
        subscription.unsubscribeOrg();
        this._refCount--;
        
        if( this._refCount <= 0 ){
          this.event.emit('unsubscribe');
          super.unsubscribe();
        }
      }
    }

    return subscription;
  }

  public unsubscribe(){
    console.error('unsubscribe is deprecated!!');
    // this._refCount--;

    // if( this._refCount <= 0 ){
    //   this.event.emit('unsubscribe');
    //   super.unsubscribe();
    // }
  }
}