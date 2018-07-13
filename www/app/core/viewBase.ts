import { Component, OnInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { PanelManageService, IViewData, IViewState} from "../core/common"

/**
 * ViewBase
 */
export class ViewBase implements OnInit{
  // child view array
  protected _childViews:ViewBase[] = [];
  public _parentView:ViewBase = null;

  constructor( public panelMng:PanelManageService,
               public element: ElementRef,
               public changeRef:ChangeDetectorRef) 
  {
    // console.log("OnCreate " + this.constructor.name);
  }    

  /**
   * init object
   */
  ngOnInit() {
  }

  /**
   * 
   */
  ngOnDestroy(){
    if( this._parentView ){
      this._parentView.removeView( this );
      this._parentView = null;
    }

    this._childViews = [];

    // console.log("OnDestroy " + this.constructor.name);
  }

  /**
   * parent viewを登録する。
   */
  public parentView( view:ViewBase ){
    this._parentView = view;
  }

  /**
   * childviewを登録する。
   */
  public addChildView( view:ViewBase ){
    this._childViews.push( view );
  }

  /**
   * udpate data model & view
   */
  public updateView(){
    setTimeout(()=>{
      try{
        this.changeRef.detectChanges();
      }catch(e){
      }        
    }, 0);
  }

  /**
   * childview参照を削除する。
   */
  public removeView( view:ViewBase ){
    var idx = this._childViews.indexOf( view );

    if( idx >= 0 ){
      this._childViews[idx] = null;
      this._childViews.splice( idx, 1);
    }
  }

  /**
   * view dataの変更を親子viewに通知
   */
  protected sendChangeViewData(data:IViewData, sender:ViewBase, byChild:boolean){
    // send child views.
    this._childViews.filter( view=>view!=sender ).forEach( view=>view.onChangeViewData(data,this,false));

    // send parent view.
    if( byChild && this._parentView ){
      this._parentView.onChangeViewData(data,this,true);
    }    
  }

  /**
   * viewのステータス変更を親子viewに通知
   */
  protected sendChangeViewState(data:IViewState, sender:ViewBase, byChild:boolean){
    // send child views.
    this._childViews.filter( view=>view!=sender ).forEach( view=>view.onChangeViewState(data,this,false));

    // send parent view.
    if( byChild && this._parentView ){
      this._parentView.onChangeViewState(data,this,true);
    }    
  }

  /**
   * view dataの変更発生
   */
  public changeViewData( data:IViewData ){
    this.sendChangeViewData( data, this, true);
  }

  /**
   * view イベント受信
   */
  public changeViewState( data:IViewState ){
    this.sendChangeViewState( data, this, true);
  }

  /**
   * view dataの変更イベントを受信
   */
  public onChangeViewData( data:IViewData, sender:ViewBase, byChild:boolean ){
    this.sendChangeViewData( data, sender, byChild);
  }

  /**
   * view の状態変更イベントを受信
   */
  public onChangeViewState( data:IViewState, sender:ViewBase, byChild:boolean ){
    this.sendChangeViewState( data, sender, byChild);
  }
}