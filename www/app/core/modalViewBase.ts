/**
 * 
 * ModalViewBase
 * 
 */
import { Component, OnInit, Input, ChangeDetectorRef, ElementRef, ViewChild, HostListener } from '@angular/core';
import { PanelManageService, IViewData, IDragDropData, IPanelInfo, CommonConst, CommonEnum, PanelViewBase  } from '../core/common';
import { ViewBase} from "../core/viewBase";

// declare var electron:any;

//-----------------------------------------------------------------------------
// CLASS : ModalViewBase
// ----------------------------------------------------------------------------
export class ModalViewBase extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------    

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(
    public pageId:string,
    public panelMng:PanelManageService,
    public element: ElementRef,
    public changeRef:ChangeDetectorRef)
  {
    super( pageId, panelMng, element, changeRef);
  }

  protected sendDialogResult(result:any){
    var electron = (window as any).electron;
    
    if( electron ){
      var windowHelper = electron.remote.require('./main'); 
      windowHelper.applyCallback( electron.parameter.windowId, result );
    }
  }
}