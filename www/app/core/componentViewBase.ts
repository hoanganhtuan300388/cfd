/**
 * 
 * ComponentViewBase
 * 
 */
import { Component, OnInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { PanelManageService, CommonConst } from "../core/common"
import { ViewBase} from "../core/viewBase"
import { NgForm } from '@angular/forms';

declare var $:any;

//-----------------------------------------------------------------------------
// CLASS : ComponentViewBase
// ----------------------------------------------------------------------------
export class ComponentViewBase extends ViewBase implements OnInit{
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------    
  static _component_sequence = 0;
  public baseIdx:number = 0;
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(public panelMng:PanelManageService,
              public element: ElementRef,
              public changeRef:ChangeDetectorRef)
  {
    super(panelMng, element, changeRef);
  }

  /**
   * init object
   */
  ngOnInit() {
    super.ngOnInit();
    // console.log("ngOnInit " + this.constructor.name);

    // init component
    this.initComponentView();
  }

  /**
   * Init component
   */
  public initComponentView(){
    var hostEle = this.findHostElement();
    var hostId = this.findHostReflect(hostEle);

    if( hostId ){
      var custId = hostId + '.' + ++ComponentViewBase._component_sequence;

      this.element.nativeElement.setAttribute( custId, '' );

      // find parent
      var scrid = hostId.split('.')[0];
      var panel = null;

      scrid = scrid.replace( CommonConst.COMPONENT_PREFIX, CommonConst.PANEL_ID_PREFIX );
      panel = this.panelMng.getPanel( scrid );

      if( panel ){
        var parentView = panel.instance.findMetaComponent( hostId );

        if( parentView ){
          this.parentView( parentView );
          parentView.addChildView( this );
        }

        panel.instance.registMetaComponent( custId, this );
      }
    }
  }

  /**
   * host属性を持つのか確認
   *
   * @param attrs
   * @param prefix
   */
  private hasHostAttr( attrs:any, prefix:string ){
    for( let i=0; i<attrs.length; i++){
      let attr = attrs[i];

      if( attr.name.indexOf(prefix) >= 0){
        return true;
      }
    }

    return false;
  }

  /**
   * host属性名を返す。
   *
   * @param ele
   */
  private findHostReflect( ele:HTMLElement ){
    if( ele ){
      for( let i=0; i<ele.attributes.length; i++){
        let attr = ele.attributes[i];

        if( attr.name.indexOf(CommonConst.COMPONENT_PREFIX) >= 0){
          return attr.name;
        }
      }
    }

    return null;
  }

 /**
  * find host element
  */
  private findHostElement(){
    var ele = this.element.nativeElement.parentElement;

    while( ele ){
      if( this.hasHostAttr(ele.attributes,CommonConst.COMPONENT_PREFIX)){
        break;
      }

      ele = ele.parentElement;
    }

    return ele;
  }

  /**
   * formタグ内controlの単項目チェック結果を返す。
   *
   * @param f form tag
   * @param field form control name
   */
    // 最適化作業
  public isInvalidated(f:NgForm, field:string){
    if( f.submitted && f.controls[field] && f.controls[field].invalid )
      return true;

    return false;
  }
}
